import { getDocument, GlobalWorkerOptions, version } from "pdfjs-dist";

// Set the workerSrc using the CDN and the current version
GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

export async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(" ");
    fullText += pageText + "\n";
  }

  return fullText;
}

export function extractArticleInfo(text) {
  const lines = text.split("\n").map(line => line.trim()).filter(Boolean);

  const headline = lines[0] || "";
  const byline = lines.find(line => line.toLowerCase().startsWith("by "))?.replace(/^by /i, "") || "";
  const locationMatch = text.match(/\b[A-Z][a-z]+(?: [A-Z][a-z]+)*,\s*(?:[A-Z]{2}|[a-z]+)\b/);
  const location = locationMatch ? locationMatch[0] : "";

  return { headline, byline, location };
}

