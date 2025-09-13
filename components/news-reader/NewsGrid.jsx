'use client';

import { Heart, X, Upload, ExternalLink, CreditCard } from 'lucide-react';
import { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import RecommendedOverlayBottom from '@/components/news-reader/Overlay';
import { Card, CardContent } from '@/components/UI/newscard';
import { FileText, Clock, Globe, Building, Users, ArrowRight, Plus } from 'lucide-react';
import PublisherFavoriteButton from '@/components/PublisherFavoriteButton';

function dedupeArticles(articles = []) {
  const seen = new Set();
  const out = [];
  for (const a of articles) {
    const key = a.link || a.title;
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(a);
  }
  return out;
}

// Helper function to strip HTML tags and clean text
function stripHtml(html) {
  if (!html) return '';
  
  // Create a temporary div element to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Get text content and clean it up
  let text = temp.textContent || temp.innerText || '';
  
  // Remove extra whitespace and normalize
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

// Helper function to truncate text to a specific length
function truncateText(text, maxLength = 150) {
  if (!text) return '';
  
  const cleaned = stripHtml(text);
  
  if (cleaned.length <= maxLength) return cleaned;
  
  return cleaned.substring(0, maxLength).trim() + '...';
}

// First, let's add debugging to see what's actually stored in your database
// Add this temporary debug component to check your ad data

function AdImageDebugger() {
  const [ads, setAds] = useState([]);
  const [selectedAd, setSelectedAd] = useState(null);

  useEffect(() => {
    fetchAdsForDebugging();
  }, []);

  const fetchAdsForDebugging = async () => {
    try {
      const response = await fetch('/api/ads?debug=true&includeInactive=true');
      const data = await response.json();
      if (data.success) {
        setAds(data.ads);
        console.log('Debug: All ads data:', data.ads);
      }
    } catch (error) {
      console.error('Debug fetch error:', error);
    }
  };

  const analyzeImage = (imageData) => {
    if (!imageData) return 'No image data';
    
    console.log('Image analysis:', {
      type: typeof imageData,
      length: imageData.length,
      startsWithData: imageData.startsWith('data:'),
      firstChars: imageData.substring(0, 50),
      hasComma: imageData.includes(','),
      extension: imageData.substring(5, imageData.indexOf(';')) || 'unknown'
    });

    // Check if it's valid base64
    if (imageData.startsWith('data:image/')) {
      const base64Part = imageData.split(',')[1];
      if (base64Part) {
        try {
          atob(base64Part);
          return 'Valid base64 data URL';
        } catch (e) {
          return 'Invalid base64 encoding';
        }
      } else {
        return 'Missing base64 data after comma';
      }
    } else {
      return 'Not a data URL format';
    }
  };

  return (
    <div className="p-6 bg-white border rounded-lg">
      <h3 className="text-lg font-bold mb-4">Ad Image Debugger</h3>
      
      {ads.length === 0 ? (
        <p>No ads found or loading...</p>
      ) : (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Ad to Debug:</label>
            <select 
              value={selectedAd?.id || ''}
              onChange={(e) => setSelectedAd(ads.find(ad => ad.id === e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Choose an ad...</option>
              {ads.map(ad => (
                <option key={ad.id} value={ad.id}>
                  {ad.title} (ID: {ad.id})
                </option>
              ))}
            </select>
          </div>

          {selectedAd && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Desktop Image Analysis */}
                <div className="border p-4 rounded">
                  <h4 className="font-semibold mb-2">Desktop Image</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Status: {analyzeImage(selectedAd.desktopImage)}
                  </p>
                  
                  {selectedAd.desktopImage && (
                    <>
                      <div className="text-xs text-gray-500 mb-2">
                        Length: {selectedAd.desktopImage.length} chars<br/>
                        Type: {selectedAd.desktopImage.substring(5, selectedAd.desktopImage.indexOf(';')) || 'unknown'}<br/>
                        First 100 chars: {selectedAd.desktopImage.substring(0, 100)}...
                      </div>
                      
                      {/* Try to display the image */}
                      <div className="mb-2">
                        <p className="text-xs mb-1">Rendering attempt:</p>
                        <img
                          src={selectedAd.desktopImage}
                          alt="Debug test"
                          className="w-32 h-24 border border-gray-300 object-cover"
                          onLoad={() => console.log('✅ Image loaded successfully!')}
                          onError={(e) => {
                            console.log('❌ Image failed to load');
                            console.log('Error details:', e);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div 
                          className="w-32 h-24 bg-red-100 border border-red-300 flex items-center justify-center text-xs text-red-600"
                          style={{ display: 'none' }}
                        >
                          Failed to load
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Mobile Image Analysis */}
                <div className="border p-4 rounded">
                  <h4 className="font-semibold mb-2">Mobile Image</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Status: {analyzeImage(selectedAd.mobileImage)}
                  </p>
                  
                  {selectedAd.mobileImage && selectedAd.mobileImage !== selectedAd.desktopImage && (
                    <>
                      <div className="text-xs text-gray-500 mb-2">
                        Length: {selectedAd.mobileImage.length} chars<br/>
                        Type: {selectedAd.mobileImage.substring(5, selectedAd.mobileImage.indexOf(';')) || 'unknown'}
                      </div>
                      
                      <div className="mb-2">
                        <p className="text-xs mb-1">Rendering attempt:</p>
                        <img
                          src={selectedAd.mobileImage}
                          alt="Debug test mobile"
                          className="w-32 h-24 border border-gray-300 object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div 
                          className="w-32 h-24 bg-red-100 border border-red-300 flex items-center justify-center text-xs text-red-600"
                          style={{ display: 'none' }}
                        >
                          Failed to load
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Full Ad Data */}
              <div className="border p-4 rounded">
                <h4 className="font-semibold mb-2">Full Ad Data</h4>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                  {JSON.stringify({
                    id: selectedAd.id,
                    title: selectedAd.title,
                    url: selectedAd.url,
                    adType: selectedAd.adType,
                    status: selectedAd.status,
                    approved: selectedAd.approved,
                    dimensions: selectedAd.dimensions,
                    hasDesktopImage: !!selectedAd.desktopImage,
                    hasMobileImage: !!selectedAd.mobileImage,
                    desktopImageStart: selectedAd.desktopImage?.substring(0, 50),
                    createdAt: selectedAd.createdAt
                  }, null, 2)}
                </pre>
              </div>

              {/* Fix Button */}
              <div className="border p-4 rounded bg-blue-50">
                <h4 className="font-semibold mb-2">Quick Fix</h4>
                <p className="text-sm text-gray-600 mb-2">
                  If the image data looks corrupted, you can try to re-upload:
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFix(e.target.files[0], selectedAd)}
                  className="text-sm"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  async function handleImageFix(file, ad) {
    if (!file || !ad) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const newBase64 = e.target.result;
      console.log('New image data:', newBase64.substring(0, 100));

      // Update the ad with the new image
      try {
        const response = await fetch('/api/ads', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: ad.id,
            desktopImage: newBase64
          })
        });

        if (response.ok) {
          alert('Image updated! Refresh to see changes.');
          fetchAdsForDebugging();
        }
      } catch (error) {
        console.error('Fix error:', error);
      }
    };
    reader.readAsDataURL(file);
  }
}

// Fixed AdSlot component with better error handling
function FixedAdSlot({ 
  adType, 
  width, 
  height, 
  className = "", 
  onAdvertiseClick 
}) {
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoadErrors, setImageLoadErrors] = useState({});

  useEffect(() => {
    fetchAds();
  }, [adType]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching ads for type: ${adType}`);
      
      // Add debug parameter to get more info
      const response = await fetch(`/api/ads?type=${adType}&status=active&debug=true`);
      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (data.success) {
        // Filter for truly valid ads
        const validAds = data.ads.filter(ad => {
          const hasValidImage = ad.desktopImage && 
            typeof ad.desktopImage === 'string' && 
            ad.desktopImage.length > 100; // Must be substantial data
          
          console.log(`Ad ${ad.id} validation:`, {
            hasDesktopImage: !!ad.desktopImage,
            imageType: typeof ad.desktopImage,
            imageLength: ad.desktopImage?.length,
            startsWithData: ad.desktopImage?.startsWith('data:'),
            isValid: hasValidImage
          });
          
          return ad.status === 'active' && 
                 (ad.approved === true || ad.approved === 'true') && 
                 hasValidImage;
        });
        
        console.log(`Found ${validAds.length} valid ads out of ${data.ads.length} total`);
        setAds(validAds);
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (e, ad) => {
    console.error(`Image load failed for ad ${ad.id}:`, {
      title: ad.title,
      imageStart: ad.desktopImage?.substring(0, 100),
      imageLength: ad.desktopImage?.length,
      error: e
    });
    
    setImageLoadErrors(prev => ({
      ...prev,
      [ad.id]: true
    }));
  };

  const handleImageLoad = (ad) => {
    console.log(`Image loaded successfully for ad: ${ad.title}`);
    setImageLoadErrors(prev => ({
      ...prev,
      [ad.id]: false
    }));
  };

  if (loading) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse rounded-lg flex items-center justify-center ${className}`}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <span className="text-gray-400 text-sm">Loading ads...</span>
      </div>
    );
  }

  if (error || ads.length === 0) {
    return (
      <div 
        className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:bg-gray-50 transition-colors ${className}`}
        style={{ width: `${width}px`, height: `${height}px` }}
        onClick={onAdvertiseClick}
      >
        <div className="text-2xl mb-2">📢</div>
        <p className="text-sm font-medium text-gray-600">Advertise Here</p>
        <p className="text-xs text-gray-500 mt-1">{width}×{height}px</p>
        {error && (
          <p className="text-xs text-red-500 mt-2">Error: {error}</p>
        )}
      </div>
    );
  }

  const currentAd = ads[currentAdIndex];
  const hasImageError = imageLoadErrors[currentAd.id];

  return (
    <div 
      className={`relative rounded-lg overflow-hidden border border-gray-200 cursor-pointer group bg-gray-100 ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
      onClick={() => currentAd.url && window.open(currentAd.url, '_blank')}
    >
      {/* Try to show the image */}
      {!hasImageError && currentAd.desktopImage && (
        <img
          src={currentAd.desktopImage}
          alt={`Advertisement - ${currentAd.title}`}
          className="w-full h-full object-cover"
          onError={(e) => handleImageError(e, currentAd)}
          onLoad={() => handleImageLoad(currentAd)}
          style={{ 
            backgroundColor: '#f3f4f6',
            minHeight: '100%',
            minWidth: '100%'
          }}
        />
      )}
      
      {/* Fallback content */}
      {(hasImageError || !currentAd.desktopImage) && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 text-white flex flex-col items-center justify-center p-4 text-center">
          <div className="text-2xl mb-2">🎯</div>
          <h3 className="font-bold text-lg mb-1">{currentAd.title}</h3>
          <p className="text-sm opacity-90 mb-2">Click to visit</p>
          <p className="text-xs opacity-75 truncate max-w-full">
            {currentAd.url}
          </p>
        </div>
      )}
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity" />
      
      {/* Ad label */}
      <div className="absolute top-2 left-2 text-xs text-white bg-black bg-opacity-70 px-2 py-1 rounded">
        Ad
      </div>
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-0 right-0 text-xs text-white bg-black bg-opacity-75 p-1 max-w-full">
          ID: {currentAd.id}<br/>
          Img: {currentAd.desktopImage ? 'Yes' : 'No'}<br/>
          Err: {hasImageError ? 'Yes' : 'No'}
        </div>
      )}
    </div>
  );
}

// Ad Component
// Fixed AdSlot component with better image rendering
// Fixed AdSlot component based on working diagnostic approach
// Ultra-simple AdSlot - bare minimum approach
function AdSlot({ 
  adType, 
  width, 
  height, 
  className = "", 
  onAdvertiseClick 
}) {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Device visibility
  const getResponsiveClasses = () => {
    if (adType.includes('sidebar') || adType.includes('rectangle') || adType.includes('skyscraper')) {
      return 'hidden lg:block';
    }
    if (adType === 'mobile') {
      return 'block lg:hidden';
    }
    return '';
  };

  useEffect(() => {
    fetchAds();
  }, []);

  // Simple rotation every 8 seconds
  useEffect(() => {
    if (ads.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % (ads.length + 1));
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [ads.length]);

  const fetchAds = async () => {
    try {
      const response = await fetch(`/api/ads?type=${adType}&status=active`);
      const data = await response.json();
      
      if (data.success) {
        const validAds = data.ads.filter(ad => 
          ad.desktopImage && 
          ad.desktopImage.startsWith('data:image/') &&
          ad.status === 'active'
        );
        setAds(validAds);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const responsiveClasses = getResponsiveClasses();

  if (loading) {
    return (
      <div className={`bg-gray-300 rounded ${className} ${responsiveClasses}`}
           style={{ width, height }}>
        Loading...
      </div>
    );
  }

  // Show advertise here if no ads OR on last rotation cycle
  if (ads.length === 0 || currentIndex >= ads.length) {
    return (
      <div 
        className={`bg-blue-100 border-2 border-dashed border-blue-400 rounded cursor-pointer ${className} ${responsiveClasses}`}
        style={{ width, height }}
        onClick={onAdvertiseClick}
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          textAlign: 'center',
          padding: '8px'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📢</div>
          <div style={{ fontWeight: 'bold', color: '#1e40af' }}>Advertise Here</div>
          <div style={{ fontSize: '12px', color: '#3b82f6' }}>{width}x{height}</div>
        </div>
      </div>
    );
  }

  const ad = ads[currentIndex];
  if (!ad) return null;

  return (
    <div className={`${className} ${responsiveClasses}`}>
      <div 
        style={{ 
          width, 
          height, 
          position: 'relative',
          border: '1px solid #ccc',
          borderRadius: '8px',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
        onClick={() => ad.url && window.open(ad.url, '_blank')}
      >
        {/* Just the image - nothing else */}
        <img
          src={ad.desktopImage}
          alt={ad.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        
        {/* Simple ad label */}
        <div style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '10px'
        }}>
          Ad
        </div>
      </div>
    </div>
  );
}

// Ad Creation Modal
// Improved Ad Creation Modal with better image handling
function AdCreationModal({ isOpen, onClose, adType, dimensions }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    desktopImage: null,
    mobileImage: null,
    desktopImagePreview: '',
    mobileImagePreview: '',
    contactEmail: '',
    company: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});

  if (!isOpen) return null;

  // Improved file upload handler (similar to profile picture logic)
  const handleFileUpload = async (file, type) => {
    if (!file) return;

    console.log(`📤 Processing ${type} image:`, {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      type: file.type
    });

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        [`${type}Image`]: 'File size must be less than 5MB'
      }));
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({
        ...prev,
        [`${type}Image`]: 'File must be an image'
      }));
      return;
    }

    setUploadProgress(prev => ({ ...prev, [type]: 0 }));

    const reader = new FileReader();
    
    reader.onloadstart = () => {
      setUploadProgress(prev => ({ ...prev, [type]: 10 }));
    };

    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 80) + 10; // 10-90%
        setUploadProgress(prev => ({ ...prev, [type]: progress }));
      }
    };

    reader.onload = (e) => {
      const base64 = e.target.result;
      
      // Validate the base64 result
      if (!base64 || !base64.startsWith('data:image/')) {
        console.error('❌ Invalid base64 result:', base64?.substring(0, 50));
        setErrors(prev => ({
          ...prev,
          [`${type}Image`]: 'Failed to process image'
        }));
        setUploadProgress(prev => ({ ...prev, [type]: 0 }));
        return;
      }

      console.log(`✅ ${type} image processed successfully:`, {
        size: `${(base64.length / 1024 / 1024).toFixed(2)}MB`,
        format: base64.substring(5, base64.indexOf(';')),
        isValid: base64.startsWith('data:image/')
      });

      // Clear any previous errors
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${type}Image`];
        return newErrors;
      });

      // Update form data with the base64 string (like profile picture)
      setFormData(prev => ({
        ...prev,
        [`${type}Image`]: base64, // Store the full base64 data URL
        [`${type}ImagePreview`]: base64 // Also use for preview
      }));

      setUploadProgress(prev => ({ ...prev, [type]: 100 }));

      // Clear progress after 2 seconds
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[type];
          return newProgress;
        });
      }, 2000);
    };

    reader.onerror = (error) => {
      console.error('❌ FileReader error:', error);
      setErrors(prev => ({
        ...prev,
        [`${type}Image`]: 'Failed to read file'
      }));
      setUploadProgress(prev => ({ ...prev, [type]: 0 }));
    };

    reader.readAsDataURL(file);
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.url.trim()) newErrors.url = 'URL is required';
    if (formData.url && !formData.url.match(/^https?:\/\/.+/)) {
      newErrors.url = 'URL must start with http:// or https://';
    }
    if (!formData.desktopImage) newErrors.desktopImage = 'Desktop image is required';
    
    // Validate base64 format
    if (formData.desktopImage && !formData.desktopImage.startsWith('data:image/')) {
      newErrors.desktopImage = 'Invalid image format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Prepare the ad data (similar to profile picture submission)
      const adData = {
        title: formData.title.trim(),
        url: formData.url.trim(),
        desktopImage: formData.desktopImage, // Full base64 data URL
        mobileImage: formData.mobileImage || formData.desktopImage, // Use desktop as fallback
        adType,
        dimensions,
        contactEmail: formData.contactEmail?.trim() || '',
        company: formData.company?.trim() || '',
        status: 'active',
        approved: true,
        createdAt: new Date().toISOString()
      };

      console.log('📤 Submitting ad data:', {
        title: adData.title,
        url: adData.url,
        adType: adData.adType,
        dimensions: adData.dimensions,
        hasDesktopImage: !!adData.desktopImage,
        desktopImageSize: adData.desktopImage ? `${(adData.desktopImage.length / 1024 / 1024).toFixed(2)}MB` : 'none',
        hasMobileImage: !!adData.mobileImage,
        company: adData.company,
        contactEmail: adData.contactEmail
      });

      const response = await fetch('/api/ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adData),
      });

      console.log(`📡 API Response status: ${response.status}`);
      const result = await response.json();
      console.log('📊 API Response:', result);
      
      if (result.success) {
        console.log('✅ Ad created successfully with ID:', result.id);
        alert('Ad created successfully! It will appear on the site shortly.');
        onClose();
        // Refresh to show new ad
        window.location.reload();
      } else {
        console.error('❌ API returned error:', result);
        if (result.errors && Array.isArray(result.errors)) {
          alert('Error creating ad:\n' + result.errors.join('\n'));
        } else {
          alert('Error creating ad: ' + (result.error || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('🚨 Error creating ad:', error);
      alert('Error creating ad: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Create Advertisement</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Ad Details */}
        {step === 1 && (
          <div className="p-6 space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Step 1 of 3: Ad Details ({dimensions.width}×{dimensions.height})
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter ad title"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target URL *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://your-website.com"
              />
              {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desktop Image * ({dimensions.width}×{dimensions.height}px)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files[0], 'desktop')}
                className="w-full p-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploadProgress.desktop > 0 && uploadProgress.desktop < 100 && (
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress.desktop}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Uploading... {uploadProgress.desktop}%</p>
                </div>
              )}
              {errors.desktopImage && <p className="text-red-500 text-xs mt-1">{errors.desktopImage}</p>}
              {formData.desktopImagePreview && (
                <div className="mt-2">
                  <img
                    src={formData.desktopImagePreview}
                    alt="Desktop preview"
                    className="max-w-full h-auto border border-gray-300 rounded"
                    style={{ maxHeight: '200px' }}
                    onLoad={() => console.log('✅ Preview image loaded')}
                    onError={() => console.error('❌ Preview image failed to load')}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Image (Optional - will use desktop if not provided)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files[0], 'mobile')}
                className="w-full p-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploadProgress.mobile > 0 && uploadProgress.mobile < 100 && (
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress.mobile}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Uploading... {uploadProgress.mobile}%</p>
                </div>
              )}
              {errors.mobileImage && <p className="text-red-500 text-xs mt-1">{errors.mobileImage}</p>}
              {formData.mobileImagePreview && (
                <div className="mt-2">
                  <img
                    src={formData.mobileImagePreview}
                    alt="Mobile preview"
                    className="max-w-full h-auto border border-gray-300 rounded"
                    style={{ maxHeight: '100px' }}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleNext}
                disabled={!formData.desktopImage || Object.keys(errors).length > 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 2 && (
          <div className="p-6 space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Step 2 of 3: Preview Your Ad
            </div>

            <div className="text-center space-y-4">
              <h3 className="font-medium">{formData.title}</h3>
              
              <div className="flex justify-center">
                <div 
                  className="border border-gray-300 rounded cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden"
                  style={{ width: `${Math.min(dimensions.width, 300)}px`, height: `${Math.min(dimensions.height, 200)}px` }}
                  onClick={() => window.open(formData.url, '_blank')}
                >
                  <img
                    src={formData.desktopImagePreview}
                    alt="Ad preview"
                    className="w-full h-full object-cover"
                    onLoad={() => console.log('✅ Preview loaded in step 2')}
                    onError={() => console.error('❌ Preview failed in step 2')}
                  />
                  <div className="absolute top-1 left-1 text-xs text-white bg-black bg-opacity-50 px-1 rounded">
                    Ad
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Clicking the ad will redirect to: <br />
                <span className="text-blue-600 break-all">{formData.url}</span>
              </p>

              <div className="text-xs text-gray-500">
                Actual size: {dimensions.width}×{dimensions.height}px
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Continue to Details
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Final Details */}
        {step === 3 && (
          <div className="p-6 space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Step 3 of 3: Final Details
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="contact@company.com"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                  <p className="text-sm text-blue-800">
                    Your ad will be published immediately and will appear on the site within a few minutes.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Publish Ad'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NewsGrid({ articles }) {
  const unique = dedupeArticles(articles || []);
  const [newsources, setNewsources] = useState([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [sourcesError, setSourcesError] = useState(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [selectedAdType, setSelectedAdType] = useState('');
  const [selectedDimensions, setSelectedDimensions] = useState({});
  const router = useRouter();

  // Fetch news sources with their recent articles
  useEffect(() => {
    const fetchNewsSources = async () => {
      try {
        setLoadingSources(true);
        setSourcesError(null);
        
        const response = await fetch('/api/news-sources');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Fetch recent articles for each publisher
          const sourcesWithArticles = await Promise.all(
            (data.newsources || []).map(async (source) => {
              try {
                // Fetch recent articles for this publisher
                const articlesResponse = await fetch(`/api/news-sources/${source.id}/articles`);
                
                if (articlesResponse.ok) {
                  const articlesData = await articlesResponse.json();
                  
                  if (articlesData.success && articlesData.articles && articlesData.articles.length > 0) {
                    // Get the most recent article
                    const recentArticle = articlesData.articles[0];
                    
                    // Clean the title and content
                    const cleanTitle = stripHtml(recentArticle.title);
                    const cleanExcerpt = truncateText(
                      recentArticle.summary || recentArticle.content,
                      150
                    );
                    
                    return {
                      ...source,
                      recentStory: {
                        title: cleanTitle,
                        excerpt: cleanExcerpt || 'No preview available',
                        url: `/news-reader/article/${recentArticle.id}?publisherId=${source.id}`,
                        image: recentArticle.imageUrl,
                        publishedDate: recentArticle.createdAt,
                        category: recentArticle.category
                      },
                      articleCount: articlesData.totalArticles || articlesData.articles.length,
                      hasArticles: articlesData.articles.length > 0
                    };
                  }
                }
                
                // Return source with no recent story if fetch fails or no articles
                return {
                  ...source,
                  recentStory: null,
                  hasArticles: false
                };
              } catch (articleError) {
                console.warn(`Failed to fetch articles for ${source.name}:`, articleError);
                return {
                  ...source,
                  recentStory: null,
                  hasArticles: false
                };
              }
            })
          );
          
          setNewsources(sourcesWithArticles);
        } else {
          throw new Error(data.error || 'Failed to fetch news sources');
        }
      } catch (error) {
        console.error('Error fetching news sources:', error);
        setSourcesError(error.message);
        setNewsources([]); // Set empty array on error
      } finally {
        setLoadingSources(false);
      }
    };

    fetchNewsSources();
  }, []);

  const handleSourceClick = (source) => {
    // Navigate to specific publisher's articles page
    router.push(`/news-reader/publisher/${source.id}`);
  };

  const handleReadMoreClick = (e, storyUrl) => {
    e.stopPropagation(); // Prevent card click
    if (storyUrl && storyUrl !== '#') {
      // Check if it's an internal link
      if (storyUrl.startsWith('/')) {
        router.push(storyUrl);
      } else {
        window.open(storyUrl, '_blank');
      }
    }
  };

  const handleAdvertiseClick = (adType, dimensions) => {
    setSelectedAdType(adType);
    setSelectedDimensions(dimensions);
    setShowAdModal(true);
  };

  const retryFetchSources = () => {
    setSourcesError(null);
    setLoadingSources(true);
    // Re-run the effect by changing a dependency
    window.location.reload(); // Simple reload for now
  };

  return (
    <div className="relative">
      {/* Bottom-sheet overlay */}
      <RecommendedOverlayBottom articles={unique} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 px-4 sm:px-6 pb-10">
        {/* MAIN COLUMN */}
        <div className="space-y-6">
          {/* News Sources Section */}
          <section className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold">Top Headlines</h2>
              {!loadingSources && !sourcesError && (
                <span className="text-sm text-gray-500">
                  {newsources.length} publisher{newsources.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            {/* Error State */}
            {sourcesError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-800 font-medium">Failed to load news sources</p>
                    <p className="text-red-600 text-sm mt-1">{sourcesError}</p>
                  </div>
                  <button 
                    onClick={retryFetchSources}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
            
            {/* Loading State */}
            {loadingSources && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                          <div className="h-2 bg-gray-300 rounded w-2/3"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {/* News Sources Grid */}
            {!loadingSources && !sourcesError && newsources.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {newsources.map((source, idx) => (
                  <Fragment key={`item-${source.id}`}>
                    <Card 
                      key={source.id} 
                      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() => handleSourceClick(source)}
                    >
                      <CardContent className="p-4">
                        {/* Publisher Name (centered header) */}
                        <div className="text-center mb-3">
                          <h1 className="text-base font-bold text-gray-900 truncate">
                            {stripHtml(source.name)}
                          </h1>
                        </div>

                        {/* Logo + Story */}
                        <div className="flex items-start space-x-3 mb-3">
                          {/* Logo */}
                          <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20">
                            {source.logo ? (
                              <img
                                src={source.logo}
                                alt={`${source.name} logo`}
                                className="w-full h-full rounded-lg object-contain border border-gray-200 bg-white"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#329ae1] rounded-lg flex items-center justify-center">
                                <span className="text-white font-semibold text-lg">
                                  {stripHtml(source.name).charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Story Content */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                              {source.recentStory?.title ||
                                "Ramaphosa pledges to tackle youth unemployment in new economic plan"}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-3">
                              {source.recentStory?.excerpt ||
                                "President announces comprehensive strategy to address rising unemployment rates among South African youth, focusing on skills development and job creation initiatives."}
                            </p>
                            <button
                              onClick={(e) =>
                                handleReadMoreClick(e, source.recentStory?.url || "#")
                              }
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                            >
                              Read more
                            </button>
                          </div>
                        </div>

                        {/* Post Info + Favorites aligned in one row */}
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                          <div className="flex items-center space-x-4">
                            <span>Last Post: {source.lastPosted || "1d ago"}</span>
                            <a 
                              href={source.website || "https://www.dailysun.co.za"} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="hidden sm:inline text-gray-500 hover:underline"
                            >
                              {source.website?.replace(/^https?:\/\//, "") || "www.dailysun.co.za"}
                            </a>
                          </div>
                          <PublisherFavoriteButton
                            type="button"
                            publisher={source}
                            size="default"
                            showText={false}
                            className="hidden sm:inline-flex p-2 rounded-full bg-gray-100 hover:bg-red-100 transition-colors"
                            disabled
                          />
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Mobile ads between articles (every 5th article, only on small screens) */}
                    {((idx + 1) % 5 === 0) && (
                      <div className="sm:col-span-2 lg:hidden">
                        <AdSlot 
                          adType="mobile"
                          width={320}
                          height={50}
                          className="w-full"
                          onAdvertiseClick={() => handleAdvertiseClick('mobile', { width: 320, height: 50 })}
                        />
                      </div>
                    )}
                  </Fragment>
                ))}
              </div>
            )}
            
            {/* Empty State */}
            {!loadingSources && !sourcesError && newsources.length === 0 && (
              <div className="text-center py-8">
                <Building className="mx-auto h-8 w-8 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No publishers yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Publisher folders will automatically appear here when they register.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT SIDEBAR (desktop ads only) */}
        <aside className="hidden lg:block space-y-6 lg:sticky lg:top-20 h-fit">
          {/* Rectangle Ad (300x250) */}
          <AdSlot 
            adType="sidebar_rectangle"
            width={300}
            height={250}
            onAdvertiseClick={() => handleAdvertiseClick('sidebar_rectangle', { width: 300, height: 250 })}
          />
          
          {/* Skyscraper Ad (300x600) */}
          <AdSlot 
            adType="sidebar_skyscraper"
            width={300}
            height={600}
            onAdvertiseClick={() => handleAdvertiseClick('sidebar_skyscraper', { width: 300, height: 600 })}
          />
          
          {/* Another Rectangle Ad (300x250) */}
          <AdSlot 
            adType="sidebar_rectangle2"
            width={300}
            height={250}
            onAdvertiseClick={() => handleAdvertiseClick('sidebar_rectangle2', { width: 300, height: 250 })}
          />
        </aside>
      </div>

      {/* Ad Creation Modal */}
      <AdCreationModal
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        adType={selectedAdType}
        dimensions={selectedDimensions}
      />
    </div>
  );
}