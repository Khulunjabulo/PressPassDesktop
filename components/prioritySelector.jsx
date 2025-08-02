import React from "react"

export default function PrioritySelector({ priority, setPriority }) {
  return (
    <div className="mb-3">
      <p className="text-xs font-semibold mb-1">Priority level</p>
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => setPriority("Breaking")}
          className={`px-3 py-1.5 rounded-md border text-xs ${priority === "Breaking" ? "bg-red-500 text-white" : "bg-white"}`}
        >
          🔥 BREAKING
        </button>
        <button
          type="button"
          onClick={() => setPriority("Important")}
          className={`px-3 py-1.5 rounded-md border text-xs ${priority === "Important" ? "bg-yellow-400 text-white" : "bg-white"}`}
        >
          ⭐ IMPORTANT
        </button>
      </div>
    </div>
  )
}
