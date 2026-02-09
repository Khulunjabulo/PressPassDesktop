// /app/api/ads/route.js - FINAL FIXED VERSION (handles undefined fields properly)
import { NextResponse } from 'next/server';
import { db } from '@/Firebase/firebase'; 
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

const COLLECTION_NAME = 'advertisements';

// Helper function to validate base64 image
function validateBase64Image(base64String) {
  if (!base64String) return false;
  
  // Check if it's a valid data URL format
  const dataUrlRegex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
  if (!dataUrlRegex.test(base64String)) {
    return false;
  }
  
  // Extract the base64 part
  const base64Part = base64String.split(',')[1];
  if (!base64Part) return false;
  
  try {
    // Validate base64 format
    atob(base64Part);
    return true;
  } catch (error) {
    return false;
  }
}

// Helper function to get image info
function getImageInfo(base64String) {
  if (!base64String) return null;
  
  const match = base64String.match(/^data:image\/(\w+);base64,/);
  if (!match) return null;
  
  const mimeType = match[0];
  const format = match[1];
  const base64Data = base64String.split(',')[1];
  
  // Estimate size (base64 is ~33% larger than binary)
  const sizeInBytes = (base64Data.length * 3) / 4;
  const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
  
  return {
    format,
    mimeType,
    sizeInMB,
    sizeInBytes,
    isValid: true
  };
}

// 🔧 NEW: Helper to remove undefined fields from objects
function removeUndefinedFields(obj) {
  if (obj === null || obj === undefined) return null;
  
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefinedFields(item)).filter(item => item !== undefined);
  }
  
  if (typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        const cleanedValue = removeUndefinedFields(value);
        if (cleanedValue !== undefined) {
          cleaned[key] = cleanedValue;
        }
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }
  
  return obj;
}

