'use client'

import Link from "next/link"
import { Header } from "@/components/UI/Header"
import { Footer } from "@/components/UI/Footer"
import { AuthButtons } from "@/components/UI/AuthButtons"
import Image from "next/image"

export default function HomePage() {
  return (
    <>
      <Header />
      <AuthButtons />
      <main className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 text-white flex flex-col items-center justify-center px-4">
        <h1 className="text-5xl font-bold mb-4">Welcome to Press Pass</h1>
        
        {/* Logo Image */}
        <div className="mb-8">
          <Image
            src="/PressPass.png"
            alt="Press Pass Logo"
            width={150}
            height={150}
            className="mx-auto"
          />
        </div>

        <p className="text-xl text-blue-100 mb-8">This is the main landing page.</p>

        <div className="flex gap-4">
          <Link href="/news-reader">
            <button className="bg-orange-400 hover:bg-orange-500 text-white font-semibold py-2 px-6 rounded-lg text-lg transition">
              Go to News Reader
            </button>
          </Link>
          <Link href="/print-media">
            <button className="border border-white text-white font-semibold py-2 px-6 rounded-lg text-lg transition hover:bg-white hover:text-blue-700">
              Go to Print Media
            </button>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}

