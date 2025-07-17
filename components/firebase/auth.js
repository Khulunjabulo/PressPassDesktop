'use client'
import { auth, provider } from './firebase'
import { signInWithPopup,
  createUserWithEmailAndPassword,
  loginWithEmail,
  signOut,
   onAuthStateChanged
  } from 'firebase/auth'


export const signUpWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    const isNewUser = result._tokenResponse?.isNewUser
    return { user, isNewUser }
  } catch (error) {
    console.error('Google sign-up error:', error)
    throw error
  }
}

export const signUpWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    return { user: result.user, isNewUser: true }
  } catch (error) {
    console.error('Email sign-up error:', error)
    throw error
  }
}

export const loginWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return { user: result.user, isNewUser: false }
  } catch (error) {
    console.error('Email login error:', error)
    throw error
  }
}


export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    const isNewUser = result._tokenResponse?.isNewUser
    return { user, isNewUser }
  } catch (error) {
    console.error('Google sign-in error:', error)
    throw error
  }
}

export const logout = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Sign-out error:', error)
    throw error
  }
}


export const onUserChanged = (callback) => {
  return onAuthStateChanged(auth, callback)
}
