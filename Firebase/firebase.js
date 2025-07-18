import { initializeApp, getApps } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyCknCZl-gQb8gD3msAbSf2vh28-Sb9FwZ4",
  authDomain: "press-pass-98801.firebaseapp.com",
  projectId: "press-pass-98801",
  storageBucket: "press-pass-98801.appspot.com",
  messagingSenderId: "899909510336",
  appId: "1:899909510336:web:a3e32e5effaa9f591a3925",
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export { auth, provider }
