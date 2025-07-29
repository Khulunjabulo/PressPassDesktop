// lib/firebaseAdmin.js
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import { join } from 'path';

// Read service account JSON file
let serviceAccount;
try {
  const serviceAccountPath = join(process.cwd(), 'Firebase', 'serviceAccountKey.json');
  const serviceAccountFile = readFileSync(serviceAccountPath, 'utf8');
  serviceAccount = JSON.parse(serviceAccountFile);
  console.log('✅ Service account JSON loaded successfully');
} catch (error) {
  console.warn('⚠️ Could not load service account JSON:', error.message);
  serviceAccount = null;
}

let app;
try {
  let firebaseAdminConfig;
  
  if (serviceAccount) {
    // Use the service account JSON file directly
    console.log('🔑 Using service account JSON file for Firebase Admin');
    firebaseAdminConfig = {
      credential: cert(serviceAccount),
    };
  } else {
    // Fallback to environment variables
    console.log('🔑 Using environment variables for Firebase Admin');
    const requiredEnvVars = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
    };

    // Check for missing environment variables
    const missingVars = Object.entries(requiredEnvVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      console.error('❌ Missing Firebase Admin environment variables:', missingVars);
      throw new Error(`Missing required Firebase Admin environment variables: ${missingVars.join(', ')}`);
    }

    firebaseAdminConfig = {
      credential: cert({
        projectId: requiredEnvVars.projectId,
        clientEmail: requiredEnvVars.clientEmail,
        privateKey: requiredEnvVars.privateKey.replace(/\\n/g, '\n'),
      }),
    };
  }

  app = !getApps().length ? initializeApp(firebaseAdminConfig) : getApps()[0];
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error);
  console.error('Error details:', {
    message: error.message,
    code: error.code,
    stack: error.stack
  });
  throw error;
}

export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);
