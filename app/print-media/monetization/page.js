"use client";
import { useState } from "react";
import Header from "@/components/UI/header";
import { FileText, Users, Megaphone, LayoutDashboard } from "lucide-react";
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
  const [selectedTemplateForSubmit, setSelectedTemplateForSubmit] =
    useState(null);
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
    // Set the selected template for submission
    setSelectedTemplateForSubmit(template);
    // Open the submit confirmation overlay
    setIsSubmitOverlayOpen(true);
    // This is where you would implement the submit logic
    console.log("Submitting template:", template);
  };
  const handleConfirmSubmit = async (template) => {
    // This is where you would implement the actual submit logic
    console.log("Submitting template:", template);
    // For now, we'll just simulate a successful submission
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Template submitted successfully!");
        // Close the overlay
        setIsSubmitOverlayOpen(false);
        resolve();
      }, 1000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header publisher={publisher} />
      <h1 className="text-center text-xl font bold">
        Click on any of the templates to see where to place your ad!
      </h1>
      {/* Body Layout: Sidebar under header */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md border-r flex flex-col">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Menu</h2>
            <ul className="space-y-4">
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

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Template Grid */}
          <div className="grid grid-cols-5 gap-4 mb-8">
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
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="w-full">
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

                    {/* Payment Link → navigates to /payment/[id] */}
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

      <PrintMediaFooter/>
    </div>
  );
}
