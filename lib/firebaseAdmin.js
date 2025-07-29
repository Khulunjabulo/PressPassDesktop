// File: /lib/firebaseAdmin.js

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Admin SDK configuration
const adminConfig = {
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Initialize Firebase Admin
let adminApp;
let adminDb;
let adminAuth;

try {
  if (!getApps().length) {
    adminApp = initializeApp(adminConfig, 'admin');
    console.log('[Firebase Admin] ✅ Initialized');
  } else {
    adminApp = getApps().find(app => app.name === 'admin');
    if (!adminApp) {
      adminApp = initializeApp(adminConfig, 'admin');
    }
  }

  adminDb = getFirestore(adminApp);
  adminAuth = getAuth(adminApp);
} catch (error) {
  console.error('[Firebase Admin] ❌ Initialization error:', error);
}

export { adminApp, adminDb, adminAuth };