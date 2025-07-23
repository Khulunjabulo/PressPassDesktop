// import { NextResponse } from 'next/server';
// import { initializeApp, getApps, getApp } from 'firebase/app';
// import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
// import { getFirestore, doc, getDoc } from 'firebase/firestore';

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
// };

// const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);

// export async function POST(req) {
//   try {
//     const { email, password } = await req.json();

//     if (!email || !password) {
//       return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
//     }

//     const userCredential = await signInWithEmailAndPassword(auth, email, password);
//     const user = userCredential.user;

//     // Fetch role from Firestore
//     const userDocRef = doc(db, 'users', user.uid);
//     const userDoc = await getDoc(userDocRef);

//     if (!userDoc.exists()) {
//       return NextResponse.json({ error: 'User role not found in Firestore' }, { status: 404 });
//     }

//     const { role } = userDoc.data();

//     return NextResponse.json({
//       success: true,
//       uid: user.uid,
//       email: user.email,
//       role,
//     });
//   } catch (error) {
//     console.error('SignIn Error:', error);
//     return NextResponse.json({ error: error.message }, { status: 400 });
//   }
// }
