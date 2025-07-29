// lib/firebaseAdminLazy.js - Lazy initialization to avoid hanging
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let adminDb = null;
let adminAuth = null;
let initializationPromise = null;

async function initializeFirebaseAdmin() {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log('🔄 Initializing Firebase Admin...');
      
      // Check if already initialized
      if (getApps().length > 0) {
        console.log('✅ Firebase Admin already initialized');
        const app = getApps()[0];
        adminDb = getFirestore(app);
        adminAuth = getAuth(app);
        return { adminDb, adminAuth };
      }

      // Use environment variables for initialization
      const requiredEnvVars = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
      };

      console.log('📋 Environment variables check:');
      console.log('- projectId:', !!requiredEnvVars.projectId);
      console.log('- clientEmail:', !!requiredEnvVars.clientEmail);
      console.log('- privateKey present:', !!requiredEnvVars.privateKey);
      
      if (requiredEnvVars.privateKey) {
        console.log('🔑 Private key length:', requiredEnvVars.privateKey.length);
        console.log('🔑 Private key starts with:', requiredEnvVars.privateKey.substring(0, 50));
        console.log('🔑 Private key ends with:', requiredEnvVars.privateKey.substring(requiredEnvVars.privateKey.length - 50));
      }

      // Check for missing environment variables
      const missingVars = Object.entries(requiredEnvVars)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      if (missingVars.length > 0) {
        throw new Error(`Missing required Firebase Admin environment variables: ${missingVars.join(', ')}`);
      }

      // Try to use service account JSON file first
      let firebaseAdminConfig;
      
      try {
        console.log('🔍 Attempting to use service account JSON file...');
        const { readFileSync } = await import('fs');
        const { join } = await import('path');
        
        const serviceAccountPath = join(process.cwd(), 'Firebase', 'serviceAccountKey.json');
        const serviceAccountFile = readFileSync(serviceAccountPath, 'utf8');
        const serviceAccount = JSON.parse(serviceAccountFile);
        
        firebaseAdminConfig = {
          credential: cert(serviceAccount),
        };
        
        console.log('✅ Using service account JSON file');
      } catch (jsonError) {
        console.log('⚠️ Service account JSON not available, using environment variables');
        console.log('JSON error:', jsonError.message);
        
        // Process the private key from environment variables
        let processedPrivateKey = requiredEnvVars.privateKey;
        
        // Remove quotes if present
        if (processedPrivateKey.startsWith('"') && processedPrivateKey.endsWith('"')) {
          processedPrivateKey = processedPrivateKey.slice(1, -1);
          console.log('🔧 Removed surrounding quotes from private key');
        }
        
        // Replace escaped newlines
        processedPrivateKey = processedPrivateKey.replace(/\\n/g, '\n');
        console.log('🔧 Processed private key length:', processedPrivateKey.length);
        console.log('🔧 Processed private key preview:', processedPrivateKey.substring(0, 100) + '...');

        firebaseAdminConfig = {
          credential: cert({
            projectId: requiredEnvVars.projectId,
            clientEmail: requiredEnvVars.clientEmail,
            privateKey: processedPrivateKey,
          }),
        };
      }

      console.log('🚀 Initializing Firebase Admin app...');
      const app = initializeApp(firebaseAdminConfig);
      adminDb = getFirestore(app);
      adminAuth = getAuth(app);
      
      console.log('✅ Firebase Admin initialized successfully');
      return { adminDb, adminAuth };
      
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Admin:', error);
      initializationPromise = null; // Reset so we can try again
      throw error;
    }
  })();

  return initializationPromise;
}

export async function getAdminDb() {
  if (!adminDb) {
    await initializeFirebaseAdmin();
  }
  return adminDb;
}

export async function getAdminAuth() {
  if (!adminAuth) {
    await initializeFirebaseAdmin();
  }
  return adminAuth;
}

// For backward compatibility
export { getAdminDb as adminDb, getAdminAuth as adminAuth };