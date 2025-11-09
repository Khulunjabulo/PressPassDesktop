"use client";
import { useState, useEffect } from "react";
import Header from "@/components/UI/header";
import { FileText, Users, Megaphone, LayoutDashboard, Menu, X, Monitor, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdUploadOverlay from "@/components/AdUploadOverlay";
import { useCurrentPublisher } from "@/hooks/useCurrentPublisher";
import PrintMediaFooter from '@/components/UI/PrintMediaFooter';

export default function Monetization() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isUploadOverlayOpen, setIsUploadOverlayOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deviceType, setDeviceType] = useState('desktop');
  const [uploadedAds, setUploadedAds] = useState({});
  const [currentPublisherId, setCurrentPublisherId] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Get publisher data from hook
  const { publisher, loading: publisherLoading } = useCurrentPublisher();

  // FIX 1: Multiple sources for publisher ID with proper initialization
  useEffect(() => {
    const initializePublisherId = () => {
      console.log('🔍 Initializing publisher ID...');
      
      // Try to get from localStorage first
      let publisherId = localStorage.getItem('currentPublisherId');
      console.log('📦 From localStorage:', publisherId);

      // If not in localStorage, try to get from currentUser
      if (!publisherId) {
        const userDataStr = localStorage.getItem('currentUser');
        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            publisherId = userData.uid || userData.id;
            console.log('📦 From currentUser:', publisherId);
            
            // Store it for next time
            if (publisherId) {
              localStorage.setItem('currentPublisherId', publisherId);
              console.log('💾 Stored publisher ID for future use');
            }
          } catch (e) {
            console.error('❌ Error parsing currentUser:', e);
          }
        }
      }

      // If we got publisher from hook, use that
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

  // FIX 2: Update publisher ID when publisher hook updates
  useEffect(() => {
    if (publisher?.id && !currentPublisherId) {
      console.log('🔄 Updating publisher ID from hook:', publisher.id);
      setCurrentPublisherId(publisher.id);
      localStorage.setItem('currentPublisherId', publisher.id);
    }
  }, [publisher, currentPublisherId]);

  const templates = [
    {
      id: 1,
      name: "Headline",
      dimension: "300w x 250h(px)",
      fileSize: "100kb (JPEG, PNG, HTML)",
      price: "Publisher to Quote",
      link: "Payment Link",
      upload: "Upload",
    },
    {
      id: 2,
      name: "Feed",
      dimension: "250w x 250h(px)",
      fileSize: "100kb (JPEG, PNG, HTML)",
      price: "Publisher to Quote",
      link: "Payment Link",
      upload: "Upload",
    },
    {
      id: 3,
      name: "Within Article",
      dimension: "300w x 250h(px)",
      fileSize: "100kb (JPEG, PNG, HTML)",
      price: "Publisher to Quote",
      link: "Payment Link",
      upload: "Upload",
    },
    {
      id: 4,
      name: "Page Wrap 1",
      dimension: "200w x 200h(px)",
      fileSize: "100kb (JPEG, PNG, HTML)",
      price: "Publisher to Quote",
      link: "Payment Link",
      upload: "Upload",
    },
    {
      id: 5,
      name: "Page Wrap 2",
      dimension: "200w x 200h(px)",
      fileSize: "100kb (JPEG, PNG, HTML)",
      price: "Publisher to Quote",
      link: "Payment Link",
      upload: "Upload",
    },
  ];

  // FIX 3: Fetch ads with better error handling
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

  const handleUpload = async (file) => {
    try {
      if (!currentPublisherId) {
        throw new Error('Publisher ID not available. Please refresh the page.');
      }

      console.log('📤 Starting upload:', {
        file: file.name,
        publisherId: currentPublisherId,
        templateId: selectedTemplateId,
        deviceType
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('publisherId', currentPublisherId);
      formData.append('templateId', selectedTemplateId.toString());
      formData.append('deviceType', deviceType);

      const response = await fetch('/api/upload-ad-media', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('📥 Upload response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // Refresh ads list
      console.log('🔄 Refreshing ad list...');
      const adsResponse = await fetch(
        `/api/get-ads?publisherId=${currentPublisherId}&deviceType=${deviceType}`
      );
      const adsResult = await adsResponse.json();
      
      console.log('📦 Refreshed ads:', adsResult);
      
      if (adsResult.success && adsResult.data) {
        const adsMap = {};
        adsResult.data.forEach(ad => {
          if (!adsMap[ad.templateId]) {
            adsMap[ad.templateId] = [];
          }
          adsMap[ad.templateId].push(ad);
        });
        setUploadedAds(adsMap);
      }

      return result;
    } catch (error) {
      console.error("❌ Upload failed:", error);
      throw error;
    }
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
            <p className="text-gray-700 mb-4">
              We couldn't load your publisher profile. This might happen if:
            </p>
            <ul className="text-left text-sm text-gray-600 space-y-2 mb-4">
              <li>• You're not signed in as a publisher</li>
              <li>• Your session has expired</li>
              <li>• There was an error loading your profile</li>
            </ul>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
            <Link 
              href="/print-media/signin" 
              className="block w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors"
            >
              Sign In Again
            </Link>
          </div>
          
          {/* Debug info */}
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-left">
            <p className="font-bold mb-1">Debug Info:</p>
            <p>Publisher from hook: {publisher?.id || 'null'}</p>
            <p>localStorage publisherId: {typeof window !== 'undefined' ? localStorage.getItem('currentPublisherId') : 'N/A'}</p>
            <p>localStorage currentUser: {typeof window !== 'undefined' ? (localStorage.getItem('currentUser') ? 'exists' : 'null') : 'N/A'}</p>
          </div>
        </div>
      </div>
    );
  }

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
          {/* Template Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {templates.map((template) => {
              const adsForTemplate = uploadedAds[template.id] || [];
              const hasAds = adsForTemplate.length > 0;
              
              return (
                <div
                  key={template.id}
                  className={`cursor-pointer rounded-lg border bg-white shadow-sm hover:shadow-lg transition-all relative ${
                    selectedTemplate === template.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() =>
                    router.push(
                      `/print-media/monetization/advertise/ad-demo-article?templateId=${template.id}`
                    )
                  }
                >
                  {hasAds && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                      {adsForTemplate.length} ad{adsForTemplate.length !== 1 ? 's' : ''}
                    </div>
                  )}
                  
                  <div className="p-4">
                    <div className="text-center mb-3">
                      <span className="text-2xl font-bold text-gray-600">
                        {template.id}
                      </span>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-4 h-32 flex flex-col justify-between">
                      {template.id === 1 && (
                        <div className="space-y-2">
                          <div className="bg-blue-400 h-6 w-3/4 rounded"></div>
                          <div className="bg-gray-300 h-6 w-3/4 rounded"></div>
                          <div className="bg-gray-300 h-6 w-3/4 rounded"></div>
                        </div>
                      )}
                      {template.id === 2 && (
                        <div className="space-y-2">
                          <div className="bg-gray-300 h-6 w-3/4 rounded"></div>
                          <div className="bg-blue-400 h-6 w-3/4 rounded"></div>
                          <div className="bg-gray-300 h-6 w-3/4 rounded"></div>
                        </div>
                      )}
                      {template.id === 3 && (
                        <div className="space-y-2">
                          <div className="bg-gray-300 h-6 w-3/4 rounded"></div>
                          <div className="bg-gray-300 h-6 w-3/4 rounded"></div>
                          <div className="bg-blue-400 h-6 w-3/4 rounded"></div>
                        </div>
                      )}
                      {template.id === 4 && (
                        <div className="flex gap-2 items-stretch">
                          <div className="flex-1">
                            <div className="bg-gray-300 h-6 w-full rounded mb-1"></div>
                            <div className="space-y-2">
                              <div className="bg-gray-300 h-6 w-full rounded"></div>
                              <div className="bg-gray-300 h-6 w-full rounded"></div>
                            </div>
                          </div>
                          <div className="flex flex-col w-6 gap-1">
                            <div className="bg-blue-400 flex-1 rounded"></div>
                            <div className="bg-gray-300 flex-1 rounded"></div>
                          </div>
                        </div>
                      )}
                      {template.id === 5 && (
                        <div className="flex gap-2 items-stretch">
                          <div className="flex-1">
                            <div className="bg-gray-300 h-6 w-full rounded mb-1"></div>
                            <div className="space-y-2">
                              <div className="bg-gray-300 h-6 w-full rounded"></div>
                              <div className="bg-gray-300 h-6 w-full rounded"></div>
                            </div>
                          </div>
                          <div className="flex flex-col w-6 gap-1">
                            <div className="bg-gray-300 flex-1 rounded"></div>
                            <div className="bg-blue-400 flex-1 rounded"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-700">#</th>
                  <th className="text-left p-4 font-medium text-gray-700">Banner</th>
                  <th className="text-left p-4 font-medium text-gray-700">Dimension</th>
                  <th className="text-left p-4 font-medium text-gray-700">File Size</th>
                  <th className="text-left p-4 font-medium text-gray-700">Uploaded Ads</th>
                  <th className="text-left p-4 font-medium text-gray-700">Upload</th>
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
                        onClick={() => handleOpenUploadOverlay(template.id)}
                      >
                        {template.upload}
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
        </main>
      </div>
      
      <AdUploadOverlay
        isOpen={isUploadOverlayOpen}
        onClose={() => setIsUploadOverlayOpen(false)}
        onUpload={handleUpload}
        deviceType={deviceType}
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