// GET /api/ads - Fetch ads with improved error handling
export async function GET(request) {
  ('🚀 GET /api/ads - Starting request...');
  
  try {
    const { searchParams } = new URL(request.url);
    const requestedType = searchParams.get('type');
    const status = searchParams.get('status') || 'active';
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const debugMode = searchParams.get('debug') === 'true';

    ('📋 Query parameters:', { requestedType, status, includeInactive, debugMode });

    const adsRef = collection(db, COLLECTION_NAME);
    
    // Get all documents
    const allDocsSnapshot = await getDocs(adsRef);
    (`📊 Found ${allDocsSnapshot.size} total documents in database`);
    
    const allAds = [];
    const adsWithIssues = [];
    
    allDocsSnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      
      // Convert Firestore timestamps to ISO strings for JSON serialization
      const ad = {
        id: docSnapshot.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || null
      };
      
      // Validate and fix common issues
      const issues = [];
      
      // Check adType
      if (!ad.adType) {
        // Infer adType from dimensions or other clues
        if (ad.dimensions) {
          const { width, height } = ad.dimensions;
          if (width <= 320 || ad.dimensions.includes('mobile')) {
            ad.adType = 'mobile';
          } else if (width >= 728 && height <= 90) {
            ad.adType = 'banner';
          } else if (width === 300) {
            ad.adType = 'sidebar_rectangle';
          } else {
            ad.adType = 'sidebar_rectangle'; // default
          }
        } else {
          ad.adType = 'mobile'; // fallback
        }
        issues.push(`Missing adType, inferred: ${ad.adType}`);
      }
      
      // Validate images
      if (ad.desktopImage && !validateBase64Image(ad.desktopImage)) {
        issues.push('Invalid desktopImage format');
      }
      
      if (ad.mobileImage && !validateBase64Image(ad.mobileImage)) {
        issues.push('Invalid mobileImage format');
      }
      
      // Log issues for debugging
      if (issues.length > 0 && debugMode) {
        adsWithIssues.push({
          id: ad.id,
          title: ad.title,
          issues
        });
      }
      
      allAds.push(ad);
    });

    // Filter ads
    let filteredAds = allAds;

    // Filter by status
    if (!includeInactive) {
      const beforeCount = filteredAds.length;
      filteredAds = filteredAds.filter(ad => {
        const isActive = ad.status === status;
        const isApproved = ad.approved === true || ad.approved === 'true';
        const hasValidImage = ad.desktopImage && validateBase64Image(ad.desktopImage);
        
        if (debugMode && !isActive) {
          (`❌ Ad ${ad.id} filtered out - status: ${ad.status} (needed: ${status})`);
        }
        if (debugMode && !isApproved) {
          (`❌ Ad ${ad.id} filtered out - approved: ${ad.approved} (needed: true)`);
        }
        if (debugMode && !hasValidImage) {
          (`❌ Ad ${ad.id} filtered out - invalid image`);
        }
        
        return isActive && isApproved && hasValidImage;
      });
      (`🔍 Status filter: ${beforeCount} → ${filteredAds.length} ads`);
    }

    // Filter by type
    if (requestedType && requestedType !== 'all') {
      const beforeCount = filteredAds.length;
      filteredAds = filteredAds.filter(ad => {
        const matches = ad.adType === requestedType;
        if (debugMode && !matches) {
          (`❌ Ad ${ad.id} filtered out - type: ${ad.adType} (needed: ${requestedType})`);
        }
        return matches;
      });
      (`🔍 Type filter: ${beforeCount} → ${filteredAds.length} ads`);
    }

    // Sort by creation date (newest first)
    filteredAds.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });

    (`🎉 Returning ${filteredAds.length} ads for type: ${requestedType || 'any'}`);

    // Enhanced debug info
    if (debugMode) {
      const imageStats = filteredAds.map(ad => ({
        id: ad.id,
        title: ad.title,
        adType: ad.adType,
        hasDesktopImage: !!ad.desktopImage,
        hasMobileImage: !!ad.mobileImage,
        desktopImageInfo: getImageInfo(ad.desktopImage),
        status: ad.status,
        approved: ad.approved
      }));

      return NextResponse.json({
        success: true,
        debug: true,
        ads: filteredAds,
        count: filteredAds.length,
        totalInDatabase: allAds.length,
        query: { requestedType, status, includeInactive },
        allAdTypes: [...new Set(allAds.map(ad => ad.adType))],
        adsWithIssues,
        imageStats,
        message: 'Debug mode - detailed information included'
      });
    }

    return NextResponse.json({
      success: true,
      ads: filteredAds,
      count: filteredAds.length,
      message: `Found ${filteredAds.length} ads${requestedType ? ` for type: ${requestedType}` : ''}`
    });

  } catch (error) {
    console.error('🚨 Error in GET /api/ads:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch ads',
      code: error.code || 'FETCH_ERROR',
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        name: error.name
      } : null
    }, { status: 500 });
  }
}

