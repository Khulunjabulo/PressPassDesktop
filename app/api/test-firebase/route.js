// import { NextResponse } from 'next/server';

// export async function GET() {
//   try {
//     console.log('🔍 Testing Firebase Admin initialization...');
    
//     // Test environment variables
//     const envVars = {
//       projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//       privateKey: process.env.FIREBASE_PRIVATE_KEY,
//       googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
//     };
    
//     console.log('📋 Environment variables check:');
//     console.log('- projectId:', !!envVars.projectId);
//     console.log('- clientEmail:', !!envVars.clientEmail);
//     console.log('- privateKey:', !!envVars.privateKey);
//     console.log('- googleClientId:', !!envVars.googleClientId);
    
//     if (envVars.privateKey) {
//       console.log('🔑 Private key starts with:', envVars.privateKey.substring(0, 50));
//       console.log('🔑 Private key length:', envVars.privateKey.length);
//     }
    
//     // Try to import Firebase Admin
//     const { adminDb, adminAuth } = await import('../../../lib/firebaseAdmin');
//     console.log('✅ Firebase Admin imported successfully');
    
//     // Test basic operations
//     console.log('🔍 Testing adminAuth...');
//     const authTest = await adminAuth.listUsers(1);
//     console.log('✅ adminAuth working, found users:', authTest.users.length);
    
//     console.log('🔍 Testing adminDb...');
//     const dbTest = await adminDb.collection('test').limit(1).get();
//     console.log('✅ adminDb working, test collection size:', dbTest.size);
    
//     return NextResponse.json({
//       success: true,
//       message: 'Firebase Admin is working correctly',
//       envVarsLoaded: Object.keys(envVars).filter(key => !!envVars[key]).length,
//     });
    
//   } catch (error) {
//     console.error('❌ Firebase Admin test failed:', error);
//     return NextResponse.json({
//       success: false,
//       error: error.message,
//       stack: error.stack,
//     }, { status: 500 });
//   }
// }