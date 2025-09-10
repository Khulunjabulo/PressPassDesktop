"use client";
import { useState } from "react";
import Header from "@/components/UI/header";
import { FileText, Users, Megaphone, LayoutDashboard, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/UI/Button";
import AdUploadOverlay from "@/components/AdUploadOverlay";
import SubmitConfirmationOverlay from "@/components/SubmitConfirmationOverlay";
import { useCurrentPublisher } from "@/hooks/useCurrentPublisher";
import PrintMediaFooter from '@/components/UI/PrintMediaFooter';

export default function Monetization() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isUploadOverlayOpen, setIsUploadOverlayOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [isSubmitOverlayOpen, setIsSubmitOverlayOpen] = useState(false);
  const [selectedTemplateForSubmit, setSelectedTemplateForSubmit] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { publisher, loading } = useCurrentPublisher("currentPublisherId");

  const templates = [
    {
      id: 1,
      name: "Headline",
      dimension: "300w x 250h(px)",
      fileSize: "100kb (JPEG, PNG, HTML)",
      price: "Publisher to Quote",
      link: "Payment Link",
      upload: "Upload",
      button: "Submit",
    },
    {
      id: 2,
      name: "Feed",
      dimension: "250w x 250h(px)",
      fileSize: "100kb (JPEG, PNG, HTML)",
      price: "Publisher to Quote",
      link: "Payment Link",
      upload: "Upload",
      button: "Submit",
    },
    {
      id: 3,
      name: "Within Article",
      dimension: "300w x 250h(px)",
      fileSize: "100kb (JPEG, PNG, HTML)",
      price: "Publisher to Quote",
      link: "Payment Link",
      upload: "Upload",
      button: "Submit",
    },
    {
      id: 4,
      name: "Page Wrap 1",
      dimension: "200w x 200h(px)",
      fileSize: "100kb (JPEG, PNG, HTML)",
      price: "Publisher to Quote",
      link: "Payment Link",
      upload: "Upload",
      button: "Submit",
    },
    {
      id: 5,
      name: "Page Wrap 2",
      dimension: "200w x 200h(px)",
      fileSize: "100kb (JPEG, PNG, HTML)",
      price: "Publisher to Quote",
      link: "Payment Link",
      upload: "Upload",
      button: "Submit",
    },
  ];

  const handleOpenUploadOverlay = (templateId) => {
    setSelectedTemplateId(templateId);
    setIsUploadOverlayOpen(true);
  };

  const handleUpload = async (file) => {
    // This is where you would implement the actual file upload logic
    // For now, we'll just log the file and show a success message
    console.log("Uploading file for template:", selectedTemplateId, file);

    // Simulate upload process
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("File uploaded successfully!");
        resolve();
      }, 1000);
    });
  };

  const handleSubmit = (template) => {
    setSelectedTemplateForSubmit(template);
    setIsSubmitOverlayOpen(true);
    console.log("Submitting template:", template);
  };
  const handleConfirmSubmit = async (template) => {
    console.log("Submitting template:", template);
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Template submitted successfully!");
        setIsSubmitOverlayOpen(false);
        resolve();
      }, 1000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header publisher={publisher} />
      <h1 className="text-center text-lg sm:text-xl font-bold my-4 px-2">
        Click on any of the templates to see where to place your ad!
      </h1>
      {/* Burger menu button for mobile */}
      <div className="md:hidden flex items-center px-4 mb-2">
        <button
          className="p-2 rounded-md bg-white shadow"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>
      <div className="flex flex-col md:flex-row flex-1 w-full">
        {/* Sidebar */}
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-64 bg-white shadow-md border-r flex-col">
          <div className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Menu</h2>
            <ul className="space-y-2 md:space-y-4">
              <li>
                <Link
                  href="/print-media/monetization/publish"
                  className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
                >
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span>Publish with us</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/print-media/monetization/partner"
                  className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
                >
                  <Users className="w-5 h-5 text-gray-500" />
                  <span>Partner with us</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/print-media/monetization/advertise"
                  className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
                >
                  <Megaphone className="w-5 h-5 text-gray-500" />
                  <span>Advertise with us</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/print-media/monetization/dashboard"
                  className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
                >
                  <LayoutDashboard className="w-5 h-5 text-gray-500" />
                  <span>Dashboard</span>
                </Link>
              </li>
            </ul>
          </div>
        </aside>
        {/* Mobile sidebar drawer */}
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-30 z-40"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu overlay"
            />
            <aside className="fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50 flex flex-col animate-slide-in">
              <button
                className="absolute top-4 right-4 bg-gray-100 rounded-full p-1"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                type="button"
              >
                <X size={24} />
              </button>
              <div className="p-4 md:p-6 mt-10">
                <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Menu</h2>
                <ul className="space-y-2 md:space-y-4">
                  <li>
                    <Link
                      href="/print-media/monetization/publish"
                      className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
                      onClick={() => setMenuOpen(false)}
                    >
                      <FileText className="w-5 h-5 text-gray-500" />
                      <span>Publish with us</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/print-media/monetization/partner"
                      className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Users className="w-5 h-5 text-gray-500" />
                      <span>Partner with us</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/print-media/monetization/advertise"
                      className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Megaphone className="w-5 h-5 text-gray-500" />
                      <span>Advertise with us</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/print-media/monetization/dashboard"
                      className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
                      onClick={() => setMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-5 h-5 text-gray-500" />
                      <span>Dashboard</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 p-2 sm:p-4 md:p-6">
          {/* Template Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`cursor-pointer rounded-lg border bg-white shadow-sm hover:shadow-lg transition-all ${
                  selectedTemplate === template.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() =>
                  router.push(
                    `/print-media/monetization/advertise/ad-demo-article?templateId=${template.id}`
                  )
                }
              >
                <div className="p-4">
                  <div className="text-center mb-3">
                    <span className="text-2xl font-bold text-gray-600">
                      {template.id}
                    </span>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4 h-32 flex flex-col justify-between">
                    {template.id === 1 && (
                      <div className="space-y-2">
                        <div className="bg-blue-400 h-6 w-3/4 rounded"></div>
                        <div className="bg-gray-300 h-6 w-3/4 rounded"></div>
                        <div className="bg-gray-300 h-6 w-3/4 rounded"></div>
                      </div>
                    )}
                    {template.id === 2 && (
                      <div className="space-y-2">
                        <div className="bg-gray-300 h-6 w-3/4 rounded"></div>
                        <div className="bg-blue-400 h-6 w-3/4 rounded"></div>
                        <div className="bg-gray-300 h-6 w-3/4 rounded"></div>
                      </div>
                    )}
                    {template.id === 3 && (
                      <div className="space-y-2">
                        <div className="bg-gray-300 h-6 w-3/4 rounded"></div>
                        <div className="bg-gray-300 h-6 w-3/4 rounded"></div>
                        <div className="bg-blue-400 h-6 w-3/4 rounded"></div>
                      </div>
                    )}
                    {template.id === 4 && (
                      <div className="flex gap-2 items-stretch">
                        <div className="flex-1">
                          <div className="bg-gray-300 h-6 w-full rounded mb-1"></div>
                          <div className="space-y-2">
                            <div className="bg-gray-300 h-6 w-full rounded"></div>
                            <div className="bg-gray-300 h-6 w-full rounded"></div>
                          </div>
                        </div>
                        <div className="flex flex-col w-6 gap-1">
                          <div className="bg-blue-400 flex-1 rounded"></div>
                          <div className="bg-gray-300 flex-1 rounded"></div>
                        </div>
                      </div>
                    )}
                    {template.id === 5 && (
                      <div className="flex gap-2 items-stretch">
                        <div className="flex-1">
                          <div className="bg-gray-300 h-6 w-full rounded mb-1"></div>
                          <div className="space-y-2">
                            <div className="bg-gray-300 h-6 w-full rounded"></div>
                            <div className="bg-gray-300 h-6 w-full rounded"></div>
                          </div>
                        </div>
                        <div className="flex flex-col w-6 gap-1">
                          <div className="bg-gray-300 flex-1 rounded"></div>
                          <div className="bg-blue-400 flex-1 rounded"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-700">#</th>
                  <th className="text-left p-4 font-medium text-gray-700">
                    Banner
                  </th>
                  <th className="text-left p-4 font-medium text-gray-700">
                    Dimension
                  </th>
                  <th className="text-left p-4 font-medium text-gray-700">
                    File Size
                  </th>
                  <th className="text-left p-4 font-medium text-gray-700">
                    Price
                  </th>
                  <th className="text-left p-4 font-medium text-gray-700">
                    Upload
                  </th>
                  <th className="text-left p-4 font-medium text-gray-700">
                    Submit
                  </th>
                  <th className="text-left p-4 font-medium text-gray-700">
                    Link
                  </th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <tr key={template.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{template.id}</td>
                    <td className="p-4">{template.name}</td>
                    <td className="p-4 text-sm text-gray-600">
                      {template.dimension}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {template.fileSize}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {template.price}
                    </td>
                    {/* Upload Link */}
                    <td
                      className="p-4 text-blue-600 underline cursor-pointer"
                      onClick={() => handleOpenUploadOverlay(template.id)}
                    >
                      {template.upload}
                    </td>
                    {/* Submit Button */}
                    <td className="p-4">
                      <Button
                        variant="default"
                        onClick={() => handleSubmit(template)}
                      >
                        Submit
                      </Button>
                    </td>
                    {/* Payment Link */}
                    <td className="p-4 text-blue-600 underline cursor-pointer">
                      <Link href={`/print-media/monetization/payment/${template.id}`}>
                        {template.link}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
      <AdUploadOverlay
        isOpen={isUploadOverlayOpen}
        onClose={() => setIsUploadOverlayOpen(false)}
        onUpload={handleUpload}
      />
      <SubmitConfirmationOverlay
        isOpen={isSubmitOverlayOpen}
        onClose={() => setIsSubmitOverlayOpen(false)}
        onSubmit={() => handleConfirmSubmit(selectedTemplateForSubmit)}
      />
      <PrintMediaFooter />
      {/* Slide-in animation for sidebar */}
      <style jsx global>{`
        @keyframes slide-in {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}
