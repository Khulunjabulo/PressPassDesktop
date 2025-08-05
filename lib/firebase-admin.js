// lib/firebase-admin.js
const { cert, getApps, initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { readFileSync } = require('fs');
const { join } = require('path');

let db = null;
let app = null;

function logEnvStatus() {
  console.log('================ FIREBASE ADMIN DEBUG ================');
  console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID || '(missing)');
  console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL || '(missing)');
  console.log(
    'FIREBASE_PRIVATE_KEY length:',
    process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.length : '(missing)'
  );
  console.log('getApps length:', getApps().length);
  console.log('======================================================');
}

function getFirebaseAdmin() {
  if (db && app) {
    console.log('✅ Using existing Firebase Admin instance');
    return db;
  }

  try {
    const existingApps = getApps();
    logEnvStatus();

    if (existingApps.length === 0) {
      console.log('🔧 Initializing Firebase Admin...');

      // 1️⃣ Environment Variables Method
      if (
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_PRIVATE_KEY &&
        process.env.FIREBASE_CLIENT_EMAIL
      ) {
        console.log('🔑 Using environment variables for authentication');

        // Fix formatting for private key
        const formattedKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
        console.log('🔑 Private key starts with:', formattedKey.slice(0, 30));

        app = initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: formattedKey,
          }),
          projectId: process.env.FIREBASE_PROJECT_ID,
        });

        console.log('✅ Firebase Admin initialized with environment variables');
      } else {
        // 2️⃣ Fallback to service account JSON
        try {
          const serviceAccountPath = join(process.cwd(), 'Firebase', 'serviceAccountKey.json');
          console.log('📁 Looking for service account at:', serviceAccountPath);

          const serviceAccountFile = readFileSync(serviceAccountPath, 'utf8');
          const serviceAccount = JSON.parse(serviceAccountFile);

          console.log('✅ Service account JSON loaded successfully');
          console.log('🔑 Project ID:', serviceAccount.project_id);
          console.log('📧 Client Email:', serviceAccount.client_email?.substring(0, 30) + '...');

          app = initializeApp({
            credential: cert(serviceAccount),
            projectId: serviceAccount.project_id,
          });

          console.log('✅ Firebase Admin initialized with service account JSON');
        } catch (fileError) {
          console.error('❌ Service account JSON error:', fileError.message);
          throw new Error(`Could not load service account. Either:
1️⃣ Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env
2️⃣ Or provide Firebase/serviceAccountKey.json
Error: ${fileError.message}`);
        }
      }
    } else {
      app = existingApps[0];
      console.log('✅ Using existing Firebase Admin app');
    }

    // Initialize Firestore
    db = getFirestore(app);
    console.log('✅ Firestore initialized successfully');
    return db;

  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    console.error('❌ Error type:', error.constructor.name);
    console.error('❌ Error code:', error.code);
    throw new Error(`Firebase Admin initialization failed: ${error.message}`);
  }
}

// Helper function to safely get a Firestore reference
function getFirestoreDb() {
  try {
    return getFirebaseAdmin();
  } catch (error) {
    console.error('❌ Failed to get Firestore database:', error);
    throw error;
  }
}

// Test function to verify permissions
async function testFirestorePermissions() {
  try {
    const db = getFirestoreDb();
    const testRef = db.collection('test').doc('permissions-test');

    console.log('🧪 Testing Firestore write permissions...');
    await testRef.set({
      test: true,
      timestamp: new Date().toISOString(),
      source: 'firebase-admin-sdk',
    });

    console.log('✅ Write test successful');

    console.log('🧪 Testing Firestore read permissions...');
    const doc = await testRef.get();

    if (doc.exists) {
      console.log('✅ Read test successful:', doc.data());

      // Clean up test document
      await testRef.delete();
      console.log('🧹 Test document cleaned up');

      return {
        success: true,
        data: doc.data(),
        timestamp: new Date().toISOString(),
      };
    } else {
      console.log('⚠️ Document does not exist after write');
      return {
        success: false,
        error: 'Document not found after write',
      };
    }
  } catch (error) {
    console.error('❌ Firestore permission test failed:', error);
    return {
      success: false,
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = {
  getFirebaseAdmin,
  getFirestoreDb,
  testFirestorePermissions,
};
