import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import serviceAccount from './../Firebase/serviceAccountKey.json';

let adminApp;
if (!getApps().length) {
  adminApp = initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
} else {
  adminApp = getApps()[0];
}

const db = getDatabase(adminApp); 

export { adminApp, db };
