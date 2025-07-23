import { db } from './../../../lib/firebaseAdmin';

export async function POST(req) {
  console.log('[API /signup] Received POST request');

  const body = await req.json();
  const { uid, email, role } = body;

  console.log('[API /signup] Request body:', body);

  if (!uid || !email || !role) {
    console.error('[API /signup] Missing required fields');
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
    });
  }

  try {
    console.log(`[API /signup] Creating user in Realtime DB at path: users/${uid}`);

    await db.ref(`users/${uid}`).set({
      email,
      role,
      createdAt: Date.now(),
    });

    console.log('[API /signup] User profile successfully created');
    return new Response(JSON.stringify({ message: 'User profile created' }), {
      status: 201,
    });
  } catch (err) {
    console.error('[API /signup] Firebase error:', err);
    return new Response(JSON.stringify({ error: 'Failed to create user' }), {
      status: 500,
    });
  }
}
