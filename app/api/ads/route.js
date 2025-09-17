// /api/ads/route.js - IMPROVED VERSION WITH BETTER IMAGE HANDLING
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

// GET /api/ads - Fetch ads with improved error handling
export async function GET(request) {
  console.log('🚀 GET /api/ads - Starting request...');
  
  try {
    const { searchParams } = new URL(request.url);
    const requestedType = searchParams.get('type');
    const status = searchParams.get('status') || 'active';
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const debugMode = searchParams.get('debug') === 'true';

    console.log('📋 Query parameters:', { requestedType, status, includeInactive, debugMode });

    const adsRef = collection(db, COLLECTION_NAME);
    
    // Get all documents
    const allDocsSnapshot = await getDocs(adsRef);
    console.log(`📊 Found ${allDocsSnapshot.size} total documents in database`);
    
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
          console.log(`❌ Ad ${ad.id} filtered out - status: ${ad.status} (needed: ${status})`);
        }
        if (debugMode && !isApproved) {
          console.log(`❌ Ad ${ad.id} filtered out - approved: ${ad.approved} (needed: true)`);
        }
        if (debugMode && !hasValidImage) {
          console.log(`❌ Ad ${ad.id} filtered out - invalid image`);
        }
        
        return isActive && isApproved && hasValidImage;
      });
      console.log(`🔍 Status filter: ${beforeCount} → ${filteredAds.length} ads`);
    }

    // Filter by type
    if (requestedType && requestedType !== 'all') {
      const beforeCount = filteredAds.length;
      filteredAds = filteredAds.filter(ad => {
        const matches = ad.adType === requestedType;
        if (debugMode && !matches) {
          console.log(`❌ Ad ${ad.id} filtered out - type: ${ad.adType} (needed: ${requestedType})`);
        }
        return matches;
      });
      console.log(`🔍 Type filter: ${beforeCount} → ${filteredAds.length} ads`);
    }

    // Sort by creation date (newest first)
    filteredAds.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });

    console.log(`🎉 Returning ${filteredAds.length} ads for type: ${requestedType || 'any'}`);

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
  console.log('📝 POST /api/ads - Creating new ad...');
  
  try {
    const body = await request.json();
    console.log('📦 Received ad data:', {
      title: body.title,
      url: body.url,
      adType: body.adType,
      dimensions: body.dimensions,
      hasDesktopImage: !!body.desktopImage,
      desktopImageSize: body.desktopImage ? `${(body.desktopImage.length / 1024 / 1024).toFixed(2)}MB` : 'none',
      hasMobileImage: !!body.mobileImage,
      company: body.company,
      contactEmail: body.contactEmail
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
      approved = true
    } = body;

    // Enhanced validation
    const errors = [];
    
    if (!title?.trim()) errors.push('Title is required');
    if (!url?.trim()) errors.push('URL is required');
    if (!desktopImage) errors.push('Desktop image is required');
    if (!dimensions) errors.push('Dimensions are required');
    
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
      console.log(`🔧 Inferred adType: ${finalAdType} from dimensions: ${width}x${height}`);
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
    
    console.log('🖼️ Image info:', {
      desktop: desktopImageInfo,
      mobile: mobileImageInfo
    });

    const adData = {
      title: title.trim(),
      url: url.trim(),
      desktopImage,
      mobileImage: mobileImage || desktopImage, // Use desktop as fallback
      adType: finalAdType,
      dimensions,
      contactEmail: contactEmail?.trim() || '',
      company: company?.trim() || '',
      status,
      approved,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      clicks: 0,
      impressions: 0,
      // Store image metadata for debugging
      imageInfo: {
        desktop: desktopImageInfo,
        mobile: mobileImageInfo
      }
    };

    console.log('💾 Saving ad to Firestore...');
    const adsRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(adsRef, adData);
    
    console.log('✅ Ad saved successfully with ID:', docRef.id);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Ad created successfully',
      adData: {
        id: docRef.id,
        title: adData.title,
        adType: adData.adType,
        status: adData.status,
        imageInfo: adData.imageInfo
      }
    });

  } catch (error) {
    console.error('🚨 Error in POST /api/ads:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create ad',
      code: error.code || 'CREATE_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.stack : null
    }, { status: 500 });
  }
}

// PUT and DELETE methods remain the same...
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Ad ID is required'
      }, { status: 400 });
    }

    const adRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(adRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    return NextResponse.json({
      success: true,
      message: 'Ad updated successfully'
    });

  } catch (error) {
    console.error('Error updating ad:', error);
    
    if (error.code === 'not-found') {
      return NextResponse.json({
        success: false,
        error: 'Ad not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update ad'
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Ad ID is required'
      }, { status: 400 });
    }

    const adRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(adRef);

    return NextResponse.json({
      success: true,
      message: 'Ad deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting ad:', error);
    
    if (error.code === 'not-found') {
      return NextResponse.json({
        success: false,
        error: 'Ad not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete ad'
    }, { status: 500 });
  }
}