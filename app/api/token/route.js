import { auth } from '@/components/firebase/firebase';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, applicationDefault } from 'firebase-admin/app';

if (!getAuth.apps?.length) {
  initializeApp({
    credential: applicationDefault(),
  });
}

export async function GET(request) {
  const token = request.headers.get('authorization')?.split('Bearer ')[1];
  if (!token) {
    return new Response(JSON.stringify({ error: 'No token provided' }), { status: 401 });
  }
  try {
    const decoded = await getAuth().verifyIdToken(token);
    return new Response(JSON.stringify({ uid: decoded.uid }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 401 });
  }
}
