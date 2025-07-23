import React from "react"

export default function FileUpload({ setFile, uploadProgress }) {
  return (
    <div className="border border-gray-300 rounded-md p-6 mb-6 text-center bg-gray-50">
      <p className="text-sm text-gray-500 mb-2">Drop PDF file here or click browse</p>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="block mx-auto mt-2"
      />
      {uploadProgress && (
        <p className="text-xs text-blue-600 mt-2">Uploading: {uploadProgress}%</p>
      )}
    </div>
  )
}
