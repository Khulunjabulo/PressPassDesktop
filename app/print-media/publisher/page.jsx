"use client";

import { useState } from 'react';
import Header from "@/components/UI/header";
import PublisherSidebar from "@/components/UI/publisherSidebar.jsx";
import UploadForm from "@/components/uploadForm";
import usePrintMediaLogic from "@/hooks/PrintMediaLogic";
import { useCurrentPublisher } from "@/hooks/useCurrentPublisher";
import PrintMediaFooter from '@/components/UI/PrintMediaFooter';

export default function Publisher() {
  const { submissionStatus } = usePrintMediaLogic();
  const [showManualUpload, setShowManualUpload] = useState(false);
  const [articleSubmissionStatus, setArticleSubmissionStatus] = useState(null);
  const { publisher, loading } = useCurrentPublisher("currentPublisherId");

  const handleManualArticleSubmit = async (formData) => {
    try {
      setArticleSubmissionStatus({ type: 'loading', message: 'Publishing article...' });
      const response = await fetch('/api/publish-article', {
        method: 'POST',
        body: formData instanceof FormData ? formData : JSON.stringify(formData),
        headers: formData instanceof FormData ? {} : { "Content-Type": "application/json" }
      });
      const result = await response.json();
      if (result.success) {
        setArticleSubmissionStatus({ type: 'success', message: result.message });
        setTimeout(() => {
          setShowManualUpload(false);
          setArticleSubmissionStatus(null);
        }, 2000);
      } else {
        setArticleSubmissionStatus({ type: 'error', message: result.error || 'Failed to publish article' });
      }
    } catch (error) {
      setArticleSubmissionStatus({ type: 'error', message: 'Network error. Please try again.' });
    }
  };

  return (
    <>
      <Header publisher={publisher} />

      {/*
        flex-row: sidebar + main sit side by side
        min-h-screen: page fills viewport
        NO overflow-hidden here — that would clip the sticky sidebar
      */}
      <div className="flex flex-row min-h-screen bg-gray-50">
        <PublisherSidebar onManualUploadClick={() => setShowManualUpload(true)} />

        {/* Main content scrolls independently */}
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 bg-gray-50">
          <div className="w-full max-w-2xl mx-auto">

            {submissionStatus && (
              <div className={`mb-6 p-4 rounded-md ${
                submissionStatus.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}>
                <p className="font-medium">{submissionStatus.message}</p>
              </div>
            )}

            {articleSubmissionStatus && (
              <div className={`mb-6 p-4 rounded-md ${
                articleSubmissionStatus.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : articleSubmissionStatus.type === "error"
                  ? "bg-red-50 border border-red-200 text-red-700"
                  : "bg-blue-50 border border-blue-200 text-blue-700"
              }`}>
                <p className="font-medium">{articleSubmissionStatus.message}</p>
              </div>
            )}

            <UploadForm onSubmit={handleManualArticleSubmit} />
          </div>
        </main>
      </div>

      {showManualUpload && (
        <ManualArticleForm
          onSubmit={handleManualArticleSubmit}
          onClose={() => setShowManualUpload(false)}
        />
      )}

      <PrintMediaFooter />
    </>
  );
}