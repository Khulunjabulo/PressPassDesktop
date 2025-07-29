// import { NextResponse } from 'next/server';

// export async function GET() {
//   try {
//     console.log('🔍 Testing Firebase Admin credentials...');
    
//     // Check environment variables
//     const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
//     const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
//     const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
//     console.log('📋 Environment check:');
//     console.log('- Project ID:', projectId ? 'Set' : 'Missing');
//     console.log('- Client Email:', clientEmail ? 'Set' : 'Missing');
//     console.log('- Private Key:', privateKey ? `Set (${privateKey.length} chars)` : 'Missing');
    
//     if (privateKey) {
//       console.log('🔑 Private key preview:', privateKey.substring(0, 100) + '...');
//       console.log('🔑 Private key ends with:', privateKey.substring(privateKey.length - 50));
//     }
    
//     // Try to initialize Firebase Admin manually
//     const { cert, getApps, initializeApp } = await import('firebase-admin/app');
    
//     console.log('📦 Firebase Admin modules imported');
//     console.log('🔍 Existing apps:', getApps().length);
    
//     if (getApps().length === 0) {
//       console.log('🚀 Attempting to initialize Firebase Admin...');
      
//       const credential = cert({
//         projectId: projectId,
//         clientEmail: clientEmail,
//         privateKey: privateKey.replace(/\\n/g, '\n'),
//       });
      
//       console.log('✅ Credential object created');
      
//       const app = initializeApp({
//         credential: credential,
//       });
      
//       console.log('✅ Firebase Admin app initialized:', app.name);
      
//       // Test Firestore connection
//       const { getFirestore } = await import('firebase-admin/firestore');
//       const db = getFirestore(app);
      
//       console.log('🔍 Testing Firestore connection...');
//       const testDoc = await db.collection('test').limit(1).get();
//       console.log('✅ Firestore connection successful, docs found:', testDoc.size);
      
//       return NextResponse.json({
//         success: true,
//         message: 'Firebase Admin credentials are working',
//         projectId: projectId,
//         clientEmail: clientEmail,
//         appsCount: getApps().length,
//         firestoreTest: 'success'
//       });
//     } else {
//       return NextResponse.json({
//         success: true,
//         message: 'Firebase Admin already initialized',
//         appsCount: getApps().length
//       });
//     }
    
//   } catch (error) {
//     console.error('❌ Firebase Admin credentials test failed:', error);
//     return NextResponse.json({
//       success: false,
//       error: error.message,
//       code: error.code,
//       stack: error.stack
//     }, { status: 500 });
//   }
// }