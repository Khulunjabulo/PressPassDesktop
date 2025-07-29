// // Test Firebase Admin configuration
// console.log('🔍 Testing Firebase Admin configuration...');

// // Check environment variables
// console.log('📋 Environment variables:');
// console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing');
// console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✅ Set' : '❌ Missing');
// console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✅ Set' : '❌ Missing');
// console.log('NEXT_PUBLIC_GOOGLE_CLIENT_ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');

// try {
//   // Try to import Firebase Admin
//   const { adminDb, adminAuth } = require('./lib/firebaseAdmin');
//   console.log('✅ Firebase Admin imported successfully');
//   console.log('✅ adminDb:', !!adminDb);
//   console.log('✅ adminAuth:', !!adminAuth);
// } catch (error) {
//   console.error('❌ Firebase Admin import failed:', error.message);
//   console.error('Stack:', error.stack);
// }