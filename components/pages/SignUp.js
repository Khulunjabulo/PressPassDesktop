'use client'

import React, { useState, useEffect } from 'react'
import {
  signUpWithEmail,
  loginWithEmail,
  logout,
  onUserChanged,
} from '../firebase/auth'
import { auth, provider } from '../firebase/firebase'
import { signInWithPopup } from 'firebase/auth'

const SignUp = () => {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('signup') 
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = onUserChanged(setUser)
    return () => unsubscribe()
  }, [])

  const handleEmailPasswordSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password)
      } else {
        await loginWithEmail(email, password)
      }

      setEmail('')
      setPassword('')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleGoogleSignUp = async () => {
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
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-10 border p-6 rounded shadow bg-white space-y-4">
      {user ? (
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold"> Signed in as:</h2>
          <p className="text-blue-700 font-medium">{user.email}</p>
          <button
            onClick={logout}
            className="mt-4 w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Sign out
          </button>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-center">
            {mode === 'signup' ? 'Create an Account' : 'Log In'}
          </h2>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          
          <form onSubmit={handleEmailPasswordSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              {mode === 'signup' ? 'Sign up' : 'Log in'}
            </button>
          </form>

         
          <div className="text-center my-2 text-gray-500">OR</div>

          
          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? 'Signing in...' : 'Sign up with Google'}
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            {mode === 'signup' ? 'Already have an account?' : 'New user?'}{' '}
            <button
              type="button"
              className="text-blue-600 underline"
              onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
            >
              {mode === 'signup' ? 'Log in' : 'Sign up'}
            </button>
          </p>
        </>
      )}
    </div>
  )
}

export default SignUp


