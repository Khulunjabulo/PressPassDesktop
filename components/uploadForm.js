import React, { useState } from "react"
import FileUpload from "./fileUpload"
import PrioritySelector from "./prioritySelector"
import PreviewToggle from "./previviewToogle"
import { storage } from "../Firebase/firebase"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"

export default function UploadForm({ onSubmit }) {
  const [priority, setPriority] = useState(null)
  const [previewStyle, setPreviewStyle] = useState("Modern")
  const [file, setFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(null)
  const [uploadError, setUploadError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploadError("")
    
    const formData = Object.fromEntries(new FormData(e.target))
    formData.priority = priority
    formData.previewStyle = previewStyle

    if (file) {
      // Validate file before upload
      if (file.type !== "application/pdf") {
        setUploadError("Please select a valid PDF file")
        return
      }

      const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`)
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(progress.toFixed(0))
        },
        (error) => {
          console.error("Upload error:", error)
          setUploadError(`Upload failed: ${error.message}`)
          setUploadProgress(null)
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref)
            formData.pdfUrl = url
            formData.fileName = file.name
            formData.fileSize = file.size
            setUploadProgress(null)
            onSubmit(formData)
          } catch (error) {
            console.error("Error getting download URL:", error)
            setUploadError("Failed to get file URL")
            setUploadProgress(null)
          }
        }
      )
    } else {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 w-full">
      <h2 className="text-xl font-bold mb-4 text-center">Document Upload</h2>

      <FileUpload setFile={setFile} uploadProgress={uploadProgress} />

      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input name="headline" placeholder="Enter headline..." className="border p-3 rounded-md w-full" />
        <input name="byline" placeholder="Byline Name" className="border p-3 rounded-md w-full" />
        <input name="location" placeholder="City/Town" className="border p-3 rounded-md w-full" />
        <select name="section" className="border p-3 rounded-md w-full">
          <option>Select Section</option>
          <option>Politics</option>
          <option>Business</option>
        </select>
        <select name="edition" className="border p-3 rounded-md w-full">
          <option>Morning Edition</option>
          <option>Evening Edition</option>
        </select>
      </div>

      <PrioritySelector priority={priority} setPriority={setPriority} />

      <textarea name="lead" placeholder="Write the lead paragraph..." className="w-full border p-3 rounded-md mb-4" rows="2" />
      <textarea name="body" placeholder="Continue with the article body..." className="w-full border p-3 rounded-md mb-6" rows="5" />

      <div className="flex justify-between mb-6">
        <button type="button" className="bg-blue-900 text-white px-6 py-2 rounded-md">SAVE DRAFT</button>
        <button type="submit" className="bg-yellow-400 text-black font-semibold px-6 py-2 rounded-md">SUBMIT FOR REVIEW</button>
        <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded-md">PUBLISH NOW</button>
      </div>

      <PreviewToggle previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} />
    </form>
  )
}
