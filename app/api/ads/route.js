// /api/ads/route.js - COMPLETE FIX
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

// GET /api/ads - Fetch ads by type with fallback handling
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
    
    // First, let's get all documents to see what we have
    console.log('🔍 Fetching all documents to inspect structure...');
    const allDocsSnapshot = await getDocs(adsRef);
    
    console.log(`📊 Found ${allDocsSnapshot.size} total documents`);
    
    const allAds = [];
    const adsWithoutAdType = [];
    
    allDocsSnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      const ad = {
        id: docSnapshot.id,
        ...data,
        // Convert timestamps for JSON serialization
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null
      };
      
      // Check if adType is missing and infer it from dimensions or other fields
      if (!ad.adType) {
        console.log(`⚠️ Document ${docSnapshot.id} missing adType field:`, {
          title: ad.title,
          dimensions: ad.dimensions,
          status: ad.status
        });
        
        // Try to infer adType from dimensions
        if (ad.dimensions) {
          const dims = ad.dimensions.toLowerCase();
          if (dims.includes('320') || dims.includes('mobile')) {
            ad.adType = 'mobile';
          } else if (dims.includes('728') || dims.includes('banner')) {
            ad.adType = 'banner';
          } else if (dims.includes('300') && dims.includes('250')) {
            ad.adType = 'sidebar';
          } else {
            ad.adType = 'banner'; // default fallback
          }
          console.log(`🔧 Inferred adType: ${ad.adType} for document ${docSnapshot.id}`);
        } else {
          ad.adType = 'mobile'; // default fallback
          console.log(`🔧 Using default adType: mobile for document ${docSnapshot.id}`);
        }
        
        adsWithoutAdType.push({
          id: docSnapshot.id,
          adType: ad.adType
        });
      }
      
      allAds.push(ad);
    });

    // If we found ads without adType, update them in Firestore
    if (adsWithoutAdType.length > 0) {
      console.log(`🔧 Updating ${adsWithoutAdType.length} documents with missing adType...`);
      try {
        const batch = writeBatch(db);
        
        adsWithoutAdType.forEach(({ id, adType }) => {
          const docRef = doc(db, COLLECTION_NAME, id);
          batch.update(docRef, { 
            adType,
            updatedAt: serverTimestamp()
          });
        });
        
        await batch.commit();
        console.log('✅ Successfully updated documents with adType');
      } catch (updateError) {
        console.error('⚠️ Failed to update documents with adType:', updateError);
        // Continue anyway - we can still return the data with inferred adType
      }
    }

    // Filter ads based on request
    let filteredAds = allAds;

    // Apply status filter
    if (!includeInactive) {
      filteredAds = filteredAds.filter(ad => ad.status === status);
      console.log(`🔍 Filtered by status '${status}': ${filteredAds.length} ads`);
    }

    // Apply type filter
    if (requestedType) {
      filteredAds = filteredAds.filter(ad => ad.adType === requestedType);
      console.log(`🔍 Filtered by type '${requestedType}': ${filteredAds.length} ads`);
    }

    // Sort by creation date (newest first)
    filteredAds.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });

    console.log(`🎉 Returning ${filteredAds.length} ads`);

    // If debug mode, include additional information
    if (debugMode) {
      return NextResponse.json({
        success: true,
        debug: true,
        ads: filteredAds,
        count: filteredAds.length,
        totalInDatabase: allAds.length,
        updatedDocuments: adsWithoutAdType.length,
        query: { requestedType, status, includeInactive },
        allAdTypes: [...new Set(allAds.map(ad => ad.adType))],
        message: 'Debug information included'
      });
    }

    return NextResponse.json({
      success: true,
      ads: filteredAds,
      count: filteredAds.length
    });

  } catch (error) {
    console.error('🚨 Error in GET /api/ads:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch ads',
      code: error.code || 'UNKNOWN_ERROR',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : 'Error details hidden in production'
    }, { status: 500 });
  }
}

// POST /api/ads - Create new ad with proper adType
export async function POST(request) {
  console.log('📝 POST /api/ads - Starting request...');
  
  try {
    const body = await request.json();
    console.log('📦 Request body received:', {
      title: body.title,
      url: body.url,
      adType: body.adType,
      dimensions: body.dimensions,
      status: body.status,
      approved: body.approved,
      hasDesktopImage: !!body.desktopImage,
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
    const requiredFields = { title, url, desktopImage, dimensions };
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.error('❌ Validation failed - missing required fields:', missingFields);
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields
      }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
      console.log('✅ URL validation passed');
    } catch {
      console.error('❌ Invalid URL format:', url);
      return NextResponse.json({
        success: false,
        error: 'Invalid URL format'
      }, { status: 400 });
    }

    // Validate image format
    if (!desktopImage.startsWith('data:image/')) {
      console.error('❌ Invalid desktop image format');
      return NextResponse.json({
        success: false,
        error: 'Invalid desktop image format. Images should be base64 encoded.'
      }, { status: 400 });
    }

    // Determine adType if not provided, based on dimensions
    let finalAdType = adType;
    if (!finalAdType && dimensions) {
      const dims = dimensions.toLowerCase();
      if (dims.includes('320') || dims.includes('mobile')) {
        finalAdType = 'mobile';
      } else if (dims.includes('728')) {
        finalAdType = 'banner';
      } else if (dims.includes('300') && dims.includes('250')) {
        finalAdType = 'sidebar';
      } else {
        finalAdType = 'banner'; // default
      }
      console.log(`🔧 Inferred adType: ${finalAdType} from dimensions: ${dimensions}`);
    } else if (!finalAdType) {
      finalAdType = 'mobile'; // ultimate fallback
      console.log('🔧 Using default adType: mobile');
    }

    // Validate final adType
    const validAdTypes = ['banner', 'sidebar', 'mobile', 'footer', 'header'];
    if (!validAdTypes.includes(finalAdType)) {
      console.error('❌ Invalid adType:', finalAdType);
      return NextResponse.json({
        success: false,
        error: `Invalid adType. Must be one of: ${validAdTypes.join(', ')}`
      }, { status: 400 });
    }

    const adData = {
      title: title.trim(),
      url: url.trim(),
      desktopImage,
      mobileImage: mobileImage || desktopImage,
      adType: finalAdType, // Make sure adType is always set
      dimensions,
      contactEmail: contactEmail?.trim() || '',
      company: company?.trim() || '',
      status,
      approved,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      clicks: 0,
      impressions: 0
    };

    console.log('💾 Saving ad to Firestore with data:', {
      title: adData.title,
      adType: adData.adType,
      dimensions: adData.dimensions,
      status: adData.status,
      approved: adData.approved
    });

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
        status: adData.status
      }
    });

  } catch (error) {
    console.error('🚨 Error in POST /api/ads:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create ad',
      code: error.code || 'UNKNOWN_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// PUT /api/ads - Update ad
export async function PUT(request) {
  console.log('✏️ PUT /api/ads - Starting request...');
  
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    console.log('📝 Update request:', { id, updateFields: Object.keys(updates) });

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

    console.log('✅ Ad updated successfully');
    return NextResponse.json({
      success: true,
      message: 'Ad updated successfully'
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
  console.log('🗑️ DELETE /api/ads - Starting request...');
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('🗑️ Delete request for ID:', id);

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Ad ID is required'
      }, { status: 400 });
    }

    const adRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(adRef);

    console.log('✅ Ad deleted successfully');
    return NextResponse.json({
      success: true,
      message: 'Ad deleted successfully'
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