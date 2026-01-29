// Complete NewsGrid.jsx
'use client';

import { Heart, X, Upload, ExternalLink, CreditCard, Monitor, Smartphone } from 'lucide-react';
import { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { useFavorites } from '@/hooks/useFavorites';
import RecommendedOverlayBottom from '@/components/news-reader/Overlay';
import { Card, CardContent } from '@/components/UI/newscard';
import { FileText, Clock, Globe, Building, Users, ArrowRight, Plus } from 'lucide-react';
import PublisherFavoriteButton from '@/components/PublisherFavoriteButton';
import TermsAndConditionsModal from '@/components/placeholder/TermsAndConditionsModal';
import DesktopPreview from '@/components/placeholder/DesktopPreview';
import MobilePreview from '@/components/placeholder/MobilePreview';

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

function stripHtml(html) {
  if (!html) return '';
  const temp = document.createElement('div');
  temp.innerHTML = html;
  let text = temp.textContent || temp.innerText || '';
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

function truncateText(text, maxLength = 150) {
  if (!text) return '';
  const cleaned = stripHtml(text);
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength).trim() + '...';
}

// AdSlot component
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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getResponsiveClasses = () => {
    if (isBanner) return '';
    if (adType.includes('sidebar') || adType.includes('rectangle') || adType.includes('skyscraper')) {
      return 'hidden lg:block';
    }
    if (adType === 'mobile') return 'block lg:hidden';
    return '';
  };

  useEffect(() => {
    fetchAds();
  }, []);

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
          const hasDesktopImage = ad.desktopImage && 
            ad.desktopImage.startsWith('data:image/') && 
            ad.status === 'active';
          
          if (isMobile && ad.mobileImage && ad.mobileImage.startsWith('data:image/')) {
            return hasDesktopImage;
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

  const getContainerStyle = () => {
    if (isBanner) return { width: '100%', height: '90px' };
    if (adType === 'mobile') return { width: '100%', height: '250px', maxWidth: '320px', margin: '0 auto' };
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

  if (ads.length === 0 || currentIndex >= ads.length) {
    return (
      <div 
        className={`bg-[#3ba6e7] rounded-md shadow-md cursor-pointer hover:shadow-lg transition-shadow ${className} ${responsiveClasses}`}
        style={getContainerStyle()}
        onClick={onAdvertiseClick}
      >
        {isBanner && (
          <div className="h-full flex items-center justify-between px-4 sm:px-8">
            <div className="flex flex-col items-center mt-5">
              <img src="/Presspass.png" alt="PressPass Logo" height={150} width={150} className="object-contain" /> 
            </div>
            <div className="flex flex-col justify-center items-center space-y-2 text-center mx-auto">
              <h3 className="text-yellow-400 font-bold text-base sm:text-lg">Advertise Here</h3>
              <p className="text-white text-xs sm:text-sm"><span>Partners@presspass.africa</span></p>
              <p className="text-white text-xs sm:text-sm"><span>Phone: +27 87 XXX XXX</span></p>
            </div>
          </div>
        )}

        {(adType.includes('sidebar') || adType.includes('rectangle')) && !adType.includes('skyscraper') && (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-3"><img src="/Presspass.png" alt="PressPass Logo" height={80} width={80} className="object-contain mx-auto" /></div>
            <h3 className="text-yellow-400 font-bold text-lg mb-2">Advertise Here</h3>
            <p className="text-white text-xs mb-1">Partners@presspass.africa</p>
            <p className="text-white text-xs">Phone: +27 87 XXX XXX</p>
            <div className="mt-2 text-white text-xs opacity-75">{width}×{height}</div>
          </div>
        )}

        {adType.includes('skyscraper') && (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-4"><img src="/Presspass.png" alt="PressPass Logo" height={100} width={100} className="object-contain mx-auto" /></div>
            <h3 className="text-yellow-400 font-bold text-xl mb-3">Advertise Here</h3>
            <div className="space-y-2">
              <p className="text-white text-sm">Partners@presspass.africa</p>
              <p className="text-white text-sm">Phone: +27 87 XXX XXX</p>
            </div>
            <div className="mt-4 text-white text-xs opacity-75">{width}×{height}</div>
            <div className="mt-auto mb-4 text-white text-xs">Click to advertise</div>
          </div>
        )}

        {adType === 'mobile' && (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-3"><img src="/Presspass.png" alt="PressPass Logo" height={60} width={60} className="object-contain mx-auto" /></div>
            <h3 className="text-yellow-400 font-bold text-base mb-2">Advertise Here</h3>
            <p className="text-white text-xs mb-1">Partners@presspass.africa</p>
            <p className="text-white text-xs mb-2">Phone: +27 87 XXX XXX</p>
            <div className="text-white text-xs opacity-75">Mobile Ad Space</div>
          </div>
        )}
      </div>
    );
  }

  const ad = ads[currentIndex];
  if (!ad) return null;

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
        <img
          src={getImageSrc()}
          alt={ad.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            console.error('Ad image failed to load:', ad.id);
            if (isMobile && ad.mobileImage && e.target.src === ad.mobileImage) {
              e.target.src = ad.desktopImage;
            }
          }}
        />
        <div style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '10px'
        }}>Ad</div>
      </div>
    </div>
  );
}

