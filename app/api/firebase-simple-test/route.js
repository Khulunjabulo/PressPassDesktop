import { NextResponse } from 'next/server';
import { storage } from '@/lib/firebase-admin';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('featuredImage');
    if (!file) throw new Error('No file uploaded');

    const buffer = Buffer.from(await file.arrayBuffer());
    const bucket = storage.bucket();
    const filename = `test/${Date.now()}-${file.name}`;
    const fileRef = bucket.file(filename);

    await fileRef.save(buffer, { metadata: { contentType: file.type } });
    await fileRef.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
