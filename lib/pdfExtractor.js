// lib/pdfExtractor.js — FIXED: preserves line/paragraph structure for AI analysis
let pdfjsLib = null;

async function loadPdfJsFromCDN() {
  if (pdfjsLib) return pdfjsLib;

  if (typeof window === 'undefined') {
    throw new Error('PDF processing is only available in the browser');
  }

  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      pdfjsLib = window.pdfjsLib;
      resolve(pdfjsLib);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;

    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        pdfjsLib = window.pdfjsLib;
        resolve(pdfjsLib);
      } else {
        reject(new Error('PDF.js failed to load'));
      }
    };

    script.onerror = () => reject(new Error('Failed to load PDF.js from CDN'));
    document.head.appendChild(script);
  });
}

/**
 * Extracts text from a PDF file while preserving line and paragraph structure.
 * Each text item is placed on its own line when there is a vertical gap,
 * so bylines like "ROMITA HANUMAN-PILLAY" and captions like "Picture: THULI DLAMINI"
 * remain on separate lines and are easy for the AI to identify.
 */
export async function extractTextFromPDF(file) {
  try {
    const pdfjs = await loadPdfJsFromCDN();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // ── Build structured text by tracking vertical position ──────────────
      // PDF items have a `transform` array where index 5 is the Y coordinate.
      // When Y changes significantly we insert a newline, preserving structure.
      const items = textContent.items;
      if (!items.length) continue;

      let pageText = '';
      let lastY = null;
      let lineBuffer = '';

      for (const item of items) {
        if (!item.str) continue;

        const currentY = item.transform ? Math.round(item.transform[5]) : null;

        if (lastY === null) {
          // First item on page
          lineBuffer = item.str;
          lastY = currentY;
        } else if (currentY !== null && Math.abs(currentY - lastY) > 2) {
          // Vertical shift — new line
          pageText += lineBuffer.trim() + '\n';
          lineBuffer = item.str;
          lastY = currentY;
        } else {
          // Same line — join with space only if needed
          const needsSpace =
            lineBuffer.length > 0 &&
            !lineBuffer.endsWith(' ') &&
            !item.str.startsWith(' ');
          lineBuffer += needsSpace ? ' ' + item.str : item.str;
        }
      }

      // Flush remaining buffer
      if (lineBuffer.trim()) {
        pageText += lineBuffer.trim() + '\n';
      }

      // Add a page separator so the AI knows page boundaries
      fullText += `\n--- PAGE ${pageNum} ---\n` + pageText + '\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

export function extractArticleInfo(text) {
  if (!text || typeof text !== 'string') {
    return { headline: '', byline: '', location: '' };
  }

  try {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const headline = lines[0] || '';

    const bylineLine = lines.find((l) => /^by\s+.+/i.test(l));
    const byline = bylineLine ? bylineLine.replace(/^by\s+/i, '').trim() : '';

    const locationMatch = text.match(
      /\b[A-Z][a-z]+(?: [A-Z][a-z]+)*,\s*(?:[A-Z]{2}|[A-Z][a-z]+)\b/
    );
    const location = locationMatch ? locationMatch[0] : '';

    return { headline, byline, location };
  } catch (error) {
    console.error('Error parsing article info:', error);
    return { headline: '', byline: '', location: '' };
  }
}

export function cleanup() {
  pdfjsLib = null;
}