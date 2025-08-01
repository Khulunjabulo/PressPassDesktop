import React from "react"

export default function PrioritySelector({ priority, setPriority }) {
  return (
    <div className="mb-6">
      <p className="text-sm font-semibold mb-2">Priority level</p>
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setPriority("Breaking")}
          className={`px-4 py-2 rounded-md border ${priority === "Breaking" ? "bg-red-500 text-white" : "bg-white"}`}
        >
          🔥 BREAKING
        </button>
        <button
          type="button"
          onClick={() => setPriority("Important")}
          className={`px-4 py-2 rounded-md border ${priority === "Important" ? "bg-yellow-400 text-white" : "bg-white"}`}
        >
          ⭐ IMPORTANT
        </button>
      </div>
    </div>
  )
}
