// // app/api/signup-client/route.js - Using Firebase Client SDK instead of Admin SDK
// import { NextResponse } from 'next/server';

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     console.log('📩 Received user data:', body);

//     const {
//       uid,
//       email,
//       firstName,
//       lastName,
//       role,
//       profilePicture = '',
//       companyName = '',
//       industry = '',
//       companyWebsite = '',
//       jobTitle = '',
//       phone = '',
//       publicationType = '',
//       audienceType = '',
//       monthlyReadership = '',
//     } = body;

//     if (!uid || !email || !firstName || !lastName || !role) {
//       console.error('❌ Missing required fields');
//       return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
//     }

//     const userData = {
//       uid,
//       email,
//       firstName,
//       lastName,
//       role,
//       profilePicture,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//       provider: 'email',
//       emailVerified: false,
//       ...(role === 'publisher' && {
//         companyName,
//         industry,
//         companyWebsite,
//         jobTitle,
//         phone,
//         publicationType,
//         audienceType,
//         monthlyReadership,
//         verified: false,
//         publications: [],
//       }),
//       ...(role === 'reader' && {
//         preferences: [],
//         subscriptions: [],
//         readingHistory: [],
//       }),
//     };

//     // Use Firebase Client SDK instead of Admin SDK
//     const { initializeApp, getApps } = await import('firebase/app');
//     const { getFirestore, doc, setDoc } = await import('firebase/firestore');

//     const firebaseConfig = {
//       apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//       authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//       projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//       storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//       messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//       appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
//     };

//     let app;
//     if (!getApps().length) {
//       app = initializeApp(firebaseConfig);
//       console.log('✅ Firebase Client SDK initialized');
//     } else {
//       app = getApps()[0];
//     }

//     const db = getFirestore(app);
//     await setDoc(doc(db, 'users', uid), userData);
//     console.log('✅ User data written to Firestore for UID:', uid);

//     return NextResponse.json({ success: true, message: 'User data stored' });
//   } catch (error) {
//     console.error('🔥 Error storing user data:', error);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }