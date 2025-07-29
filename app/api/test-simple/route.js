// import { NextResponse } from 'next/server';

// export async function GET() {
//   try {
//     console.log('🔍 Testing simple Firebase Admin import...');
    
//     // Test just the import without initialization
//     const { cert, getApps } = await import('firebase-admin/app');
//     console.log('✅ Firebase Admin modules imported successfully');
//     console.log('📊 Current apps:', getApps().length);
    
//     // Test environment variables
//     const envCheck = {
//       projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//       clientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
//       privateKey: !!process.env.FIREBASE_PRIVATE_KEY,
//       googleClientId: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
//     };
    
//     console.log('📋 Environment variables:', envCheck);
    
//     return NextResponse.json({
//       success: true,
//       message: 'Basic imports working',
//       envCheck,
//       existingApps: getApps().length,
//     });
    
//   } catch (error) {
//     console.error('❌ Simple test failed:', error);
//     return NextResponse.json({
//       success: false,
//       error: error.message,
//       stack: error.stack,
//     }, { status: 500 });
//   }
// }