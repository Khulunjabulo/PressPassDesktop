'use client';

import { Heart, X, Upload, ExternalLink, CreditCard } from 'lucide-react';
import { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { useFavorites } from '@/hooks/useFavorites';
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

// Updated AdSlot component with proper mobile image support

// Updated AdSlot component with proper mobile image support and publisher page styling
function AdSlot({ 
  adType, 
  width, 
  height, 
  className = "", 
  onAdvertiseClick,
  isBanner = false 
}) {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Device visibility
  const getResponsiveClasses = () => {
    if (isBanner) {
      return ''; // Banner shows on all devices
    }
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
        const validAds = data.ads.filter(ad => {
          // Check if has at least desktop image
          const hasDesktopImage = ad.desktopImage && 
            ad.desktopImage.startsWith('data:image/') && 
            ad.status === 'active';
          
          // For mobile devices, prefer mobile image if available
          if (isMobile && ad.mobileImage && ad.mobileImage.startsWith('data:image/')) {
            return hasDesktopImage; // Still need desktop as fallback
          }
          
          return hasDesktopImage;
        });
        setAds(validAds);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const responsiveClasses = getResponsiveClasses();

  // Get container dimensions based on ad type
  const getContainerStyle = () => {
    if (isBanner) {
      return { width: '100%', height: '90px' };
    }
    
    // For mobile vertical ad
    if (adType === 'mobile') {
      return { width: '100%', height: '250px', maxWidth: '320px', margin: '0 auto' };
    }
    
    return { width, height };
  };

  if (loading) {
    return (
      <div 
        className={`bg-gray-300 rounded animate-pulse flex items-center justify-center ${className} ${responsiveClasses}`}
        style={getContainerStyle()}
      >
        <span className="text-gray-500 text-sm">Loading...</span>
      </div>
    );
  }

  // Show advertise here if no ads OR on last rotation cycle
  if (ads.length === 0 || currentIndex >= ads.length) {
    return (
      <div 
        className={`bg-[#3ba6e7] rounded-md shadow-md cursor-pointer hover:shadow-lg transition-shadow ${className} ${responsiveClasses}`}
        style={getContainerStyle()}
        onClick={onAdvertiseClick}
      >
        {/* Banner Ad Styling */}
        {isBanner && (
          <div className="h-full flex items-center justify-between px-4 sm:px-8">
            <div className="flex flex-col items-center mt-5">
              <img 
                src="/Presspass.png" 
                alt="PressPass Logo" 
                height={150} 
                width={150} 
                className="object-contain" 
              /> 
            </div>
            <div className="flex flex-col justify-center items-center space-y-2 text-center mx-auto">
              <h3 className="text-yellow-400 font-bold text-base sm:text-lg">Advertise Here</h3>
              <p className="text-white text-xs sm:text-sm flex flex-col items-center space-y-1">
                <span>Partners@presspass.africa</span>
              </p>
              <p className="text-white text-xs sm:text-sm flex flex-col items-center space-y-1">
                <span>Phone: +27 87 XXX XXX</span>
              </p>
            </div>
          </div>
        )}

        {/* Sidebar Square Ad Styling */}
        {(adType.includes('sidebar') || adType.includes('rectangle')) && !adType.includes('skyscraper') && (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-3">
              <img 
                src="/Presspass.png" 
                alt="PressPass Logo" 
                height={80} 
                width={80} 
                className="object-contain mx-auto" 
              /> 
            </div>
            <h3 className="text-yellow-400 font-bold text-lg mb-2">Advertise Here</h3>
            <p className="text-white text-xs mb-1">Partners@presspass.africa</p>
            <p className="text-white text-xs">Phone: +27 87 XXX XXX</p>
            <div className="mt-2 text-white text-xs opacity-75">
              {width}×{height}
            </div>
          </div>
        )}

        {/* Skyscraper Ad Styling */}
        {adType.includes('skyscraper') && (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-4">
              <img 
                src="/Presspass.png" 
                alt="PressPass Logo" 
                height={100} 
                width={100} 
                className="object-contain mx-auto" 
              /> 
            </div>
            <h3 className="text-yellow-400 font-bold text-xl mb-3">Advertise Here</h3>
            <div className="space-y-2">
              <p className="text-white text-sm">Partners@presspass.africa</p>
              <p className="text-white text-sm">Phone: +27 87 XXX XXX</p>
            </div>
            <div className="mt-4 text-white text-xs opacity-75">
              {width}×{height}
            </div>
            <div className="mt-auto mb-4 text-white text-xs">
              Click to advertise
            </div>
          </div>
        )}

        {/* Mobile Vertical Ad Styling */}
        {adType === 'mobile' && (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-3">
              <img 
                src="/Presspass.png" 
                alt="PressPass Logo" 
                height={60} 
                width={60} 
                className="object-contain mx-auto" 
              /> 
            </div>
            <h3 className="text-yellow-400 font-bold text-base mb-2">Advertise Here</h3>
            <p className="text-white text-xs mb-1">Partners@presspass.africa</p>
            <p className="text-white text-xs mb-2">Phone: +27 87 XXX XXX</p>
            <div className="text-white text-xs opacity-75">
              Mobile Ad Space
            </div>
          </div>
        )}
      </div>
    );
  }

  const ad = ads[currentIndex];
  if (!ad) return null;

  // Choose the right image based on device and availability
  const getImageSrc = () => {
    if (isMobile && ad.mobileImage && ad.mobileImage.startsWith('data:image/')) {
      return ad.mobileImage;
    }
    return ad.desktopImage;
  };

  return (
    <div className={`${className} ${responsiveClasses}`}>
      <div 
        style={{ 
          ...getContainerStyle(),
          position: 'relative',
          border: '1px solid #ccc',
          borderRadius: '8px',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
        onClick={() => ad.url && window.open(ad.url, '_blank')}
      >
        {/* Ad Image */}
        <img
          src={getImageSrc()}
          alt={ad.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            console.error('Ad image failed to load:', ad.id);
            // Try fallback to desktop image if mobile failed
            if (isMobile && ad.mobileImage && e.target.src === ad.mobileImage) {
              e.target.src = ad.desktopImage;
            }
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

// Ad Creation Modal (updated to handle banner ads)
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

  const isBannerAd = adType === 'banner';

  // Improved file upload handler
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

      // Update form data with the base64 string
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
      
      // Prepare the ad data
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

      const result = await response.json();
      
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
          <h2 className="text-lg font-semibold">
            Create {isBannerAd ? 'Banner' : 'Advertisement'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Ad Details */}
        {step === 1 && (
          <div className="p-6 space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Step 1 of 3: Ad Details {isBannerAd ? '(728×90, Responsive)' : `(${dimensions.width}×${dimensions.height})`}
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
                Desktop Image * {isBannerAd ? '(728×90px recommended)' : `(${dimensions.width}×${dimensions.height}px)`}
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
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Image * {isBannerAd ? '(320×50px recommended)' : '(Mobile optimized version)'}
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
              <p className="text-xs text-gray-500 mt-1">
                Upload a mobile-optimized version for better performance on small screens
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleNext}
                disabled={!formData.desktopImage || !formData.mobileImage || Object.keys(errors).length > 0}
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
              
              {/* Desktop Preview */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Desktop Preview</h4>
                <div className="flex justify-center">
                  <div 
                    className="border border-gray-300 rounded cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden"
                    style={{ 
                      width: isBannerAd ? '100%' : `${Math.min(dimensions.width, 300)}px`, 
                      maxWidth: isBannerAd ? '728px' : 'none',
                      height: isBannerAd ? '90px' : `${Math.min(dimensions.height, 200)}px` 
                    }}
                    onClick={() => window.open(formData.url, '_blank')}
                  >
                    <img
                      src={formData.desktopImagePreview}
                      alt="Desktop ad preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 text-xs text-white bg-black bg-opacity-50 px-1 rounded">
                      Ad
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Preview */}
              {formData.mobileImagePreview && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Mobile Preview</h4>
                  <div className="flex justify-center">
                    <div 
                      className="border border-gray-300 rounded cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden"
                      style={{ 
                        width: '320px', 
                        height: isBannerAd ? '50px' : '100px'
                      }}
                      onClick={() => window.open(formData.url, '_blank')}
                    >
                      <img
                        src={formData.mobileImagePreview}
                        alt="Mobile ad preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 left-1 text-xs text-white bg-black bg-opacity-50 px-1 rounded">
                        Ad
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-600">
                Clicking the ad will redirect to: <br />
                <span className="text-blue-600 break-all">{formData.url}</span>
              </p>
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
  const { 
    isPublisherFavorite, 
    togglePublisherFavorite, 
    currentUser,
    loading: favoritesLoading 
  } = useFavorites();

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
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 px-4 sm:px-6 pb-10">
        {/* MAIN COLUMN */}
        <div className="space-y-6">
          {/* Banner Ad - Top of Headlines */}
          <section>
            <AdSlot 
              adType="banner"
              width={728}
              height={90}
              isBanner={true}
              className="w-full"
              onAdvertiseClick={() => handleAdvertiseClick('banner', { width: 728, height: 90 })}
            />
          </section>

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
            {!loadingSources && !sourcesError && newsources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {newsources.map((source, idx) => (
                  <Fragment key={source.id}>
                    <Card 
                      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative"
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
                                "Press Pass is a Media Monetization System with customer onboarding for digital referral services. "}
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
                            />
                        </div>

                        {/* Mobile Favorite Button */}
                        <PublisherFavoriteButton
                          publisher={source}
                          size="default"
                          showText={false}
                          className="sm:hidden absolute bottom-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-red-100 transition-colors"
                        />
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
            ) : null}
            
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

        {/* Recommended Articles Section (after main content) */}
        <RecommendedOverlayBottom articles={unique} />
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