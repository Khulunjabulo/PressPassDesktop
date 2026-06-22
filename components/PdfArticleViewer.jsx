// components/PdfArticleViewer.jsx
'use client';

import { useState } from 'react';
import { Download, ExternalLink, Maximize2, Minimize2, FileText, AlertCircle } from 'lucide-react';

export default function PdfArticleViewer({ article }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [embedError, setEmbedError] = useState(false);

  if (!article.isPdfArticle || !article.pdfUrl) return null;

  // ✅ Cloudinary PDFs can't be iframed directly (Content-Disposition: attachment)
  // Google Docs viewer works with ANY public URL including Cloudinary
  const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(article.pdfUrl)}&embedded=true`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = article.pdfUrl;
    link.download = article.pdfFileName || 'article.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenNewTab = () => {
    window.open(article.pdfUrl, '_blank', 'noopener,noreferrer');
  };

  const fileSizeMb = article.pdfSize
    ? (article.pdfSize / 1024 / 1024).toFixed(2) + ' MB'
    : null;

  return (
    <div className="w-full bg-white">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-2 text-blue-200 text-sm font-semibold uppercase tracking-wide">
            <FileText className="w-5 h-5" />
            PDF Document
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{article.title}</h1>
          {article.description && (
            <p className="text-blue-100 text-sm leading-relaxed">{article.description}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-blue-100">
            {article.author   && <span><strong>Author:</strong> {article.author}</span>}
            {article.pdfFileName && <span><strong>File:</strong> {article.pdfFileName}</span>}
            {fileSizeMb       && <span><strong>Size:</strong> {fileSizeMb}</span>}
            {article.category && <span><strong>Category:</strong> {article.category}</span>}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="bg-gray-100 border-b border-gray-300 p-4">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-3">
          <button onClick={handleDownload}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm">
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </button>
          <button onClick={handleOpenNewTab}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
            <ExternalLink className="w-4 h-4 mr-2" /> Open in New Tab
          </button>
          <button onClick={() => setIsFullscreen(f => !f)}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm">
            {isFullscreen
              ? <><Minimize2 className="w-4 h-4 mr-2" /> Exit Fullscreen</>
              : <><Maximize2 className="w-4 h-4 mr-2" /> Fullscreen View</>}
          </button>
        </div>
      </div>

      {/* PDF embed — Google Docs viewer wraps the Cloudinary URL */}
      <div className={isFullscreen
        ? 'fixed inset-0 z-50 bg-gray-900 flex flex-col'
        : 'max-w-4xl mx-auto my-6 px-4'}>

        {isFullscreen && (
          <div className="flex items-center justify-between bg-gray-800 px-4 py-2 text-white text-sm">
            <span className="truncate">{article.title}</span>
            <button onClick={() => setIsFullscreen(false)}
              className="flex items-center gap-1 px-3 py-1 bg-red-600 rounded hover:bg-red-700 transition-colors ml-4 flex-shrink-0">
              <Minimize2 className="w-4 h-4" /> Exit
            </button>
          </div>
        )}

        {!embedError ? (
          <iframe
            key={googleDocsViewerUrl}
            src={googleDocsViewerUrl}
            className={`w-full border-0 rounded-lg shadow-lg bg-gray-100 ${
              isFullscreen ? 'flex-1' : 'h-[800px]'
            }`}
            title={article.title}
            onError={() => setEmbedError(true)}
            allow="fullscreen"
          />
        ) : (
          /* Fallback if Google Docs viewer also fails */
          <div className="h-64 flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
            <AlertCircle className="w-10 h-10 text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium mb-1">PDF preview unavailable</p>
            <p className="text-gray-400 text-sm mb-4">Use the buttons above to download or open the PDF</p>
            <button onClick={handleOpenNewTab}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
              <ExternalLink className="w-4 h-4 mr-2" /> Open PDF
            </button>
          </div>
        )}
      </div>

      {/* Helper note */}
      {!embedError && (
        <div className="max-w-4xl mx-auto mb-6 px-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              If the PDF doesn't display, click <strong>Open in New Tab</strong> or <strong>Download PDF</strong> above.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}