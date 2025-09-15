import { NextResponse } from 'next/server';
import { getFirestoreDb } from '../../../lib/firebase-admin';

export async function GET() {
  try {
    const db = getFirestoreDb();
    const adUploadsRef = db.collection('adUploads');

    // Get the first document ordered by uploadedAt
    const snapshot = await adUploadsRef
      .orderBy('uploadedAt', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'No ad uploads found' },
        { status: 404 }
      );
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    // Convert Uint8Array back to base64 for client-side display
    let imageSrc = null;
    if (data.fileData && data.fileType) {
      const base64 = Buffer.from(data.fileData).toString('base64');
      imageSrc = `data:${data.fileType};base64,${base64}`;
    }

    return NextResponse.json({
      success: true,
      adUpload: {
        id: doc.id,
        fileName: data.fileName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        uploadedAt: data.uploadedAt.toDate().toISOString(),
        imageSrc,
        publisherId: data.publisherId,
        templateId: data.templateId
      }
    });

  } catch (error) {
    console.error('Error fetching first ad upload:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch ad upload',
        details: error.message
      },
      { status: 500 }
    );
  }
}