'use client'

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutDashboard,
    BarChart,
    User,
    Users,
    Newspaper,
    Activity
} from "lucide-react"
import { useEffect, useState } from "react"

export default function PublisherSidebar() {
    const pathname = usePathname()
    const [currentUser, setCurrentUser] = useState(null)

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('currentUser'))
        if (user) setCurrentUser(user)
    }, [])

    const menuItems = [
        { name: 'OVERVIEW', icon: <LayoutDashboard size={16} />, href: '/print-media/overview' },
        { name: 'CONTENT ANALYSIS', icon: <BarChart size={16} />, href: '/print-media/content-analysis' },
        { name: 'JOURNALIST', icon: <User size={16} />, href: '/print-media/journalist' },
        { name: 'SUBSCRIBERS', icon: <Users size={16} />, href: '/print-media/subscribers' },
        { name: 'RSS FEED', icon: <Newspaper size={16} />, href: '/print-media/rss-feeds' },
        { name: 'ADVANCED ANALYTICS', icon: <Activity size={16} />, href: '/print-media/advanced-analytics' },
    ]

    return (
        <aside className="w-64 bg-white shadow-md h-full flex flex-col">
            <div className="p-6"> </div>
            {/* Navigation */}
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

                    {/* User info */}
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
            
        </aside>
    )
}
