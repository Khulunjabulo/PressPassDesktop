"use client";

import { useState } from 'react';
import Header from "@/components/UI/header";
import PublisherSidebar from "@/components/UI/publisherSidebar.jsx";
import UploadForm from "@/components/uploadForm";
import ManualArticleForm from "@/components/ManualArticleForm";
import usePrintMediaLogic from "@/hooks/PrintMediaLogic";
import { useCurrentPublisher } from "@/hooks/useCurrentPublisher";
import PrintMediaFooter from '@/components/UI/PrintMediaFooter';

export default function Publisher() {
  const { submissionStatus, handleFormSubmit } = usePrintMediaLogic();
  const [showManualUpload, setShowManualUpload] = useState(false);
  const [articleSubmissionStatus, setArticleSubmissionStatus] = useState(null);
  const { publisher, loading } = useCurrentPublisher("currentPublisherId");

  // Handle manual article submission
  const handleManualArticleSubmit = async (formData) => {
    try {
      setArticleSubmissionStatus({ type: 'loading', message: 'Publishing article...' });
      const response = await fetch('/api/publish-article', {
        method: 'POST',
        body: formData,
        headers: {},
      });
      const result = await response.json();
      if (result.success) {
        setArticleSubmissionStatus({
          type: 'success',
          message: result.message
        });
        setTimeout(() => {
          setShowManualUpload(false);
          setArticleSubmissionStatus(null);
        }, 2000);
      } else {
        setArticleSubmissionStatus({
          type: 'error',
          message: result.error || 'Failed to publish article'
        });
      }
    } catch (error) {
      setArticleSubmissionStatus({
        type: 'error',
        message: 'Network error. Please try again.'
      });
    }
  };

  // Handle opening manual upload form
  const handleOpenManualUpload = () => {
    setShowManualUpload(true);
    setArticleSubmissionStatus(null);
  };

  // Handle closing manual upload form
  const handleCloseManualUpload = () => {
    setShowManualUpload(false);
    setArticleSubmissionStatus(null);
  };

  return (
    <>
      <Header publisher={publisher} />
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row overflow-hidden">
        <PublisherSidebar onManualUploadClick={handleOpenManualUpload} />

        {/* Main Content */}
        <main className="flex-1 p-2 sm:p-4 md:p-6 bg-gray-50 overflow-y-auto">
          <div className="w-full max-w-2xl mx-auto">
            {/* Status Messages */}
            {submissionStatus && (
              <div
                className={`mb-6 p-4 rounded-md ${
                  submissionStatus.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                <p className="font-medium">{submissionStatus.message}</p>
              </div>
            )}

            {/* Article Submission Status */}
            {articleSubmissionStatus && (
              <div
                className={`mb-6 p-4 rounded-md ${
                  articleSubmissionStatus.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : articleSubmissionStatus.type === "error"
                    ? "bg-red-50 border border-red-200 text-red-700"
                    : "bg-blue-50 border border-blue-200 text-blue-700"
                }`}
              >
                <p className="font-medium">{articleSubmissionStatus.message}</p>
              </div>
            )}

            {/* Upload Form */}
            <UploadForm onSubmit={handleFormSubmit} />
          </div>
        </main>
      </div>

      {/* Manual Article Upload Modal */}
      {showManualUpload && (
        <ManualArticleForm
          onSubmit={handleManualArticleSubmit}
          onClose={handleCloseManualUpload}
        />
      )}

      <PrintMediaFooter />
    </>
  );
}