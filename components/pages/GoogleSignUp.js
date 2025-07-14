
'use client'

import React from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, provider } from '../firebase/firebase'

const GoogleSignUp = () => {
  const handleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // This will tell you if the user is new
      const isNewUser = result._tokenResponse?.isNewUser

      if (isNewUser) {
        console.log('New user signed up:', user.displayName)
        // Optionally redirect to onboarding page
      } else {
        console.log('User already exists:', user.displayName)
      }
    } catch (err) {
      console.error('Google sign-up error:', err)
    }
  }

  return (
    <button
      onClick={handleSignUp}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
    >
      Sign up with Google
    </button>
  )
}

export default GoogleSignUp