// Ad Creation Modal
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
    company: '',
    duration: '1', // Duration in days
    customDuration: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');

  if (!isOpen) return null;

  const isBannerAd = adType === 'banner';

  const handleFileUpload = async (file, type) => {
    if (!file) return;

    console.log(`📤 Processing ${type} image:`, {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      type: file.type
    });

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [`${type}Image`]: 'File size must be less than 5MB' }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, [`${type}Image`]: 'File must be an image' }));
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
        console.error('❌ Invalid base64 result:', base64?.substring(0, 50));
        setErrors(prev => ({ ...prev, [`${type}Image`]: 'Failed to process image' }));
        setUploadProgress(prev => ({ ...prev, [type]: 0 }));
        return;
      }

      console.log(`✅ ${type} image processed successfully`);

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
      setErrors(prev => ({ ...prev, [`${type}Image`]: 'Failed to read file' }));
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
    
    if (formData.desktopImage && !formData.desktopImage.startsWith('data:image/')) {
      newErrors.desktopImage = 'Invalid image format';
    }
    
    if (!termsAccepted) {
      newErrors.terms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.contactEmail?.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }
    
    if (!formData.duration && !formData.customDuration) {
      newErrors.duration = 'Please select ad duration';
    }
    
    if (formData.duration === 'custom' && (!formData.customDuration || parseInt(formData.customDuration) < 1)) {
      newErrors.customDuration = 'Please enter a valid number of days (minimum 1)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculatePrice = () => {
    const days = formData.duration === 'custom' 
      ? parseInt(formData.customDuration) || 0
      : parseInt(formData.duration) || 0;
    
    const pricePerDay = 50; // R50 per day
    const totalPrice = days * pricePerDay;
    
    // Apply discounts for longer durations
    let discount = 0;
    if (days >= 30) discount = 0.20; // 20% off for 30+ days
    else if (days >= 14) discount = 0.15; // 15% off for 14+ days
    else if (days >= 7) discount = 0.10; // 10% off for 7+ days
    
    const discountAmount = totalPrice * discount;
    const finalPrice = totalPrice - discountAmount;
    
    return {
      days,
      pricePerDay,
      subtotal: totalPrice,
      discount: discountAmount,
      total: finalPrice,
      discountPercentage: discount * 100
    };
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) {
      return;
    }

    try {
      setLoading(true);

      const pricing = calculatePrice();
      
      // Prepare the ad data to store temporarily
      const adData = {
        title: formData.title.trim(),
        url: formData.url.trim(),
        desktopImage: formData.desktopImage,
        mobileImage: formData.mobileImage || formData.desktopImage,
        adType,
        dimensions,
        contactEmail: formData.contactEmail?.trim() || '',
        company: formData.company?.trim() || '',
        duration: pricing.days,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + pricing.days * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending_payment',
        approved: false,
        createdAt: new Date().toISOString()
      };

      console.log('📤 Storing ad data for payment:', {
        title: adData.title,
        url: adData.url,
        adType: adData.adType,
        dimensions: adData.dimensions,
        duration: adData.duration,
        company: adData.company,
        contactEmail: adData.contactEmail
      });

      // Store ad data in sessionStorage for after payment
      sessionStorage.setItem('pendingAdData', JSON.stringify(adData));

      // Prepare payment metadata
      const metadata = {
        type: 'ad_space',
        adType: adType,
        templateName: `${adType.replace(/_/g, ' ').toUpperCase()}`,
        deviceType: isBannerAd ? 'Desktop & Mobile' : 'Desktop',
        dimensions: isBannerAd ? '728×90 / 320×50' : `${dimensions.width}×${dimensions.height}`,
        duration: `${pricing.days} day${pricing.days > 1 ? 's' : ''}`,
        company: formData.company || 'N/A',
        contactEmail: formData.contactEmail
      };

      // Redirect to payment page with query parameters
      const paymentUrl = `/payment?${new URLSearchParams({
        amount: pricing.total.toFixed(2),
        currency: 'ZAR',
        description: `Advertisement: ${adType.replace(/_/g, ' ').toUpperCase()} - ${pricing.days} day${pricing.days > 1 ? 's' : ''}`,
        metadata: JSON.stringify(metadata),
        returnUrl: window.location.href
      }).toString()}`;

      console.log('🔄 Redirecting to payment page:', paymentUrl);
      
      // Redirect to payment page
      window.location.href = paymentUrl;
      
    } catch (error) {
      console.error('🚨 Error preparing payment:', error);
      alert('Error preparing payment: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
        <div className="bg-white rounded-lg w-full max-w-4xl mx-4 my-8 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
            <h2 className="text-lg font-semibold">
              Create {isBannerAd ? 'Banner' : 'Advertisement'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step 1: Ad Details + T&Cs */}
          {step === 1 && (
            <div className="p-6 space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Step 1 of 3: Ad Details {isBannerAd ? '(728×90, Responsive)' : `(${dimensions.width}×${dimensions.height})`}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ad Title *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Target URL *</label>
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
                      <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress.desktop}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Uploading... {uploadProgress.desktop}%</p>
                  </div>
                )}
                {errors.desktopImage && <p className="text-red-500 text-xs mt-1">{errors.desktopImage}</p>}
                {formData.desktopImagePreview && (
                  <div className="mt-2">
                    <img src={formData.desktopImagePreview} alt="Desktop preview" className="max-w-full h-auto border border-gray-300 rounded" style={{ maxHeight: '200px' }} />
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
                      <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress.mobile}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Uploading... {uploadProgress.mobile}%</p>
                  </div>
                )}
                {errors.mobileImage && <p className="text-red-500 text-xs mt-1">{errors.mobileImage}</p>}
                {formData.mobileImagePreview && (
                  <div className="mt-2">
                    <img src={formData.mobileImagePreview} alt="Mobile preview" className="max-w-full h-auto border border-gray-300 rounded" style={{ maxHeight: '100px' }} />
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">Upload a mobile-optimized version for better performance on small screens</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms-accept"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-5 h-5 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="terms-accept" className="text-sm text-gray-700 flex-1 cursor-pointer">
                    I have read and agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowTerms(true)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Terms and Conditions
                    </button>
                    {' '}including adult content policies if applicable. *
                  </label>
                </div>
                {errors.terms && <p className="text-red-500 text-xs mt-2 ml-8">{errors.terms}</p>}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleNext}
                  disabled={!formData.desktopImage || !formData.mobileImage || !termsAccepted}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Preview
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Preview with Toggle */}
          {step === 2 && (
            <div className="p-6 space-y-4">
              <div className="text-sm text-gray-600 mb-4">Step 2 of 3: Preview Your Ad</div>

              <div className="flex items-center justify-center space-x-4 mb-6">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    previewMode === 'desktop' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Monitor className="w-5 h-5" />
                  <span>Desktop Preview</span>
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    previewMode === 'mobile' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <span>Mobile Preview</span>
                </button>
              </div>

              <div className="border border-gray-300 rounded-lg overflow-hidden">
                {previewMode === 'desktop' ? (
                  <DesktopPreview 
                    adType={adType} 
                    adImage={formData.desktopImagePreview} 
                    adUrl={formData.url} 
                  />
                ) : (
                  <MobilePreview 
                    adType={adType} 
                    adImage={formData.mobileImagePreview} 
                    adUrl={formData.url} 
                  />
                )}
              </div>

              <p className="text-sm text-center text-gray-600 mt-4">
                Your ad will appear in the highlighted position with a blue border
              </p>

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(1)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">Back</button>
                <button onClick={handleNext} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Continue to Payment</button>
              </div>
            </div>
          )}

          {/* Step 3: Duration & Contact Details */}
          {step === 3 && (
            <div className="p-6 space-y-6">
              <div className="text-sm text-gray-600 mb-4">Step 3 of 3: Duration & Contact Details</div>

              {/* Ad Duration Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  How long do you want your ad to run? *
                </label>
                <div className="space-y-3">
                  {/* 1 Day */}
                  <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-all">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="duration"
                        value="1"
                        checked={formData.duration === '1'}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value, customDuration: '' }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">1 Day</div>
                        <div className="text-xs text-gray-500">Perfect for testing or short campaigns</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">R 50</div>
                      <div className="text-xs text-gray-500">R50/day</div>
                    </div>
                  </label>

                  {/* 7 Days - Popular */}
                  <label className="flex items-center justify-between p-4 border-2 border-blue-500 rounded-lg cursor-pointer bg-blue-50 relative">
                    <div className="absolute -top-2 right-4 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                      SAVE 10%
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="duration"
                        value="7"
                        checked={formData.duration === '7'}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value, customDuration: '' }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">7 Days (1 Week)</div>
                        <div className="text-xs text-gray-500">Most popular choice</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">R 315</div>
                      <div className="text-xs text-gray-500 line-through">R350</div>
                      <div className="text-xs text-green-600">Save R35</div>
                    </div>
                  </label>

                  {/* 14 Days */}
                  <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-all relative">
                    <div className="absolute -top-2 right-4 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                      SAVE 15%
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="duration"
                        value="14"
                        checked={formData.duration === '14'}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value, customDuration: '' }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">14 Days (2 Weeks)</div>
                        <div className="text-xs text-gray-500">Great value for extended reach</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">R 595</div>
                      <div className="text-xs text-gray-500 line-through">R700</div>
                      <div className="text-xs text-green-600">Save R105</div>
                    </div>
                  </label>

                  {/* 30 Days - Best Value */}
                  <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-all relative">
                    <div className="absolute -top-2 right-4 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                      BEST VALUE - 20%
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="duration"
                        value="30"
                        checked={formData.duration === '30'}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value, customDuration: '' }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">30 Days (1 Month)</div>
                        <div className="text-xs text-gray-500">Maximum exposure & best discount</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">R 1,200</div>
                      <div className="text-xs text-gray-500 line-through">R1,500</div>
                      <div className="text-xs text-green-600">Save R300</div>
                    </div>
                  </label>

                  {/* Custom Duration */}
                  <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-all">
                    <div className="flex items-center flex-1">
                      <input
                        type="radio"
                        name="duration"
                        value="custom"
                        checked={formData.duration === 'custom'}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-gray-900 mb-2">Custom Duration</div>
                        {formData.duration === 'custom' && (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="1"
                              max="365"
                              value={formData.customDuration}
                              onChange={(e) => setFormData(prev => ({ ...prev, customDuration: e.target.value }))}
                              placeholder="Enter days"
                              className="w-32 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <span className="text-sm text-gray-600">days</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {formData.duration === 'custom' && formData.customDuration && (
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-blue-600">
                          R {calculatePrice().total.toFixed(0)}
                        </div>
                        {calculatePrice().discount > 0 && (
                          <>
                            <div className="text-xs text-gray-500 line-through">
                              R {calculatePrice().subtotal.toFixed(0)}
                            </div>
                            <div className="text-xs text-green-600">
                              Save R {calculatePrice().discount.toFixed(0)} ({calculatePrice().discountPercentage}%)
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </label>
                </div>
                {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
                {errors.customDuration && <p className="text-red-500 text-xs mt-1">{errors.customDuration}</p>}
              </div>

              {/* Pricing Summary */}
              {(formData.duration || formData.customDuration) && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ad Space:</span>
                      <span className="font-medium text-gray-900">
                        {isBannerAd ? 'Banner' : adType.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium text-gray-900">
                        {calculatePrice().days} day{calculatePrice().days > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rate:</span>
                      <span className="font-medium text-gray-900">R50 per day</span>
                    </div>
                    {calculatePrice().discount > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="text-gray-600 line-through">R {calculatePrice().subtotal.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span className="font-medium">Discount ({calculatePrice().discountPercentage}%):</span>
                          <span className="font-medium">-R {calculatePrice().discount.toFixed(0)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between pt-2 border-t-2 border-blue-300">
                      <span className="text-lg font-bold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        R {calculatePrice().total.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Contact Information</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="contact@company.com"
                    required
                  />
                  {errors.contactEmail && <p className="text-red-500 text-xs mt-1">{errors.contactEmail}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    We'll send your receipt and ad details to this email
                  </p>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CreditCard className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-1">Before You Proceed</h4>
                    <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                      <li>Your ad will go live within 24 hours of payment confirmation</li>
                      <li>Ad duration starts from the activation date</li>
                      <li>You'll receive a confirmation email with ad details</li>
                      <li>Secure payment powered by Stripe</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <button 
                  onClick={() => setStep(2)} 
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  ← Back to Preview
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.contactEmail || (!formData.duration && !formData.customDuration)}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Proceed to Payment
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <TermsAndConditionsModal isOpen={showTerms} onClose={() => setShowTerms(false)} onAccept={() => { setTermsAccepted(true); setShowTerms(false); }} />
    </>
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
  const { isPublisherFavorite, togglePublisherFavorite, currentUser, loading: favoritesLoading } = useFavorites();

  // Check for payment success on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const paymentId = urlParams.get('id');

    if (paymentStatus === 'success' && paymentId) {
      console.log('✅ Payment successful, activating ad...');
      handlePaymentSuccess(paymentId);
      
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // CORRECTED VERSION - Add this to your NewsGrid.jsx

// FINAL CORRECTED VERSION - Matches your custom URL format
// Add this to your NewsGrid.jsx

// FINAL CORRECTED VERSION - Matches your custom URL format
// Add this to your NewsGrid.jsx

// FIXED VERSION - Replace your handlePaymentSuccess function with this

const handlePaymentSuccess = async () => {
  console.log('✅ [PAYMENT-SUCCESS] Payment successful, activating ad...');
  
  try {
    // 1. GET PAYMENT DETAILS FROM URL
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const paymentIntentId = urlParams.get('id');
    
    console.log('📋 [PAYMENT-SUCCESS] URL Parameters:', {
      paymentStatus,
      paymentIntentId,
      fullURL: window.location.href
    });

    if (!paymentIntentId) {
      throw new Error('Missing payment intent ID from URL');
    }

    if (paymentStatus !== 'success') {
      throw new Error(`Payment status is ${paymentStatus}, expected 'success'`);
    }

    // 2. GET USER/PUBLISHER INFO
    let user = null;
    let publisherId = null;
    
    const possibleKeys = ['user', 'currentUser', 'authUser', 'readerUser'];
    
    for (const key of possibleKeys) {
      try {
        const userData = localStorage.getItem(key);
        if (userData) {
          const parsed = JSON.parse(userData);
          publisherId = parsed.originalUid || parsed.uid;
          if (publisherId?.startsWith('reader_')) {
            publisherId = publisherId.replace('reader_', '');
          }
          user = parsed;
          break;
        }
      } catch (e) {
        console.warn(`⚠️ Failed to parse ${key}:`, e);
      }
    }

    if (!publisherId) {
      throw new Error('No publisher ID found. Please log in again.');
    }

    // 3. VERIFY PAYMENT WITH SERVER
    console.log('🔍 [PAYMENT-SUCCESS] Verifying payment...');
    
    const verifyResponse = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentIntentId })
    });

    if (!verifyResponse.ok) {
      throw new Error(`Verification failed: ${verifyResponse.status}`);
    }

    const verifyData = await verifyResponse.json();

    if (!verifyData.success || !verifyData.verified) {
      throw new Error('Payment could not be verified');
    }

    if (!verifyData.amount || verifyData.amount === 0) {
      throw new Error('Payment amount is invalid');
    }

    console.log('✅ [PAYMENT-SUCCESS] Payment verified:', {
      amount: verifyData.amount,
      currency: verifyData.currency
    });

    // 4. GET AD DATA FROM SESSION STORAGE
    const pendingAdDataStr = sessionStorage.getItem('pendingAdData');

    if (!pendingAdDataStr) {
      throw new Error('No pending ad data found. Please try uploading again.');
    }

    const pendingAdData = JSON.parse(pendingAdDataStr);

    // 5. BUILD COMPLETE AD DATA WITH PAYMENT INFO
    // 🔧 FIX: Add payment fields at ROOT level (not just in paymentInfo object)
    const adData = {
      // Spread the pending ad data (title, url, images, etc.)
      ...pendingAdData,
      
      // Set status and approval
      status: 'active',
      approved: true,
      
      // 🔧 CRITICAL FIX: Add payment fields at ROOT level for API route
      paymentIntentId: String(paymentIntentId),  // ✅ NOW DEFINED!
      amount: Number(verifyData.amount),          // ✅ NOW DEFINED!
      currency: String(verifyData.currency || 'ZAR'), // ✅ NOW DEFINED!
      
      // Also keep structured payment info
      paymentInfo: {
        paymentIntentId: String(paymentIntentId),
        amount: Number(verifyData.amount),
        currency: String(verifyData.currency || 'ZAR'),
        paidAt: new Date().toISOString(),
        stripeStatus: String(verifyData.stripeStatus || 'succeeded')
      },
      
      // Metadata
      metadata: verifyData.metadata || {},
      
      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // Publisher info
      publisherId: String(publisherId),
      publisherEmail: String(user?.email || '')
    };

    console.log('📤 [PAYMENT-SUCCESS] Sending ad data:', {
      title: adData.title,
      paymentIntentId: adData.paymentIntentId,  // ✅ Should be defined now
      amount: adData.amount,                      // ✅ Should be defined now
      currency: adData.currency                   // ✅ Should be defined now
    });

    // 6. SEND TO SERVER
    const response = await fetch('/api/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log('✅ [PAYMENT-SUCCESS] Ad created successfully!', result.id);
      
      // Clean up
      sessionStorage.removeItem('pendingAdData');
      
      alert(
        `🎉 Ad Published Successfully!\n\n` +
        `Amount: ${adData.currency} ${adData.amount}\n` +
        `Ad ID: ${result.id}\n\n` +
        `Your ad is now live!`
      );
      
      // Clean URL and reload
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => window.location.reload(), 1000);
      
    } else {
      throw new Error(result.error || 'Failed to create ad');
    }

  } catch (error) {
    console.error('🚨 [PAYMENT-SUCCESS] Error:', error);
    
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntentId = urlParams.get('id');
    
    alert(
      `❌ Failed to Activate Ad\n\n` +
      `Error: ${error.message}\n\n` +
      `Your payment was successful (${paymentIntentId}).\n` +
      `Please contact support with this payment ID.`
    );
  }
};

// USE EFFECT: Detect payment success redirect
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const paymentStatus = urlParams.get('payment');  // Your custom format
  const paymentId = urlParams.get('id');           // Your custom format
  
  console.log('🔍 [NEWSGRID-USEEFFECT] Checking for payment redirect...', {
    hasPaymentId: !!paymentId,
    paymentStatus,
    fullURL: window.location.href
  });
  
  // Check for YOUR custom URL format: ?payment=success&id=pi_xxxxx
  if (paymentId && paymentStatus === 'success') {
    console.log('✅ [NEWSGRID-USEEFFECT] Payment success detected! Starting activation...');
    handlePaymentSuccess();
  } else if (paymentId && paymentStatus !== 'success') {
    console.error('❌ [NEWSGRID-USEEFFECT] Payment failed:', paymentStatus);
    alert(`Payment ${paymentStatus}. Please try again.`);
  } else {
    console.log('ℹ️ [NEWSGRID-USEEFFECT] No payment redirect detected, normal page load');
  }
}, []); // Empty dependency array = run once on mount

  useEffect(() => {
    const fetchNewsSources = async () => {
      try {
        setLoadingSources(true);
        setSourcesError(null);
        
        const response = await fetch('/api/news-sources');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        
        if (data.success) {
          const sourcesWithArticles = await Promise.all(
            (data.newsources || []).map(async (source) => {
              try {
                const articlesResponse = await fetch(`/api/news-sources/${source.id}/articles`);
                
                if (articlesResponse.ok) {
                  const articlesData = await articlesResponse.json();
                  
                  if (articlesData.success && articlesData.articles && articlesData.articles.length > 0) {
                    const recentArticle = articlesData.articles[0];
                    const cleanTitle = stripHtml(recentArticle.title);
                    const cleanExcerpt = truncateText(recentArticle.summary || recentArticle.content, 150);
                    
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
                
                return { ...source, recentStory: null, hasArticles: false };
              } catch (articleError) {
                console.warn(`Failed to fetch articles for ${source.name}:`, articleError);
                return { ...source, recentStory: null, hasArticles: false };
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
        setNewsources([]);
      } finally {
        setLoadingSources(false);
      }
    };

    fetchNewsSources();
  }, []);

  const handleSourceClick = (source) => {
    router.push(`/news-reader/publisher/${source.id}`);
  };

  const handleReadMoreClick = (e, storyUrl) => {
    e.stopPropagation();
    if (storyUrl && storyUrl !== '#') {
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

  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 px-4 sm:px-6 pb-10">
        <div className="space-y-6">
          <section>
            <AdSlot adType="banner" width={728} height={90} isBanner={true} className="w-full" onAdvertiseClick={() => handleAdvertiseClick('banner', { width: 728, height: 90 })} />
          </section>

          <section className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold">Top Headlines</h2>
              {!loadingSources && !sourcesError && (
                <span className="text-sm text-gray-500">{newsources.length} publisher{newsources.length !== 1 ? 's' : ''}</span>
              )}
            </div>
            
            {sourcesError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-800 font-medium">Failed to load news sources</p>
                    <p className="text-red-600 text-sm mt-1">{sourcesError}</p>
                  </div>
                  <button onClick={() => window.location.reload()} className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors">Retry</button>
                </div>
              </div>
            )}
            
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
            
            {!loadingSources && !sourcesError && newsources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {newsources.map((source, idx) => (
                  <Fragment key={source.id}>
                    <Card className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative" onClick={() => handleSourceClick(source)}>
                      <CardContent className="p-4">
                        <div className="text-center mb-3">
                          <h1 className="text-base font-bold text-gray-900 truncate">{stripHtml(source.name)}</h1>
                        </div>

                        <div className="flex items-start space-x-3 mb-3">
                          <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20">
                            {source.logo ? (
                              <img src={source.logo} alt={`${source.name} logo`} className="w-full h-full rounded-lg object-contain border border-gray-200 bg-white" />
                            ) : (
                              <div className="w-full h-full bg-[#329ae1] rounded-lg flex items-center justify-center">
                                <span className="text-white font-semibold text-lg">{stripHtml(source.name).charAt(0)}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                              {source.recentStory?.title || "Ramaphosa pledges to tackle youth unemployment in new economic plan"}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-3">
                              {source.recentStory?.excerpt || "Press Pass is a Media Monetization System with customer onboarding for digital referral services."}
                            </p>
                            <button onClick={(e) => handleReadMoreClick(e, source.recentStory?.url || "#")} className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">Read more</button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                          <div className="flex items-center space-x-4">
                            <span>Last Post: {source.lastPosted || "1d ago"}</span>
                            <a href={source.website || "https://www.dailysun.co.za"} target="_blank" rel="noopener noreferrer" className="hidden sm:inline text-gray-500 hover:underline">
                              {source.website?.replace(/^https?:\/\//, "") || "www.dailysun.co.za"}
                            </a>
                          </div>
                          <PublisherFavoriteButton type="button" publisher={source} size="default" showText={false} className="hidden sm:inline-flex p-2 rounded-full bg-gray-100 hover:bg-red-100 transition-colors" />
                        </div>

                        <PublisherFavoriteButton publisher={source} size="default" showText={false} className="sm:hidden absolute bottom-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-red-100 transition-colors" />
                      </CardContent>
                    </Card>
                    
                    {((idx + 1) % 5 === 0) && (
                      <div className="sm:col-span-2 lg:hidden">
                        <AdSlot adType="mobile" width={320} height={50} className="w-full" onAdvertiseClick={() => handleAdvertiseClick('mobile', { width: 320, height: 50 })} />
                      </div>
                    )}
                  </Fragment>
                ))}
              </div>
            ) : null}
            
            {!loadingSources && !sourcesError && newsources.length === 0 && (
              <div className="text-center py-8">
                <Building className="mx-auto h-8 w-8 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No publishers yet</h3>
                <p className="mt-1 text-sm text-gray-500">Publisher folders will automatically appear here when they register.</p>
              </div>
            )}
          </section>
        </div>

        <aside className="hidden lg:block space-y-6 lg:sticky lg:top-20 h-fit">
          <AdSlot adType="sidebar_rectangle" width={300} height={250} onAdvertiseClick={() => handleAdvertiseClick('sidebar_rectangle', { width: 300, height: 250 })} />
          <AdSlot adType="sidebar_skyscraper" width={300} height={600} onAdvertiseClick={() => handleAdvertiseClick('sidebar_skyscraper', { width: 300, height: 600 })} />
          <AdSlot adType="sidebar_rectangle2" width={300} height={250} onAdvertiseClick={() => handleAdvertiseClick('sidebar_rectangle2', { width: 300, height: 250 })} />
        </aside>

        <RecommendedOverlayBottom articles={unique} />
      </div>

      <AdCreationModal isOpen={showAdModal} onClose={() => setShowAdModal(false)} adType={selectedAdType} dimensions={selectedDimensions} />
    </div>
  );
}