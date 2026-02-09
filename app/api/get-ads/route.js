// app/api/get-ads/route.js - UPDATED VERSION
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '../../../lib/firebase-admin';

// Utility function to normalize publisher ID
function normalizePublisherId(publisherId) {
  if (!publisherId) return null;
  // Remove 'publisher_' prefix if it exists
  return publisherId.replace(/^publisher_/, '');
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const rawPublisherId = searchParams.get('publisherId');
    const templateId = searchParams.get('templateId');
    const deviceType = searchParams.get('deviceType') || 'desktop';

    if (!rawPublisherId) {
      return NextResponse.json(
        { success: false, error: 'publisherId is required' },
        { status: 400 }
      );
    }

    // Normalize the publisher ID (remove 'publisher_' prefix if present)
    const publisherId = normalizePublisherId(rawPublisherId);

    ('🔍 Fetching ads with normalized ID:', {
      rawPublisherId,
      normalizedPublisherId: publisherId,
      templateId,
      deviceType
    });

    const db = getFirestoreDb();
    
    // Query with normalized publisher ID
    let query = db.collection('adUploads')
      .where('publisherId', '==', publisherId)
      .where('deviceType', '==', deviceType)
      .where('status', '==', 'active');

    // If templateId is provided, filter by it
    if (templateId) {
      query = query.where('templateId', '==', parseInt(templateId, 10));
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      ('❌ No ads found for:', { publisherId, templateId, deviceType });
      
      // Try searching with 'publisher_' prefix as fallback
      const prefixedId = `publisher_${publisherId}`;
      ('🔄 Trying with prefix:', prefixedId);
      
      let fallbackQuery = db.collection('adUploads')
        .where('publisherId', '==', prefixedId)
        .where('deviceType', '==', deviceType)
        .where('status', '==', 'active');
      
      if (templateId) {
        fallbackQuery = fallbackQuery.where('templateId', '==', parseInt(templateId, 10));
      }
      
      const fallbackSnapshot = await fallbackQuery.get();
      
      if (fallbackSnapshot.empty) {
        ('❌ No ads found with prefix either');
        return NextResponse.json({
          success: true,
          data: [],
          message: 'No ads found for this publisher and template',
          searchedIds: [publisherId, prefixedId]
        });
      }
      
      // Found with prefix - use those results
      ('✅ Found ads with prefixed ID');
      const ads = [];
      fallbackSnapshot.forEach(doc => {
        const data = doc.data();
        ads.push({
          id: doc.id,
          publisherId: data.publisherId,
          templateId: data.templateId,
          deviceType: data.deviceType,
          fileName: data.fileName,
          fileSize: data.fileSize,
          fileType: data.fileType,
          imageSrc: data.imageSrc,
          uploadedAt: data.uploadedAt?.toDate()?.toISOString() || null,
          status: data.status,
          impressions: data.impressions || 0,
          clicks: data.clicks || 0
        });
      });
      
      return NextResponse.json({
        success: true,
        data: ads,
        count: ads.length,
        note: 'Found with prefixed ID'
      });
    }

    // Found with normalized ID
    const ads = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      ads.push({
        id: doc.id,
        publisherId: data.publisherId,
        templateId: data.templateId,
        deviceType: data.deviceType,
        fileName: data.fileName,
        fileSize: data.fileSize,
        fileType: data.fileType,
        imageSrc: data.imageSrc,
        uploadedAt: data.uploadedAt?.toDate()?.toISOString() || null,
        status: data.status,
        impressions: data.impressions || 0,
        clicks: data.clicks || 0
      });
    });

    ('✅ Found ads:', ads.length);

    return NextResponse.json({
      success: true,
      data: ads,
      count: ads.length
    });

  } catch (error) {
    console.error('💥 Error in get-ads GET:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch ads',
        details: error.message
      },
      { status: 500 }
    );
  }
}