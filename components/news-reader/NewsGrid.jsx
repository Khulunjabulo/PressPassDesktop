'use client';

import { Heart, X, Upload, ExternalLink, CreditCard } from 'lucide-react';
import { useState, useEffect, Fragment, useRef } from 'react';
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

// Updated AdCreationModal with Payment Integration - FIXED HOOKS
// Updated AdCreationModal - Payment Section Removed
function AdCreationModal({ isOpen, onClose, adType, dimensions }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    desktopImage: null,
    mobileImage: null,
    desktopImagePreview: '',
    mobileImagePreview: '',
    contactEmail: '',
    company: '',
    duration: 1,
    durationUnit: 'days',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [pricing, setPricing] = useState({ amount: 0, totalHours: 0 });

  const isBannerAd = adType === 'banner';

  useEffect(() => {
    if (isOpen && step === 3) {
      calculatePricing();
    }
  }, [formData.duration, formData.durationUnit, step, isOpen]);

  if (!isOpen) return null;

  const calculatePricing = () => {
    const duration = parseInt(formData.duration) || 1;
    const unit = formData.durationUnit;
    
    let totalHours;
    switch (unit) {
      case 'hours':
        totalHours = duration;
        break;
      case 'days':
        totalHours = duration * 24;
        break;
      case 'weeks':
        totalHours = duration * 24 * 7;
        break;
      case 'months':
        totalHours = duration * 24 * 30;
        break;
      default:
        totalHours = duration * 24;
    }
    
    let amount;
    const days = Math.ceil(totalHours / 24);
    
    if (isBannerAd) {
      if (totalHours <= 12) {
        amount = 100;
      } else if (totalHours <= 24) {
        amount = 150;
      } else {
        amount = 150 * days;
      }
    } else {
      if (totalHours <= 12) {
        amount = 50;
      } else if (totalHours <= 24) {
        amount = 100;
      } else {
        amount = 100 * days;
      }
    }
    
    setPricing({ amount, totalHours });
    return { amount, totalHours };
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        [`${type}Image`]: 'File size must be less than 5MB'
      }));
      return;
    }

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
        const progress = Math.round((e.loaded / e.total) * 80) + 10;
        setUploadProgress(prev => ({ ...prev, [type]: progress }));
      }
    };

    reader.onload = (e) => {
      const base64 = e.target.result;
      
      if (!base64 || !base64.startsWith('data:image/')) {
        setErrors(prev => ({
          ...prev,
          [`${type}Image`]: 'Failed to process image'
        }));
        setUploadProgress(prev => ({ ...prev, [type]: 0 }));
        return;
      }

      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${type}Image`];
        return newErrors;
      });

      setFormData(prev => ({
        ...prev,
        [`${type}Image`]: base64,
        [`${type}ImagePreview`]: base64
      }));

      setUploadProgress(prev => ({ ...prev, [type]: 100 }));

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
    if (!formData.mobileImage) newErrors.mobileImage = 'Mobile image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2) {
      calculatePricing();
      setStep(3);
    }
  };

  // NEW: Redirect to payment page
  const handleProceedToPayment = () => {
    const { amount, totalHours } = calculatePricing();
    
    // Calculate end date
    const endDate = new Date(Date.now() + totalHours * 60 * 60 * 1000);
    
    // Store ad data in sessionStorage for retrieval after payment
    const adData = {
      title: formData.title.trim(),
      url: formData.url.trim(),
      desktopImage: formData.desktopImage,
      mobileImage: formData.mobileImage || formData.desktopImage,
      adType,
      dimensions,
      contactEmail: formData.contactEmail?.trim() || '',
      company: formData.company?.trim() || '',
      status: 'pending',
      approved: false,
      duration: formData.duration,
      durationUnit: formData.durationUnit,
      totalHours,
      endDate: endDate.toISOString(),
    };
    
    sessionStorage.setItem('pendingAdData', JSON.stringify(adData));
    
    // Prepare metadata for payment
    const metadata = {
      type: 'advertisement',
      adType,
      duration: formData.duration,
      durationUnit: formData.durationUnit,
      totalHours,
      company: formData.company || 'N/A',
    };
    
    // Build payment URL
    const paymentUrl = new URL('/payment', window.location.origin);
    paymentUrl.searchParams.set('amount', amount);
    paymentUrl.searchParams.set('currency', 'ZAR');
    paymentUrl.searchParams.set('description', `${isBannerAd ? 'Banner' : 'Sidebar'} Ad - ${formData.duration} ${formData.durationUnit}`);
    paymentUrl.searchParams.set('metadata', encodeURIComponent(JSON.stringify(metadata)));
    paymentUrl.searchParams.set('returnUrl', window.location.origin + '/payment/ad-success');
    
    // Redirect to payment page
    window.location.href = paymentUrl.toString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            Create {isBannerAd ? 'Banner' : 'Advertisement'} - Step {step} of 3
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Ad Details */}
        {step === 1 && (
          <div className="p-6 space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Step 1 of 3: Ad Details
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
                Desktop Image *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files[0], 'desktop')}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              {uploadProgress.desktop > 0 && uploadProgress.desktop < 100 && (
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all" 
                      style={{ width: `${uploadProgress.desktop}%` }}
                    ></div>
                  </div>
                </div>
              )}
              {errors.desktopImage && <p className="text-red-500 text-xs mt-1">{errors.desktopImage}</p>}
              {formData.desktopImagePreview && (
                <img
                  src={formData.desktopImagePreview}
                  alt="Desktop preview"
                  className="mt-2 max-w-full h-auto border rounded"
                  style={{ maxHeight: '200px' }}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Image *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files[0], 'mobile')}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              {uploadProgress.mobile > 0 && uploadProgress.mobile < 100 && (
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all" 
                      style={{ width: `${uploadProgress.mobile}%` }}
                    ></div>
                  </div>
                </div>
              )}
              {errors.mobileImage && <p className="text-red-500 text-xs mt-1">{errors.mobileImage}</p>}
              {formData.mobileImagePreview && (
                <img
                  src={formData.mobileImagePreview}
                  alt="Mobile preview"
                  className="mt-2 max-w-full h-auto border rounded"
                  style={{ maxHeight: '100px' }}
                />
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleNext}
                disabled={!formData.desktopImage || !formData.mobileImage}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Desktop Preview</h4>
                <div className="flex justify-center">
                  <img
                    src={formData.desktopImagePreview}
                    alt="Desktop preview"
                    className="border rounded max-w-full"
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Mobile Preview</h4>
                <div className="flex justify-center">
                  <img
                    src={formData.mobileImagePreview}
                    alt="Mobile preview"
                    className="border rounded max-w-full"
                    style={{ maxHeight: '100px' }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border text-gray-700 rounded-md hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Duration & Pricing */}
        {step === 3 && (
          <div className="p-6 space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Step 3 of 3: Choose Duration & Proceed to Payment
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                {isBannerAd ? 'Banner Ad' : 'Sidebar Ad'} Pricing
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 12 hours: R{isBannerAd ? '100' : '50'}</li>
                <li>• 24 hours: R{isBannerAd ? '150' : '100'}</li>
                <li>• Multiple days: R{isBannerAd ? '150' : '100'}/day</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration Unit *</label>
                <select
                  value={formData.durationUnit}
                  onChange={(e) => setFormData(prev => ({ ...prev, durationUnit: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  placeholder="Your company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  placeholder="contact@company.com"
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-800 font-medium">Total Amount</p>
                    <p className="text-xs text-green-600 mt-1">
                      {formData.duration} {formData.durationUnit}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-green-900">R{pricing.amount}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 border text-gray-700 rounded-md hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleProceedToPayment}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                Proceed to Payment
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// PaymentElement component remains the same
function PaymentElement({ stripe, elements }) {
  const [elementReady, setElementReady] = useState(false);
  const paymentElementRef = useRef(null);
  const mountPointRef = useRef(null);
  
  useEffect(() => {
    // Guard: Don't create if we don't have elements or already have an element
    if (!elements || paymentElementRef.current) return;
    
    let paymentElement = null;
    
    try {
      // Create the payment element
      paymentElement = elements.create('payment');
      paymentElementRef.current = paymentElement;
      
      // Mount to the DOM
      paymentElement.mount('#payment-element-mount');
      
      // Set ready state when element is ready
      paymentElement.on('ready', () => {
        setElementReady(true);
      });
      
      console.log('✅ Payment element mounted successfully');
      
    } catch (error) {
      console.error('❌ Error creating payment element:', error);
      paymentElementRef.current = null;
    }
    
    // CRITICAL: Cleanup function
    return () => {
      console.log('🧹 Cleaning up payment element...');
      
      if (paymentElementRef.current) {
        try {
          paymentElementRef.current.unmount();
          paymentElementRef.current.destroy();
          console.log('✅ Payment element cleaned up');
        } catch (error) {
          console.error('⚠️ Error during cleanup:', error);
        }
        paymentElementRef.current = null;
      }
      
      setElementReady(false);
    };
  }, [elements]); // Only depend on elements
  
  return (
    <div>
      <div id="payment-element-mount"></div>
      {!elementReady && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Loading payment form...</p>
        </div>
      )}
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
          <section className="mt-6">
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