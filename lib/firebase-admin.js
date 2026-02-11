// lib/firebase-admin.js
import admin from 'firebase-admin';

let app;

function getFirebaseApp() {
  if (!app) {
    try {
      // Check if already initialized
      if (admin.apps.length > 0) {
        app = admin.apps[0];
        console.log('✅ Using existing Firebase app');
        return app;
      }

      // Check for required environment variables
      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        throw new Error('Missing required Firebase environment variables');
      }

      console.log('🚀 Initializing new Firebase app...');
      
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };

      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });

      console.log('✅ Firebase app initialized successfully');
      return app;
      
    } catch (error) {
      console.error('❌ Firebase app initialization failed:', error);
      throw new Error(`Firebase initialization failed: ${error.message}`);
    }
  }
  
  return app;
}

export function getFirestoreDb() {
  try {
    const firebaseApp = getFirebaseApp();
    const db = admin.firestore(firebaseApp);
    console.log('✅ Firestore database instance obtained');
    return db;
  } catch (error) {
    console.error('❌ Failed to get Firestore database:', error);
    throw new Error(`Firestore database access failed: ${error.message}`);
  }
}

export async function testFirestorePermissions() {
  try {
    console.log('🧪 Testing Firestore permissions...');
    const db = getFirestoreDb();
    
    // Test basic read/write permissions
    const testRef = db.collection('test-permissions').doc('permission-test');
    
    // Test write
    await testRef.set({
      test: true,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      environment: process.env.NODE_ENV || 'unknown'
    });
    
    // Test read
    const doc = await testRef.get();
    const exists = doc.exists;
    
    // Clean up
    await testRef.delete();
    
    console.log('✅ Firestore permissions test completed successfully');
    
    return {
      success: true,
      message: 'Firestore permissions verified',
      canWrite: true,
      canRead: exists,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Firestore permissions test failed:', error);
    
    return {
      success: false,
      error: error.message,
      code: error.code || 'unknown',
      timestamp: new Date().toISOString()
    };
  }
}

// Export the admin instance for advanced usage
export { admin };

// Export a function to get auth instance
export function getAuth() {
  const firebaseApp = getFirebaseApp();
  return admin.auth(firebaseApp);
}