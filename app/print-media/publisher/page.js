"use client";

import Header from "@/components/UI/header";
import PublisherSidebar from "@/components/UI/publisherSidebar.jsx";
import UploadForm from "@/components/uploadForm";
import usePrintMediaLogic from "@/hooks/PrintMediaLogic";

export default function Publisher() {
  const { submissionStatus, handleFormSubmit } = usePrintMediaLogic();

  return (
    <>
      <Header />
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        <PublisherSidebar />

        {/* Main Content */}
        <main className="flex-1 p-4 overflow-y-auto">
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

          {/* Upload Form */}
          <UploadForm onSubmit={handleFormSubmit} />
        </main>
      </div>
    </>
  );
}
