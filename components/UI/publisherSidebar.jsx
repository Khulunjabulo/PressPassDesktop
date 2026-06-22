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
      <nav className="px-6 mt-6 space-y-2 flex-1 overflow-y-auto">
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
              onClick={() => setOpen(false)}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Profile block */}
      <div className="px-6 pb-6 pt-4 border-t border-gray-100">
        <Link href="/print-media/profile" className="bg-gray-100 p-4 rounded-lg flex items-center space-x-3">
          {currentUser?.profilePicture ? (
            <img
              src={currentUser.profilePicture}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
              {currentUser ? currentUser.firstName?.charAt(0).toUpperCase() : 'P'}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold">
              {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Publisher'}
            </p>
            <p className="text-xs text-gray-500">
              {currentUser
                ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)
                : 'Editor'}
            </p>
          </div>
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Burger button — mobile only ── */}
      <button
        className="md:hidden fixed top-[100px] left-4 p-2 z-40 bg-white rounded-full shadow-lg"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
        type="button"
      >
        <Menu size={24} />
      </button>

      {/*
        ── Desktop sidebar ──
        • NOT fixed — it's a normal flex child inside the page's flex-row container
        • sticky + top keeps it visible while the page scrolls
        • h-screen minus the header height so it fills the viewport without overflowing
        • flex-shrink-0 + w-64 so it never collapses
      */}
      <aside
        className="hidden md:flex flex-col w-64 flex-shrink-0 bg-white shadow-md"
        style={{
          position: 'sticky',
          top: '125px',                       // same visual offset as before
          height: 'calc(100vh - 125px)',       // fills remaining viewport height
          alignSelf: 'flex-start',            // critical: don't stretch to row height
          overflowY: 'auto',
        }}
      >
        {SidebarContent}
      </aside>

      {/* ── Mobile drawer ── */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar overlay"
          />
          <aside className="fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50 flex flex-col">
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
    </>
  )
}