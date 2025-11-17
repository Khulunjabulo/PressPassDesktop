// lib/pdfExtractor.js
let pdfjsLib = null;

// Load PDF.js from CDN
async function loadPdfJsFromCDN() {
  if (pdfjsLib) return pdfjsLib;
  
  if (typeof window === 'undefined') {
    throw new Error('PDF processing is only available in the browser');
  }

  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.pdfjsLib) {
      pdfjsLib = window.pdfjsLib;
      resolve(pdfjsLib);
      return;
    }

    // Load PDF.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    
    script.onload = () => {
      if (window.pdfjsLib) {
        // Set worker
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        pdfjsLib = window.pdfjsLib;
        resolve(pdfjsLib);
      } else {
        reject(new Error('PDF.js failed to load'));
      }
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load PDF.js from CDN'));
    };
    
    document.head.appendChild(script);
  });
}

export async function extractTextFromPDF(file) {
  try {
    // Load PDF.js from CDN
    const pdfjs = await loadPdfJsFromCDN();
    
    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = "";

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Join text items with proper spacing
      const pageText = textContent.items
        .map((item) => item.str)
        .join(" ");
      
      fullText += pageText + "\n";
    }

    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

export function extractArticleInfo(text) {
  if (!text || typeof text !== 'string') {
    return { headline: "", byline: "", location: "" };
  }

  try {
    const lines = text
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean);

    // Extract headline (first non-empty line)
    const headline = lines[0] || "";

    // Extract byline (line starting with "By " or "by ")
    const byline = lines
      .find(line => /^by\s+/i.test(line))
      ?.replace(/^by\s+/i, "")
      .trim() || "";

    // Extract location (City, State or City, Country format)
    const locationMatch = text.match(
      /\b[A-Z][a-z]+(?: [A-Z][a-z]+)*,\s*(?:[A-Z]{2}|[A-Z][a-z]+)\b/
    );
    const location = locationMatch ? locationMatch[0] : "";

    return { headline, byline, location };
  } catch (error) {
    console.error('Error parsing article info:', error);
    return { headline: "", byline: "", location: "" };
  }
}

// Optional: Cleanup function if needed
export function cleanup() {
  pdfjsLib = null;
}