'use client'

//Forgot Password Logic
import { useState } from "react"

export default function useForgotPassword() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Connect to backend or Firebase
    setSubmitted(true)
  }

  return {
    email,
    setEmail,
    submitted,
    handleSubmit,
  }
}
