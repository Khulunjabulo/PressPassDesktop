import { initializeApp, getApps } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyBGunI4nNpayJebuPecdxY1Ww_K6xEZDR8",
  authDomain: "press-pass-7c6f6.firebaseapp.com",
  projectId: "press-pass-7c6f6",
  storageBucket: "press-pass-7c6f6.appspot.com",
  messagingSenderId: "51480223395",
  appId: "1:51480223395:web:a84c3c28b1afc260e22916",
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export { auth, provider }
