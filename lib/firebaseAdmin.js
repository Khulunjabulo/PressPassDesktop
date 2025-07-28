import admin from 'firebase-admin';
import serviceAccount from '../Firebase/serviceAccountKey.json';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('[Firebase Admin] ✅ Initialized successfully');
  } catch (error) {
    console.error('[Firebase Admin] ❌ Error initializing:', error);
  }
}

const db = admin.firestore();

export { admin, db };