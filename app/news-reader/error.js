"use client"

import { useEffect } from "react"

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="text-center py-16">
      <h2 className="text-2xl font-bold text-destructive mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-6">We couldn't load the news content. Please try again.</p>
      <button
        onClick={
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  )
}
