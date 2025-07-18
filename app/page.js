// app/page.js
'use client'

import Link from "next/link"
import { Header } from "@/components/UI/Header"
import { Footer } from "@/components/UI/Footer"
import { AuthButtons } from "@/components/UI/AuthButtons"

export default function HomePage() {
  return (
    <>
      <Header />
      <AuthButtons />
      <main className="text-center py-16">
        <h1 className="text-5xl font-bold mb-6">Welcome to Press Pass</h1>
        <p className="text-xl text-muted-foreground mb-8">This is the main landing page.</p>
        <div className="flex justify-center gap-4">
          <Link href="/news-reader">
            <button size="lg">Go to News Reader</button>
          </Link>
          <Link href="/print-media">
            <button size="lg" variant="outline">Go to Print Media</button>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
