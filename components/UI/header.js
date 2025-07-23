"use client"

import Image from "next/image"
import Link from "next/link"
import { Home, Newspaper, DollarSign, Wallet } from "lucide-react"

export default function Header() {
  return (
    <header className="bg-blue-400 px-4 py-3 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center">
        <Image
          src="/isolezwe.png" 
          alt="Isolezwe Logo"
          width={120}
          height={40}
          className="object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="flex space-x-6 text-white font-medium">
        <Link href="/" className="flex flex-col items-center hover:text-gray-100">
          <Home size={20} />
          <span className="text-sm">Home</span>
        </Link>
        <Link href="/publisher" className="flex flex-col items-center hover:text-gray-100">
          <Newspaper size={20} />
          <span className="text-sm">Publisher</span>
        </Link>
        <Link href="/monetization" className="flex flex-col items-center hover:text-gray-100">
          <DollarSign size={20} />
          <span className="text-sm">Monetization</span>
        </Link>
        <Link href="/wallet" className="flex flex-col items-center hover:text-gray-100">
          <Wallet size={20} />
          <span className="text-sm">Wallet</span>
        </Link>
      </nav>
    </header>
  )
}
