import React from "react"

export default function PreviewToggle({ previewStyle, setPreviewStyle }) {
  return (
    <div className="border-t pt-4">
      <p className="text-sm font-semibold mb-2">Preview</p>
      <div className="flex space-x-2">
        <button
          type="button"
          className={`px-4 py-2 rounded-md border ${previewStyle === "Modern" ? "bg-blue-600 text-white" : "bg-white"}`}
          onClick={() => setPreviewStyle("Modern")}
        >
          Modern
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded-md border ${previewStyle === "Classic" ? "bg-black text-white" : "bg-white"}`}
          onClick={() => setPreviewStyle("Classic")}
        >
          Classic
        </button>
      </div>
    </div>
  )
}
