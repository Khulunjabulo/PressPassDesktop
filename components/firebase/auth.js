import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'

export { signInWithPopup, signOut, onAuthStateChanged }
import { auth, provider } from './firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'


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
