import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import serviceAccount from './../Firebase/serviceAccountKey.json';

let adminApp;
if (!getApps().length) {
  adminApp = initializeApp({
    credential: cert(serviceAccount),
<<<<<<< HEAD
    databaseURL: DATABASE_URL
=======
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
>>>>>>> 5de2425e76f657377257be77c42303fe29c035bb
  });
} else {
  adminApp = getApps()[0];
}

const db = getDatabase(adminApp); 

export { adminApp, db };
