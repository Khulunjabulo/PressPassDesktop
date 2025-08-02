import React from "react"

export default function PreviewToggle({ previewStyle, setPreviewStyle }) {
  return (
    <div className="border-t pt-2">
      <p className="text-xs font-semibold mb-1">Preview</p>
      <div className="flex space-x-2">
        <button
          type="button"
          className={`px-3 py-1.5 rounded-md border text-xs ${previewStyle === "Modern" ? "bg-blue-600 text-white" : "bg-white"}`}
          onClick={() => setPreviewStyle("Modern")}
        >
          Modern
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 rounded-md border text-xs ${previewStyle === "Classic" ? "bg-black text-white" : "bg-white"}`}
          onClick={() => setPreviewStyle("Classic")}
        >
          Classic
        </button>
      </div>
    </div>
  )
}
