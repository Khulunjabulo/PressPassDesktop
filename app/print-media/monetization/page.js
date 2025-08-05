"use client";
import { useState } from "react";
import Header from "@/components/UI/header";
//import { Badge } from "@/components/ui/badge"

export default function Monetization() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templates = [
    {
      id: 1,
      name: "Headline",
      dimension: "970w x 930 pixels",
      fileSize: "100kb (JPEG, PNG, HTML)",
      price: "Publisher to Quote",
      link: "Payment Link",
      upload: ["Share", "Preview", "View Preview", "Share"],
    },
    {
      id: 2,
      name: "Feed",
      dimension: "970w x 930 pixels",
      fileSize: "100kb (JPEG, PNG, HTML)",
      price: "Publisher to Quote",
      link: "Payment Link",
      upload: ["Share", "Preview", "View Preview", "Share"],
    },
    {
      id: 3,
      name: "Within Article",
      dimension: "970w x 930 pixels",
      fileSize: "100kb (JPEG, PNG, HTML)",
      price: "Publisher to Quote",
      link: "Payment Link",
      upload: ["Share", "Preview", "View Preview", "Share"],
    },
    {
      id: 4,
      name: "Page Wrap 1",
      dimension: "970w x 930 pixels",
      fileSize: "100kb (JPEG, PNG, HTML)",
      price: "Publisher to Quote",
      link: "Payment Link",
      upload: ["Share", "Preview", "View Preview", "Share"],
    },
    {
      id: 5,
      name: "Page Wrap 2",
      dimension: "970w x 930 pixels",
      fileSize: "100kb (JPEG, PNG, HTML)",
      price: "Publisher to Quote",
      link: "Payment Link",
      upload: ["Share", "Preview", "View Preview", "Share"],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Template Grid */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {[1, 2, 3, 4, 5].map((num) => (
            <div
              key={num}
              className={`cursor-pointer rounded-lg border bg-white shadow-sm hover:shadow-lg transition-all ${
                selectedTemplate === num ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setSelectedTemplate(num)}
            >
              <div className="p-4">
                <div className="text-center mb-3">
                  <span className="text-2xl font-bold text-gray-600">
                    {num}
                  </span>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 h-32 flex flex-col justify-between">
                  {/* Template Layout Mockup */}
                  {num === 1 && (
                    <div className="space-y-2">
                      <div className="bg-blue-400 h-6 w-3/4 rounded"></div>
                      <div className="bg-gray-300 h-6 w-3/4 rounded"></div>
                      <div className="bg-gray-300 h-6 w-3/4 rounded"></div>
                    </div>
                  )}
                  {num === 2 && (
                    <div className="space-y-2">
                      <div className="bg-gray-300 h-6 w-3/4 rounded"></div>
                      <div className="bg-blue-400 h-6 w-3/4 rounded"></div>
                      <div className="bg-gray-300 h-6 w-3/4 rounded"></div>
                    </div>
                  )}
                  {num === 3 && (
                    <div className="space-y-2">
                      <div className="bg-gray-300  h-6 w-3/4 rounded"></div>
                      <div className="bg-gray-300  h-6 w-3/4 rounded"></div>
                      <div className="bg-blue-400  h-6 w-3/4 rounded"></div>
                    </div>
                  )}
                  {num === 4 && (
                    <div className="flex gap-2 items-stretch">
                      <div className="flex-1">
                        <div className="bg-gray-300 h-6 w-full rounded mb-1"></div>
                        <div className="space-y-2">
                          <div className="bg-gray-300 h-6 w-full rounded"></div>
                          <div className="bg-gray-300 h-6 w-full rounded"></div>
                        </div>
                      </div>
                      <div className="bg-blue-400 w-6 rounded self-stretch"></div>
                    </div>
                  )}

                  {num === 5 && (
                    <div className="flex gap-2 items-stretch">
                      <div className="flex-1 space-y-2">
                        <div className="bg-gray-300 h-6 w-2/3 rounded"></div>
                        <div className="bg-gray-300 h-6 w-2/3 rounded"></div>
                        <div className="bg-gray-300 h-6 w-2/3 rounded"></div>
                      </div>
                      <div className="bg-blue-400 w-6 rounded self-stretch"></div>
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
                  Link
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  Upload
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

                  <td className="p-4">
                    <div className="flex gap-1"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
