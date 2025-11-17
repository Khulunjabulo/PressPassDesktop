// components/PdfArticleViewer.jsx
'use client';

import { useState } from 'react';
import { Download, Eye, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';

export default function PdfArticleViewer({ article }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState('embed'); // 'embed' or 'download'

  if (!article.isPdfArticle || !article.pdfUrl) {
    return null;
  }

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = article.pdfUrl;
    link.download = article.pdfFileName || 'article.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenNewTab = () => {
    window.open(article.pdfUrl, '_blank');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="w-full bg-white">
      {/* PDF Header Info */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Eye className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">
                  PDF Document
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-2">{article.title}</h1>
              {article.description && (
                <p className="text-blue-100 text-sm leading-relaxed">
                  {article.description}
                </p>
              )}
            </div>
          </div>

          {/* PDF Metadata */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-blue-100">
            <div>
              <span className="font-semibold">Author:</span> {article.author}
            </div>
            <div>
              <span className="font-semibold">File:</span> {article.pdfFileName}
            </div>
            <div>
              <span className="font-semibold">Size:</span>{' '}
              {(article.pdfSize / 1024 / 1024).toFixed(2)} MB
            </div>
            <div>
              <span className="font-semibold">Category:</span> {article.category}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-gray-100 p-4 border-b border-gray-300">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </button>

          <button
            onClick={handleOpenNewTab}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in New Tab
          </button>

          <button
            onClick={toggleFullscreen}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 mr-2" />
                Exit Fullscreen
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 mr-2" />
                Fullscreen View
              </>
            )}
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900' : 'max-w-4xl mx-auto my-6'}`}>
        {isFullscreen && (
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={toggleFullscreen}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className={`${isFullscreen ? 'h-full' : 'h-[800px]'} w-full bg-gray-100 rounded-lg overflow-hidden shadow-lg`}>
          <iframe
            src={article.pdfUrl}
            className="w-full h-full border-0"
            title={article.title}
            type="application/pdf"
          />
        </div>
      </div>

      {/* Fallback message for browsers that don't support PDF embed */}
      <div className="max-w-4xl mx-auto my-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> If the PDF doesn't display above, please use the download button 
          or open in a new tab to view the document.
        </p>
      </div>
    </div>
  );
}