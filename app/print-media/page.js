'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/UI/Header"
import { Footer } from "@/components/UI/Footer"
import { AuthButtons } from "@/components/UI/AuthButtons"

export default function HomePage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow text-center py-16">
        <h1 className="text-5xl font-bold mb-6">Welcome Print media</h1>
        <div className="flex justify-center gap-4">
        </div>
      </main>
    </div>
  )
}