// POST /api/ads - Create new ad with enhanced validation
export async function POST(request) {
  ('📝 POST /api/ads - Creating new ad...');
  
  try {
    const body = await request.json();
    
    ('📦 Received ad data:', {
      title: body.title,
      url: body.url,
      adType: body.adType,
      dimensions: body.dimensions,
      hasDesktopImage: !!body.desktopImage,
      desktopImageSize: body.desktopImage ? `${(body.desktopImage.length / 1024 / 1024).toFixed(2)}MB` : 'none',
      hasMobileImage: !!body.mobileImage,
      company: body.company,
      contactEmail: body.contactEmail,
      paymentIntentId: body.paymentIntentId,
      amount: body.amount,
      currency: body.currency,
      duration: body.duration,
      hasPaymentInfo: !!body.paymentInfo
    });
    
    const {
      title,
      url,
      desktopImage,
      mobileImage,
      adType,
      dimensions,
      contactEmail,
      company,
      status = 'active',
      approved = true,
      paymentIntentId,
      amount,
      currency,
      paymentInfo
    } = body;

    // Enhanced validation
    const errors = [];
    
    if (!title?.trim()) errors.push('Title is required');
    if (!url?.trim()) errors.push('URL is required');
    if (!desktopImage) errors.push('Desktop image is required');
    if (!dimensions) errors.push('Dimensions are required');
    
    // Validate payment info
    if (!paymentIntentId) {
      console.error('❌ Missing paymentIntentId in request body');
      errors.push('Payment Intent ID is required');
    }
    
    if (!amount || amount === 0) {
      console.error('❌ Missing or invalid amount in request body');
      errors.push('Payment amount is required and must be greater than 0');
    }
    
    if (url && !url.startsWith('http')) {
      errors.push('URL must start with http:// or https://');
    }
    
    // Validate URL format
    if (url) {
      try {
        new URL(url);
      } catch {
        errors.push('Invalid URL format');
      }
    }
    
    // Validate images
    if (desktopImage && !validateBase64Image(desktopImage)) {
      errors.push('Invalid desktop image format - must be a valid base64 data URL');
    }
    
    if (mobileImage && !validateBase64Image(mobileImage)) {
      errors.push('Invalid mobile image format - must be a valid base64 data URL');
    }

    if (errors.length > 0) {
      console.error('❌ Validation errors:', errors);
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        errors
      }, { status: 400 });
    }

    // Determine final adType
    let finalAdType = adType;
    if (!finalAdType && dimensions) {
      const { width, height } = dimensions;
      if (width <= 320 || width === 320) {
        finalAdType = 'mobile';
      } else if (width >= 728) {
        finalAdType = 'banner';
      } else if (width === 300 && height === 250) {
        finalAdType = 'sidebar_rectangle';
      } else if (width === 300 && height === 600) {
        finalAdType = 'sidebar_skyscraper';
      } else {
        finalAdType = 'sidebar_rectangle';
      }
      (`🔧 Inferred adType: ${finalAdType} from dimensions: ${width}x${height}`);
    }

    // Validate adType
    const validAdTypes = ['mobile', 'banner', 'sidebar_rectangle', 'sidebar_skyscraper', 'sidebar_rectangle2'];
    if (!validAdTypes.includes(finalAdType)) {
      return NextResponse.json({
        success: false,
        error: `Invalid adType: ${finalAdType}. Valid types: ${validAdTypes.join(', ')}`
      }, { status: 400 });
    }

    // Log image info
    const desktopImageInfo = getImageInfo(desktopImage);
    const mobileImageInfo = mobileImage ? getImageInfo(mobileImage) : null;
    
    ('🖼️ Image info:', {
      desktop: desktopImageInfo,
      mobile: mobileImageInfo
    });

    // 🔧 BUILD AD DATA - Only include defined fields
    const adData = {
      title: title.trim(),
      url: url.trim(),
      desktopImage,
      mobileImage: mobileImage || desktopImage,
      adType: finalAdType,
      dimensions,
      contactEmail: contactEmail?.trim() || '',
      company: company?.trim() || '',
      status,
      approved,
      
      // Payment info - only include defined fields
      paymentInfo: {
        paymentIntentId: String(paymentIntentId),
        amount: Number(amount),
        currency: String(currency || 'ZAR'),
        paidAt: serverTimestamp(),
        stripeStatus: paymentInfo?.stripeStatus || 'succeeded'
      },
      
      // Publisher info
      publisherId: body.publisherId || '',
      publisherEmail: body.publisherEmail || contactEmail?.trim() || '',
      
      // Metadata
      metadata: body.metadata || {},
      
      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      // Stats
      clicks: 0,
      impressions: 0,
      
      // Image info for debugging
      imageInfo: {
        desktop: desktopImageInfo,
        mobile: mobileImageInfo
      }
    };

    // 🔧 CRITICAL FIX: Only add schedule if it has valid data
    if (body.duration) {
      const scheduleData = {
        duration: body.duration,
        durationUnit: body.durationUnit || 'days',
        startDate: serverTimestamp(),
        displayPerDay: body.displayPerDay || 24
      };
      
      // Only add optional fields if they're defined
      if (body.totalHours !== undefined && body.totalHours !== null) {
        scheduleData.totalHours = body.totalHours;
      }
      
      if (body.endDate !== undefined && body.endDate !== null) {
        scheduleData.endDate = body.endDate;
      }
      
      adData.schedule = scheduleData;
    }

    // 🔧 EXTRA SAFETY: Remove any undefined fields (recursive)
    const cleanedAdData = removeUndefinedFields(adData);

    ('🔍 Final adData validation:', {
      hasPaymentInfo: !!cleanedAdData.paymentInfo,
      paymentIntentId: cleanedAdData.paymentInfo?.paymentIntentId,
      amount: cleanedAdData.paymentInfo?.amount,
      currency: cleanedAdData.paymentInfo?.currency,
      hasSchedule: !!cleanedAdData.schedule,
      scheduleFields: cleanedAdData.schedule ? Object.keys(cleanedAdData.schedule) : []
    });

    if (!cleanedAdData.paymentInfo?.paymentIntentId) {
      throw new Error('CRITICAL: paymentIntentId is undefined in adData');
    }

    if (!cleanedAdData.paymentInfo?.amount || cleanedAdData.paymentInfo.amount === 0) {
      throw new Error('CRITICAL: amount is undefined or zero in adData');
    }

    ('💾 Saving ad to Firestore...');
    const adsRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(adsRef, cleanedAdData);
    
    ('✅ Ad saved successfully with ID:', docRef.id);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Ad created successfully',
      adData: {
        id: docRef.id,
        title: cleanedAdData.title,
        adType: cleanedAdData.adType,
        status: cleanedAdData.status,
        payment: {
          intentId: cleanedAdData.paymentInfo.paymentIntentId,
          amount: cleanedAdData.paymentInfo.amount,
          currency: cleanedAdData.paymentInfo.currency
        },
        imageInfo: cleanedAdData.imageInfo
      }
    });

  } catch (error) {
    console.error('🚨 Error in POST /api/ads:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create ad',
      code: error.code || 'CREATE_ERROR',
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        name: error.name,
        message: error.message
      } : 'An error occurred while creating the ad'
    }, { status: 500 });
  }
}

