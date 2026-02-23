// app/api/get-all-ads/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '../../../lib/firebase-admin';

// Utility function to normalize publisher ID
function normalizePublisherId(publisherId) {
  if (!publisherId) return null;
  return publisherId.replace(/^publisher_/, '');
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const rawPublisherId = searchParams.get('publisherId');

    console.log('🔍 [GET-ALL-ADS] Request:', { publisherId: rawPublisherId });

    if (!rawPublisherId) {
      return NextResponse.json(
        { success: false, error: 'publisherId is required' },
        { status: 400 }
      );
    }

    const publisherId = normalizePublisherId(rawPublisherId);
    const db = getFirestoreDb();

    // Fetch from both active and pending collections
    const [activeAds, pendingAds] = await Promise.all([
      db.collection('adUploads')
        .where('publisherId', '==', publisherId)
        .get(),
      db.collection('pendingAdUploads')
        .where('publisherId', '==', publisherId)
        .get()
    ]);

    console.log('📦 [GET-ALL-ADS] Found:', {
      active: activeAds.size,
      pending: pendingAds.size
    });

    const ads = [];

    // Process active ads
    activeAds.forEach(doc => {
      const data = doc.data();
      ads.push({
        id: doc.id,
        publisherId: data.publisherId,
        templateId: data.templateId,
        templateName: getTemplateName(data.templateId, data.deviceType),
        deviceType: data.deviceType,
        mediaUrl: data.imageSrc,
        fileName: data.fileName,
        fileSize: data.fileSize,
        fileType: data.fileType,
        isVideo: data.isVideo || false,
        destinationUrl: data.destinationUrl,
        status: data.status || 'active',
        paymentStatus: data.paymentStatus || 'completed',
        paymentAmount: data.paymentAmount || null,
        impressions: data.impressions || 0,
        clicks: data.clicks || 0,
        
        // Duration data
        duration: data.duration ? {
          type: data.duration.type,
          quantity: data.duration.quantity,
          startDate: data.duration.startDate,
          endDate: data.duration.endDate
        } : null,
        
        // Timestamps
        uploadedAt: data.uploadedAt?.toDate().toISOString(),
        activatedAt: data.activatedAt?.toDate().toISOString(),
        
        // Dimensions
        dimensions: getDimensions(data.templateId, data.deviceType),
        
        // Additional metadata
        notes: data.notes || null,
        cloudinaryPublicId: data.cloudinaryPublicId || null
      });
    });

    // Process pending ads (optional - you may not want these in dashboard)
    pendingAds.forEach(doc => {
      const data = doc.data();
      ads.push({
        id: doc.id,
        publisherId: data.publisherId,
        templateId: data.templateId,
        templateName: getTemplateName(data.templateId, data.deviceType),
        deviceType: data.deviceType,
        mediaUrl: data.imageSrc,
        fileName: data.fileName,
        fileSize: data.fileSize,
        fileType: data.fileType,
        isVideo: data.isVideo || false,
        destinationUrl: data.destinationUrl,
        status: 'pending_payment',
        paymentStatus: 'pending',
        paymentAmount: data.paymentAmount || null,
        impressions: 0,
        clicks: 0,
        
        duration: data.duration ? {
          type: data.duration.type,
          quantity: data.duration.quantity,
          startDate: data.duration.startDate,
          endDate: data.duration.endDate
        } : null,
        
        uploadedAt: data.uploadedAt?.toDate().toISOString(),
        activatedAt: null,
        dimensions: getDimensions(data.templateId, data.deviceType),
        notes: data.notes || null,
        cloudinaryPublicId: data.cloudinaryPublicId || null
      });
    });

    // Sort by upload date (newest first)
    ads.sort((a, b) => {
      const dateA = new Date(a.uploadedAt || 0);
      const dateB = new Date(b.uploadedAt || 0);
      return dateB - dateA;
    });

    console.log('✅ [GET-ALL-ADS] Returning:', { totalAds: ads.length });

    return NextResponse.json({
      success: true,
      data: ads,
      count: ads.length
    });

  } catch (error) {
    console.error('💥 [GET-ALL-ADS] Error:', {
      message: error.message,
      stack: error.stack
    });
    
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

// Helper function to get template name
function getTemplateName(templateId, deviceType) {
  const templates = {
    1: deviceType === 'desktop' ? 'Leaderboard Banner' : 'Mobile Banner',
    2: 'Feed Ad',
    3: 'Within Article',
    4: deviceType === 'desktop' ? 'Wide Skyscraper' : 'Half Page',
    5: deviceType === 'desktop' ? 'Wide Skyscraper' : 'Half Page'
  };
  
  return templates[templateId] || `Template ${templateId}`;
}

// Helper function to get dimensions
function getDimensions(templateId, deviceType) {
  const dimensions = {
    desktop: {
      1: '728x90',
      2: '300x250',
      3: '300x250',
      4: '160x600',
      5: '160x600'
    },
    mobile: {
      1: '320x50',
      2: '300x250',
      3: '300x250',
      4: '300x600',
      5: '300x600'
    }
  };
  
  return dimensions[deviceType]?.[templateId] || 'Unknown';
}

export const dynamic = 'force-dynamic';