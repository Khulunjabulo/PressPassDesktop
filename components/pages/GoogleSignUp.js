
/*'use client'

import React from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, provider } from '../firebase/firebase'

const GoogleSignUp = () => {
    const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
    setError(null)
    setLoading(true)

    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      const isNewUser = result._tokenResponse?.isNewUser

      if (isNewUser) {
        console.log('New user signed up:', user.displayName)
        
      } else {
        console.log('User already exists:', user.displayName)
      }
    } catch (err) {
      console.error('Google sign-up error:', err)
      setError('Failed to sign up with Google. Please try again.')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className='w-full max-w-sm mx-auto mb-4'>
      {error && (
        <p className='text-red-600 text-sm text-center mb-2'>{error} </p>
      )}
    <button
      onClick={handleSignUp}
      disabled={loading}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
    >
     { loading? 'signing in' : 'Sign up with Google'}
    </button>
    </div>
  )
}

export default GoogleSignUp*/