// PUT /api/ads - Update existing ad
export async function PUT(request) {
  ('📝 PUT /api/ads - Updating ad...');
  
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Ad ID is required'
      }, { status: 400 });
    }

    ('📝 Updating ad:', id, 'with updates:', Object.keys(updates));

    // Remove undefined fields from updates
    const cleanedUpdates = removeUndefinedFields(updates);

    const adRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(adRef, {
      ...cleanedUpdates,
      updatedAt: serverTimestamp()
    });

    ('✅ Ad updated successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'Ad updated successfully',
      id
    });

  } catch (error) {
    console.error('🚨 Error updating ad:', error);
    
    if (error.code === 'not-found') {
      return NextResponse.json({
        success: false,
        error: 'Ad not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update ad',
      code: error.code
    }, { status: 500 });
  }
}

// DELETE /api/ads - Delete ad
export async function DELETE(request) {
  ('🗑️ DELETE /api/ads - Deleting ad...');
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Ad ID is required'
      }, { status: 400 });
    }

    ('🗑️ Deleting ad:', id);

    const adRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(adRef);

    ('✅ Ad deleted successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'Ad deleted successfully',
      id
    });

  } catch (error) {
    console.error('🚨 Error deleting ad:', error);
    
    if (error.code === 'not-found') {
      return NextResponse.json({
        success: false,
        error: 'Ad not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete ad',
      code: error.code
    }, { status: 500 });
  }
}