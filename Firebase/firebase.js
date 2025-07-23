import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

let app, auth, db, provider;

try {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
<<<<<<< HEAD
    databaseURL: DATABASE_URL,
=======
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
>>>>>>> 5de2425e76f657377257be77c42303fe29c035bb
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
<<<<<<< HEAD
    db = getDatabase(app);
   provider = new GoogleAuthProvider();
  } catch (error) {
=======
  db = getDatabase(app);
  provider = new GoogleAuthProvider();
} catch (error) {
>>>>>>> 5de2425e76f657377257be77c42303fe29c035bb
  console.error("[Firebase Init] ❌ ERROR initializing Firebase:");
  console.error("Error Message:", error.message);
  console.error("Error Code:", error.code);
  console.error("Full Error Object:", error);
}
<<<<<<< HEAD
export { auth, db, provider };
=======

export { app, auth, db, provider };
>>>>>>> 5de2425e76f657377257be77c42303fe29c035bb
