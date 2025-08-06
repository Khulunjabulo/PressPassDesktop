'use client'

//Forgot Password Logic
import { useState } from "react"

export default function useForgotPassword() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log(' Submitting forgot password request for:', email)
      
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      })

      const data = await response.json()
      
      if (data.success) {
        console.log(' Forgot password request successful')
        setSubmitted(true)
      } else {
        console.error(' Forgot password request failed:', data.error)
        setError(data.error || 'Failed to send password reset email. Please try again.')
      }
    } catch (err) {
      console.error(' Forgot password error:', err)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return {
    email,
    setEmail,
    submitted,
    loading,
    error,
    handleSubmit,
  }
}
