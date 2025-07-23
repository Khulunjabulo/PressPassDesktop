import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import serviceAccount from './../Firebase/serviceAccountKey.json';

let adminApp;
if (!getApps().length) {
  adminApp = initializeApp({
    credential: cert(serviceAccount),
    databaseURL: DATABASE_URL
  });
} else {
  adminApp = getApps()[0];
}

const db = getDatabase(adminApp); 

export { adminApp, db };
