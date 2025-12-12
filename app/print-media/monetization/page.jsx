'use client';
import { useState, useEffect } from "react";
import Header from "@/components/UI/header";
import PrintMediaFooter from '@/components/UI/PrintMediaFooter';
import { FileText, Users, Megaphone, LayoutDashboard, Menu, X, Monitor, Smartphone, Eye, CreditCard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import { useCurrentPublisher } from "@/hooks/useCurrentPublisher";

// Lazy load components
const DesktopPlaceholder = dynamic(() => import('@/components/placeholder/DesktopArticlePlaceholder'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>
});

const MobilePlaceholder = dynamic(() => import('@/components/placeholder/MobileArticlePlaceholder'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>
});

const AdUploadOverlay = dynamic(() => import('@/components/AdUploadOverlay'));
const TermsAndConditionsModal = dynamic(() => import('@/components/placeholder/TermsAndConditionsModal'));

export default function MonetizationPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isUploadOverlayOpen, setIsUploadOverlayOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deviceType, setDeviceType] = useState('desktop');
  const [uploadedAds, setUploadedAds] = useState({});
  const [currentPublisherId, setCurrentPublisherId] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewAd, setPreviewAd] = useState(null);
  const [pendingUpload, setPendingUpload] = useState(null);
  const [showTerms, setShowTerms] = useState(false);

  // Get publisher data from hook
  const { publisher, loading: publisherLoading } = useCurrentPublisher();

  // Device-specific template dimensions
  const TEMPLATE_SPECS = {
    desktop: {
      1: { width: 728, height: 90, name: 'Leaderboard Banner', fileSize: '200kb', formats: 'JPEG, PNG, GIF' },
      2: { width: 300, height: 250, name: 'Medium Rectangle', fileSize: '150kb', formats: 'JPEG, PNG, GIF' },
      3: { width: 300, height: 250, name: 'Medium Rectangle', fileSize: '150kb', formats: 'JPEG, PNG, GIF' },
      4: { width: 160, height: 600, name: 'Wide Skyscraper', fileSize: '200kb', formats: 'JPEG, PNG, GIF' },
      5: { width: 160, height: 600, name: 'Wide Skyscraper', fileSize: '200kb', formats: 'JPEG, PNG, GIF' }
    },
    mobile: {
      1: { width: 320, height: 50, name: 'Mobile Banner', fileSize: '100kb', formats: 'JPEG, PNG, GIF' },
      2: { width: 300, height: 250, name: 'Medium Rectangle', fileSize: '150kb', formats: 'JPEG, PNG, GIF' },
      3: { width: 300, height: 250, name: 'Medium Rectangle', fileSize: '150kb', formats: 'JPEG, PNG, GIF' },
      4: { width: 300, height: 600, name: 'Half Page', fileSize: '200kb', formats: 'JPEG, PNG, GIF' },
      5: { width: 300, height: 600, name: 'Half Page', fileSize: '200kb', formats: 'JPEG, PNG, GIF' }
    }
  };

  // Template names matching your original
  const templates = [
    {
      id: 1,
      name: "Headline",
      dimension: deviceType === 'desktop' ? "728w x 90h(px)" : "320w x 50h(px)",
      fileSize: deviceType === 'desktop' ? "200kb (JPEG, PNG, GIF)" : "100kb (JPEG, PNG, GIF)",
      price: "Publisher to Quote",
      link: "Payment Link",
      upload: "Upload",
    },
    {
      id: 2,
      name: "Feed",
      dimension: "300w x 250h(px)",
      fileSize: "150kb (JPEG, PNG, GIF)",
      price: "Publisher to Quote",
      link: "Payment Link",
      upload: "Upload",
    },
    {
      id: 3,
      name: "Within Article",
      dimension: "300w x 250h(px)",
      fileSize: "150kb (JPEG, PNG, GIF)",
      price: "Publisher to Quote",
      link: "Payment Link",
      upload: "Upload",
    },
    {
      id: 4,
      name: "Page Wrap 1",
      dimension: deviceType === 'desktop' ? "160w x 600h(px)" : "300w x 600h(px)",
      fileSize: "200kb (JPEG, PNG, GIF)",
      price: "Publisher to Quote",
      link: "Payment Link",
      upload: "Upload",
    },
    {
      id: 5,
      name: "Page Wrap 2",
      dimension: deviceType === 'desktop' ? "160w x 600h(px)" : "300w x 600h(px)",
      fileSize: "200kb (JPEG, PNG, GIF)",
      price: "Publisher to Quote",
      link: "Payment Link",
      upload: "Upload",
    },
  ];

  // Initialize publisher ID
  useEffect(() => {
    const initializePublisherId = () => {
      console.log('🔍 Initializing publisher ID...');
      
      let publisherId = localStorage.getItem('currentPublisherId');
      console.log('📦 From localStorage:', publisherId);

      if (!publisherId) {
        const userDataStr = localStorage.getItem('currentUser');
        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            publisherId = userData.uid || userData.id;
            console.log('📦 From currentUser:', publisherId);
            
            if (publisherId) {
              localStorage.setItem('currentPublisherId', publisherId);
              console.log('💾 Stored publisher ID for future use');
            }
          } catch (e) {
            console.error('❌ Error parsing currentUser:', e);
          }
        }
      }

      if (!publisherId && publisher?.id) {
        publisherId = publisher.id;
        localStorage.setItem('currentPublisherId', publisherId);
        console.log('📦 From publisher hook:', publisherId);
      }

      console.log('✅ Final Publisher ID:', publisherId);
      setCurrentPublisherId(publisherId);
      setIsInitializing(false);
    };

    initializePublisherId();
  }, [publisher]);

  // Update publisher ID when publisher hook updates
  useEffect(() => {
    if (publisher?.id && !currentPublisherId) {
      console.log('🔄 Updating publisher ID from hook:', publisher.id);
      setCurrentPublisherId(publisher.id);
      localStorage.setItem('currentPublisherId', publisher.id);
    }
  }, [publisher, currentPublisherId]);

  // Fetch uploaded ads
  useEffect(() => {
    const fetchUploadedAds = async () => {
      if (!currentPublisherId) {
        console.warn('⚠️ No publisher ID available yet');
        return;
      }

      try {
        console.log('🔍 Fetching ads for:', { currentPublisherId, deviceType });
        
        const response = await fetch(
          `/api/get-ads?publisherId=${currentPublisherId}&deviceType=${deviceType}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('📦 API Response:', result);

        if (result.success && result.data) {
          const adsMap = {};
          result.data.forEach(ad => {
            if (!adsMap[ad.templateId]) {
              adsMap[ad.templateId] = [];
            }
            adsMap[ad.templateId].push(ad);
          });
          
          console.log('✅ Grouped ads by template:', adsMap);
          setUploadedAds(adsMap);
        } else {
          console.warn('⚠️ No ads found:', result);
          setUploadedAds({});
        }
      } catch (error) {
        console.error('❌ Error fetching uploaded ads:', error);
        setUploadedAds({});
      }
    };

    fetchUploadedAds();
  }, [currentPublisherId, deviceType]);

  const handleOpenUploadOverlay = (templateId) => {
    if (!currentPublisherId) {
      alert('Please wait while we load your publisher profile...');
      return;
    }
    setSelectedTemplateId(templateId);
    setIsUploadOverlayOpen(true);
  };

  const handleUploadComplete = async (file) => {
    try {
      console.log('📤 Upload complete, creating preview...', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        templateId: selectedTemplateId,
        deviceType
      });

      // Create preview from file
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewData = {
          imageSrc: e.target.result,
          fileName: file.name,
          fileType: file.type
        };
        
        console.log('✅ Preview data created:', {
          fileName: previewData.fileName,
          fileType: previewData.fileType,
          imageSrcLength: previewData.imageSrc?.length
        });
        
        setPreviewAd(previewData);
        
        // Store the complete pending upload data
        const uploadData = {
          file: file,
          fileData: previewData,
          templateId: selectedTemplateId,
          deviceType: deviceType,
          publisherId: currentPublisherId
        };
        
        console.log('💾 Setting pending upload:', {
          templateId: uploadData.templateId,
          deviceType: uploadData.deviceType,
          publisherId: uploadData.publisherId,
          hasFile: !!uploadData.file
        });
        
        setPendingUpload(uploadData);
      };
      reader.readAsDataURL(file);

      // Close upload overlay and show preview
      setIsUploadOverlayOpen(false);
      setShowPreview(true);
      setSelectedTemplate(selectedTemplateId);

      return { success: true };
    } catch (error) {
      console.error("❌ Upload preparation failed:", error);
      throw error;
    }
  };

  const handleAcceptTerms = () => {
    console.log('📋 Terms accepted, proceeding to payment...');
    console.log('🔍 Checking pending upload:', pendingUpload);
    console.log('🔍 Checking publisher:', publisher);
    
    // Validate we have all required data
    if (!pendingUpload) {
      console.error('❌ No pending upload data found');
      alert('Missing upload information. Please try uploading your ad again.');
      setShowTerms(false);
      return;
    }

    if (!currentPublisherId) {
      console.error('❌ No publisher ID found');
      alert('Missing publisher information. Please refresh the page and try again.');
      setShowTerms(false);
      return;
    }

    const spec = TEMPLATE_SPECS[deviceType][pendingUpload.templateId];
    const templateName = templates.find(t => t.id === pendingUpload.templateId)?.name || `Template ${pendingUpload.templateId}`;
    
    // Calculate price based on publisher's ad pricing (default to 500 if not set)
    const adPrice = publisher?.adPricing?.[`template${pendingUpload.templateId}`] || 500;
    
    console.log('💰 Payment details:', {
      adPrice,
      templateId: pendingUpload.templateId,
      templateName,
      deviceType,
      spec
    });
    
    // Navigate to payment page with metadata
    const metadata = {
      publisherId: currentPublisherId,
      templateId: pendingUpload.templateId,
      templateName,
      deviceType,
      fileName: pendingUpload.file.name,
      dimensions: `${spec.width}x${spec.height}`,
      type: 'ad_space'
    };

    console.log('📦 Payment metadata:', metadata);

    const paymentUrl = `/payment?amount=${adPrice}&currency=ZAR&description=${encodeURIComponent(`${templateName} - ${deviceType} (${spec.width}x${spec.height}px)`)}&metadata=${encodeURIComponent(JSON.stringify(metadata))}&returnUrl=${encodeURIComponent(window.location.href)}`;
    
    console.log('🔗 Payment URL created:', paymentUrl);
    
    // Store pending upload in sessionStorage for after payment
    // Convert file to base64 for storage
    const reader = new FileReader();
    reader.onload = (e) => {
      const uploadDataForStorage = {
        fileData: {
          name: pendingUpload.file.name,
          type: pendingUpload.file.type,
          size: pendingUpload.file.size,
          imageSrc: e.target.result
        },
        templateId: pendingUpload.templateId,
        deviceType,
        publisherId: currentPublisherId,
        previewData: pendingUpload.fileData
      };
      
      console.log('💾 Storing in sessionStorage:', {
        templateId: uploadDataForStorage.templateId,
        deviceType: uploadDataForStorage.deviceType,
        publisherId: uploadDataForStorage.publisherId
      });
      
      sessionStorage.setItem('pendingAdUpload', JSON.stringify(uploadDataForStorage));
      
      console.log('🚀 Navigating to payment page...');
      router.push(paymentUrl);
    };
    
    reader.readAsDataURL(pendingUpload.file);
  };

  const handlePreviewClose = () => {
    setShowPreview(false);
    setPreviewAd(null);
    setSelectedTemplate(null);
  };

  const handleProceedToPayment = () => {
    console.log('💳 Proceeding to payment, opening T&C modal...');
    setShowTerms(true);
  };

  // Check for successful payment on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      console.log('✅ Payment successful detected!');
      const uploadData = sessionStorage.getItem('pendingAdUpload');
      if (uploadData) {
        handlePaymentSuccess(JSON.parse(uploadData));
        sessionStorage.removeItem('pendingAdUpload');
        
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  const handlePaymentSuccess = async (uploadData) => {
    try {
      console.log('🎉 Handling payment success, refreshing ads...');
      
      alert('Payment successful! Your ad has been activated.');
      
      // Refresh the ads list
      const response = await fetch(
        `/api/get-ads?publisherId=${currentPublisherId}&deviceType=${deviceType}`
      );
      const result = await response.json();
      
      if (result.success && result.data) {
        const adsMap = {};
        result.data.forEach(ad => {
          if (!adsMap[ad.templateId]) {
            adsMap[ad.templateId] = [];
          }
          adsMap[ad.templateId].push(ad);
        });
        setUploadedAds(adsMap);
      }
      
      console.log('✅ Ads refreshed successfully');
    } catch (error) {
      console.error('❌ Error processing payment success:', error);
    }
  };

  const handleArticleClick = (template) => {
    router.push(
      `/print-media/monetization/advertise/ad-demo-article?templateId=${template.id}`
    );
  };

  // Show loading while initializing
  if (isInitializing || publisherLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading publisher profile...</p>
        </div>
      </div>
    );
  }

  // Show error if no publisher ID after initialization
  if (!currentPublisherId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold text-red-800 mb-2">Publisher ID Not Found</h2>
            <p className="text-gray-700 mb-4">Please sign in to continue.</p>
          </div>
          <Link 
            href="/print-media/signin" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const currentSpecs = TEMPLATE_SPECS[deviceType];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header publisher={publisher} />
      
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-bold">
              Ad Templates - {deviceType === 'mobile' ? 'Mobile' : 'Desktop'} View
            </h1>
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setDeviceType('desktop')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  deviceType === 'desktop'
                    ? 'bg-white shadow-sm text-blue-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Monitor size={18} />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                onClick={() => setDeviceType('mobile')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  deviceType === 'mobile'
                    ? 'bg-white shadow-sm text-blue-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Smartphone size={18} />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success indicator */}
      <div className="bg-green-50 border-b border-green-200 px-4 py-2">
        <p className="text-sm text-green-800">
          ✅ <strong>Publisher ID:</strong> {currentPublisherId} | 
          <strong> Device:</strong> {deviceType} | 
          <strong> Total Ads:</strong> {Object.values(uploadedAds).flat().length}
        </p>
      </div>

      <h1 className="text-center text-lg sm:text-xl font-bold my-4 px-2">
        Click on any of the templates to see where to place your ad!
      </h1>

      {/* Mobile menu button */}
      <div className="md:hidden flex items-center px-4 mb-2">
        <button
          className="p-2 rounded-md bg-white shadow"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex flex-col md:flex-row flex-1 w-full">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 bg-white shadow-md border-r flex-col">
          <div className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Menu</h2>
            <ul className="space-y-2 md:space-y-4">
              <li>
                <Link
                  href="/print-media/monetization/publish"
                  className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
                >
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span>Publish with us</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/print-media/monetization/partner"
                  className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
                >
                  <Users className="w-5 h-5 text-gray-500" />
                  <span>Partner with us</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/print-media/monetization/advertise"
                  className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
                >
                  <Megaphone className="w-5 h-5 text-gray-500" />
                  <span>Advertise with us</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/print-media/monetization/dashboard"
                  className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
                >
                  <LayoutDashboard className="w-5 h-5 text-gray-500" />
                  <span>Dashboard</span>
                </Link>
              </li>
            </ul>
          </div>
        </aside>

        {/* Mobile sidebar */}
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-30 z-40"
              onClick={() => setMenuOpen(false)}
            />
            <aside className="fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50 flex flex-col animate-slide-in">
              <button
                className="absolute top-4 right-4 bg-gray-100 rounded-full p-1"
                onClick={() => setMenuOpen(false)}
              >
                <X size={24} />
              </button>
              <div className="p-4 md:p-6 mt-10">
                <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Menu</h2>
                <ul className="space-y-2 md:space-y-4">
                  <li>
                    <Link
                      href="/print-media/monetization/publish"
                      className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
                      onClick={() => setMenuOpen(false)}
                    >
                      <FileText className="w-5 h-5 text-gray-500" />
                      <span>Publish with us</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/print-media/monetization/partner"
                      className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Users className="w-5 h-5 text-gray-500" />
                      <span>Partner with us</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/print-media/monetization/advertise"
                      className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Megaphone className="w-5 h-5 text-gray-500" />
                      <span>Advertise with us</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/print-media/monetization/dashboard"
                      className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
                      onClick={() => setMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-5 h-5 text-gray-500" />
                      <span>Dashboard</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 p-2 sm:p-4 md:p-6">
          {/* Data Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-x-auto mb-8">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-700">#</th>
                  <th className="text-left p-4 font-medium text-gray-700">Banner</th>
                  <th className="text-left p-4 font-medium text-gray-700">Dimension</th>
                  <th className="text-left p-4 font-medium text-gray-700">File Size</th>
                  <th className="text-left p-4 font-medium text-gray-700">Uploaded Ads</th>
                  <th className="text-left p-4 font-medium text-gray-700">Upload</th>
                  <th className="text-left p-4 font-medium text-gray-700">Preview</th>
                  <th className="text-left p-4 font-medium text-gray-700">Link</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => {
                  const adsForTemplate = uploadedAds[template.id] || [];
                  
                  return (
                    <tr key={template.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{template.id}</td>
                      <td className="p-4">{template.name}</td>
                      <td className="p-4 text-sm text-gray-600">{template.dimension}</td>
                      <td className="p-4 text-sm text-gray-600">{template.fileSize}</td>
                      <td className="p-4">
                        {adsForTemplate.length > 0 ? (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {adsForTemplate.length} active
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">No ads uploaded</span>
                        )}
                      </td>
                      <td
                        className="p-4 text-blue-600 underline cursor-pointer hover:text-blue-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenUploadOverlay(template.id);
                        }}
                      >
                        {template.upload}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTemplate(template.id);
                            setShowPreview(true);
                          }}
                          className="text-green-600 underline hover:text-green-800 flex items-center gap-1"
                        >
                          <Eye size={14} />
                          Preview
                        </button>
                      </td>
                      <td className="p-4 text-blue-600 underline cursor-pointer hover:text-blue-800">
                        <Link href={`/print-media/monetization/payment/${template.id}`}>
                          {template.link}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Live Preview Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-4">Live Preview - {deviceType === 'mobile' ? 'Mobile' : 'Desktop'}</h2>
            <p className="text-gray-600 mb-6">
              This shows how your ads will appear in articles on {deviceType} devices
            </p>
            
            {deviceType === 'desktop' ? (
              <DesktopPlaceholder ads={uploadedAds} publisherId={currentPublisherId} />
            ) : (
              <MobilePlaceholder ads={uploadedAds} publisherId={currentPublisherId} />
            )}
          </div>
        </main>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-7xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Ad Preview</h2>
                <p className="text-gray-600 mt-1">
                  {templates.find(t => t.id === selectedTemplate)?.name} - {deviceType === 'mobile' ? 'Mobile' : 'Desktop'}
                </p>
              </div>
              <button
                onClick={handlePreviewClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Preview placeholder */}
            <div className="mb-6">
              {deviceType === 'desktop' ? (
                <DesktopPlaceholder
                  ads={uploadedAds}
                  previewAd={previewAd}
                  highlightTemplate={selectedTemplate}
                  publisherId={currentPublisherId}
                />
              ) : (
                <MobilePlaceholder
                  ads={uploadedAds}
                  previewAd={previewAd}
                  highlightTemplate={selectedTemplate}
                  publisherId={currentPublisherId}
                />
              )}
            </div>

            {/* Action buttons */}
            {previewAd && (
              <div className="flex justify-between items-center pt-4 border-t">
                <button
                  onClick={handlePreviewClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceedToPayment}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Proceed to Payment
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <AdUploadOverlay
        isOpen={isUploadOverlayOpen}
        onClose={() => setIsUploadOverlayOpen(false)}
        onUpload={handleUploadComplete}
        deviceType={deviceType}
      />

      <TermsAndConditionsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={handleAcceptTerms}
      />
      
      <PrintMediaFooter />
      
      <style jsx global>{`
        @keyframes slide-in {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}