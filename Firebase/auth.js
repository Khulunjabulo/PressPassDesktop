"use client"
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth"
import { auth, provider } from "./firebase" 

export const setAuthPersistence = async (keepSignedIn) => {
  await setPersistence(auth, keepSignedIn ? browserLocalPersistence : browserSessionPersistence)
}

export const signUpWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    const isNewUser = result._tokenResponse?.isNewUser
    return { user, isNewUser }
  } catch (error) {
    console.error("Google sign-up error:", error)
    throw error
  }
}

export const signUpWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    return { user: result.user, isNewUser: true }
  } catch (error) {
    console.error("Email sign-up error:", error)
    throw error
  }
}

export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return { user: result.user, isNewUser: false }
  } catch (error) {
    console.error("Email sign-in error:", error)
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
    console.error("Google sign-in error:", error)
    throw error
  }
}

export const logout = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error("Sign-out error:", error)
    throw error
  }
}

export const onUserChanged = (callback) => {
  return onAuthStateChanged(auth, callback)
}


import { getDatabase, ref, get } from "firebase/database";


export const getUserRole = async (uid) => {
  try {
    const dbRef = ref(getDatabase(), `users/${uid}/role`);
    const snapshot = await get(dbRef);

    if (snapshot.exists()) {
      return snapshot.val(); 
    } else {
      console.warn("No role found for user.");
      return "guest";
    }
  } catch (error) {
    console.error("Failed to fetch user role:", error);
    return "guest";
  }
};
