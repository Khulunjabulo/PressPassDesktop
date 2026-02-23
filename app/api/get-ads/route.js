// app/api/get-ads/route.js - COMBINED VERSION
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '../../../lib/firebase-admin';

// Utility function to normalize publisher ID
function normalizePublisherId(publisherId) {
  if (!publisherId) return null;
  // Remove 'publisher_' prefix if it exists
  return publisherId.replace(/^publisher_/, '');
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

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const rawPublisherId = searchParams.get('publisherId');
    const templateId = searchParams.get('templateId');
    const deviceType = searchParams.get('deviceType') || 'desktop';

    console.log('🔍 [GET-ADS] Request:', { 
      publisherId: rawPublisherId, 
      templateId,
      deviceType 
    });

    if (!rawPublisherId) {
      return NextResponse.json(
        { success: false, error: 'publisherId is required' },
        { status: 400 }
      );
    }

    // Normalize the publisher ID (remove 'publisher_' prefix if present)
    const publisherId = normalizePublisherId(rawPublisherId);

    console.log('🔍 Fetching ads with normalized ID:', {
      rawPublisherId,
      normalizedPublisherId: publisherId,
      templateId,
      deviceType
    });

    const db = getFirestoreDb();
    
    // Query with normalized publisher ID
    let query = db.collection('adUploads')
      .where('publisherId', '==', publisherId)
      .where('status', '==', 'active'); // Only active ads

    // Add device type filter if provided and valid
    if (deviceType && ['mobile', 'desktop'].includes(deviceType)) {
      query = query.where('deviceType', '==', deviceType);
    }

    // If templateId is provided, filter by it
    if (templateId) {
      query = query.where('templateId', '==', parseInt(templateId, 10));
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      console.log('❌ No ads found for:', { publisherId, templateId, deviceType });
      
      // Try searching with 'publisher_' prefix as fallback
      const prefixedId = `publisher_${publisherId}`;
      console.log('🔄 Trying with prefix:', prefixedId);
      
      let fallbackQuery = db.collection('adUploads')
        .where('publisherId', '==', prefixedId)
        .where('status', '==', 'active');
      
      if (deviceType && ['mobile', 'desktop'].includes(deviceType)) {
        fallbackQuery = fallbackQuery.where('deviceType', '==', deviceType);
      }
      
      if (templateId) {
        fallbackQuery = fallbackQuery.where('templateId', '==', parseInt(templateId, 10));
      }
      
      const fallbackSnapshot = await fallbackQuery.get();
      
      if (fallbackSnapshot.empty) {
        console.log('❌ No ads found with prefix either');
        return NextResponse.json({
          success: true,
          data: [],
          message: 'No ads found for this publisher and template',
          searchedIds: [publisherId, prefixedId],
          count: 0
        });
      }
      
      // Found with prefix - use those results
      console.log('✅ Found ads with prefixed ID');
      const ads = [];
      fallbackSnapshot.forEach(doc => {
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
          imageSrc: data.imageSrc, // Keep for backwards compatibility
          destinationUrl: data.destinationUrl,
          status: data.status,
          impressions: data.impressions || 0,
          clicks: data.clicks || 0,
          
          // Duration data
          duration: data.duration ? {
            type: data.duration.type,
            quantity: data.duration.quantity,
            startDate: data.duration.startDate,
            endDate: data.duration.endDate
          } : null,
          
          uploadedAt: data.uploadedAt?.toDate()?.toISOString() || null,
          activatedAt: data.activatedAt?.toDate()?.toISOString() || null,
          dimensions: getDimensions(data.templateId, data.deviceType)
        });
      });
      
      // Sort by template ID (for consistent ordering in preview)
      ads.sort((a, b) => a.templateId - b.templateId);
      
      console.log('✅ [GET-ADS] Returning:', { totalAds: ads.length, note: 'Found with prefixed ID' });
      
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
        templateName: getTemplateName(data.templateId, data.deviceType),
        deviceType: data.deviceType,
        mediaUrl: data.imageSrc,
        fileName: data.fileName,
        fileSize: data.fileSize,
        fileType: data.fileType,
        isVideo: data.isVideo || false,
        imageSrc: data.imageSrc, // Keep for backwards compatibility
        destinationUrl: data.destinationUrl,
        status: data.status,
        impressions: data.impressions || 0,
        clicks: data.clicks || 0,
        
        // Duration data
        duration: data.duration ? {
          type: data.duration.type,
          quantity: data.duration.quantity,
          startDate: data.duration.startDate,
          endDate: data.duration.endDate
        } : null,
        
        uploadedAt: data.uploadedAt?.toDate()?.toISOString() || null,
        activatedAt: data.activatedAt?.toDate()?.toISOString() || null,
        dimensions: getDimensions(data.templateId, data.deviceType)
      });
    });

    // Sort by template ID (for consistent ordering in preview)
    ads.sort((a, b) => a.templateId - b.templateId);

    console.log('✅ [GET-ADS] Returning:', { totalAds: ads.length });

    return NextResponse.json({
      success: true,
      data: ads,
      count: ads.length
    });

  } catch (error) {
    console.error('💥 [GET-ADS] Error:', {
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

export const dynamic = 'force-dynamic';