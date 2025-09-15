'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BarChart,
  User,
  Users,
  Newspaper,
  Activity,
  Grid,
  Menu,
  X
} from "lucide-react"
import { useEffect, useState } from "react"

export default function PublisherSidebar() {
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'))
    if (user) setCurrentUser(user)
  }, [])

  const menuItems = [
    { name: 'OVERVIEW', icon: <LayoutDashboard size={16} />, href: '/print-media/overview' },
    { name: 'CONTENT ANALYSIS', icon: <BarChart size={16} />, href: '/print-media/content-analysis' },
    { name: 'DASHBOARD', icon: <Grid size={16} />, href: '/print-media/dashboard' },
    { name: 'JOURNALIST', icon: <User size={16} />, href: '/print-media/journalist' },
    { name: 'SUBSCRIBERS', icon: <Users size={16} />, href: '/print-media/subscribers' },
    { name: 'RSS FEED', icon: <Newspaper size={16} />, href: '/print-media/rss-feeds' },
    { name: 'ADVANCED ANALYTICS', icon: <Activity size={16} />, href: '/print-media/advanced-analytics' },
  ]

  const SidebarContent = (
    <div className="flex flex-col h-full">
      <div className="mt-6 ml-12">
        <img
          src="/press-pass.png"
          alt="PressPass Logo"
          width={100}
          height={50}
          className="object-contain"
        />
      </div>
      <nav className="px-6 mt-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setOpen(false)} // close sidebar on mobile after click
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
      {/* Profile block */}
      <div className="mt-auto px-6 pb-6">
        <Link href="/print-media/profile" className="bg-gray-100 p-4 rounded-lg flex items-center space-x-3">
          {currentUser && currentUser.profilePicture ? (
            <img
              src={currentUser.profilePicture}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
              {currentUser ? currentUser.firstName.charAt(0).toUpperCase() : 'DH'}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold">
              {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Daniel Hoppes'}
            </p>
            <p className="text-xs text-gray-500">
              {currentUser ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : 'Editor-in-Chief'}
            </p>
          </div>
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Burger menu button for mobile, fixed top left */}
      <button
        className="md:hidden absolute top-16 left-1 p-4 z-50"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
        type="button"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar for desktop */}
      <aside className="hidden md:flex w-64 bg-white shadow-md h-screen flex-col fixed left-0 top-0 z-30">
        {SidebarContent}
      </aside>

      {/* Sidebar drawer for mobile */}
      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar overlay"
          />
          {/* Drawer */}
          <aside className="fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50 flex flex-col animate-slide-in">
            <button
              className="absolute top-4 right-4 bg-gray-100 rounded-full p-1"
              onClick={() => setOpen(false)}
              aria-label="Close sidebar"
              type="button"
            >
              <X size={24} />
            </button>
            {SidebarContent}
          </aside>
        </>
      )}

      {/* Spacer for main content on desktop */}
      <div className="hidden md:block w-64 flex-shrink-0" />
    </>
  )
}
