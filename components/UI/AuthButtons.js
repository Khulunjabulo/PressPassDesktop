"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { onUserChanged, logout } from "@/Firebase/auth" 

export function AuthButtons() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const unsubscribe = onUserChanged((user) => {
      setIsAuthenticated(!!user)
    })
    return () => unsubscribe() 
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      alert("Logged out successfully!")
    } catch (error) {
      console.error("Logout failed:", error)
      alert("Logout failed. Please try again.")
    }
  }

  return (
    <div className="flex justify-end p-4 gap-2">
      {isAuthenticated ? (
        <button variant="outline" onClick={handleLogout}>
          Logout
        </button>
      ) : (
        <>
          <Link href="/signin">
            <button variant="outline">Login</button>
          </Link>
          <Link href="/signup">
            <button>Sign Up</button>
          </Link>
        </>
      )}
    </div>
  )
}
