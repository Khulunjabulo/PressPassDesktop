'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/UI/header";
import PrintMediaFooter from '@/components/UI/PrintMediaFooter';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  Eye, 
  Edit2, 
  Trash2, 
  PlusCircle,
  AlertCircle,
  CheckCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
  Filter,
  Download
} from "lucide-react";
import { format, differenceInDays, isPast, isFuture, parseISO } from "date-fns";
import Link from "next/link";
import { useCurrentPublisher } from "@/hooks/useCurrentPublisher";
import dynamic from 'next/dynamic';

const AdPaymentForm = dynamic(() => import('@/components/AdPaymentForm'));

export default function Dashboard() {
  const router = useRouter();
  const { publisher, loading: publisherLoading } = useCurrentPublisher();
  
  const [currentPublisherId, setCurrentPublisherId] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeAds, setActiveAds] = useState([]);
  const [expiredAds, setExpiredAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalActive: 0,
    totalExpired: 0,
    expiringThisWeek: 0,
    totalSpent: 0,
    totalImpressions: 0,
    totalClicks: 0
  });
  
  // Extension modal states
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [selectedAdForExtension, setSelectedAdForExtension] = useState(null);
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, expiring, expired
  const [filterDevice, setFilterDevice] = useState('all'); // all, desktop, mobile

  // Initialize publisher ID
  useEffect(() => {
    const initializePublisherId = () => {
      console.log('🔍 Initializing publisher ID...');
      
      let publisherId = localStorage.getItem('currentPublisherId');
      
      if (!publisherId) {
        const userDataStr = localStorage.getItem('currentUser');
        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            publisherId = userData.uid || userData.id;
            if (publisherId) {
              localStorage.setItem('currentPublisherId', publisherId);
            }
          } catch (e) {
            console.error('❌ Error parsing currentUser:', e);
          }
        }
      }

      if (!publisherId && publisher?.id) {
        publisherId = publisher.id;
        localStorage.setItem('currentPublisherId', publisherId);
      }

      console.log('✅ Final Publisher ID:', publisherId);
      setCurrentPublisherId(publisherId);
      setIsInitializing(false);
    };

    initializePublisherId();
  }, [publisher]);

  // Fetch all ads
  useEffect(() => {
    const fetchAds = async () => {
      if (!currentPublisherId) {
        console.warn('⚠️ No publisher ID available yet');
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 Fetching all ads for publisher:', currentPublisherId);
        
        const response = await fetch(
          `/api/get-all-ads?publisherId=${currentPublisherId}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('📦 API Response:', result);

        if (result.success && result.data) {
          const now = new Date();
          const active = [];
          const expired = [];
          
          let totalSpent = 0;
          let expiringCount = 0;
          
          result.data.forEach(ad => {
            // Parse dates
            const endDate = ad.duration?.endDate ? parseISO(ad.duration.endDate) : null;
            const startDate = ad.duration?.startDate ? parseISO(ad.duration.startDate) : null;
            
            // Calculate status
            const isActive = endDate && isFuture(endDate);
            const daysRemaining = endDate ? differenceInDays(endDate, now) : 0;
            
            const enrichedAd = {
              ...ad,
              endDate,
              startDate,
              daysRemaining,
              isActive,
              isExpiring: daysRemaining > 0 && daysRemaining <= 7,
            };
            
            if (isActive) {
              active.push(enrichedAd);
              if (daysRemaining <= 7) expiringCount++;
            } else {
              expired.push(enrichedAd);
            }
            
            // Calculate total spent (from payment metadata)
            if (ad.paymentAmount) {
              totalSpent += parseFloat(ad.paymentAmount);
            }
          });
          
          setActiveAds(active);
          setExpiredAds(expired);
          
          setStats({
            totalActive: active.length,
            totalExpired: expired.length,
            expiringThisWeek: expiringCount,
            totalSpent,
            totalImpressions: 0, // You'll populate this from analytics
            totalClicks: 0
          });
          
          console.log('✅ Ads processed:', { active: active.length, expired: expired.length });
        } else {
          console.warn('⚠️ No ads found:', result);
          setActiveAds([]);
          setExpiredAds([]);
        }
      } catch (error) {
        console.error('❌ Error fetching ads:', error);
        setActiveAds([]);
        setExpiredAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [currentPublisherId]);

  const handleExtendAd = (ad) => {
    console.log('🔄 Opening extension form for ad:', ad.id);
    setSelectedAdForExtension(ad);
    setShowExtensionModal(true);
  };

  const handleExtensionSubmit = async (formData) => {
    console.log('✅ Extension form submitted:', formData);
    
    try {
      // Create extension payment
      const metadata = {
        publisherId: currentPublisherId,
        adId: selectedAdForExtension.id,
        templateId: selectedAdForExtension.templateId,
        templateName: selectedAdForExtension.templateName,
        deviceType: selectedAdForExtension.deviceType,
        extension: true,
        oldEndDate: selectedAdForExtension.endDate.toISOString(),
        newEndDate: formData.endDate.toISOString(),
        duration: {
          type: formData.durationType,
          quantity: formData.customDuration,
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate.toISOString(),
        },
        type: 'ad_extension'
      };

      const paymentUrl = `/payment?amount=${formData.totalPrice}&currency=ZAR&description=${encodeURIComponent(`Ad Extension - ${selectedAdForExtension.templateName} (${formData.customDuration} ${formData.durationType}(s))`)}&metadata=${encodeURIComponent(JSON.stringify(metadata))}&returnUrl=${encodeURIComponent(window.location.href)}`;
      
      // Store extension data
      sessionStorage.setItem('pendingAdExtension', JSON.stringify({
        adId: selectedAdForExtension.id,
        publisherId: currentPublisherId,
        duration: metadata.duration
      }));
      
      console.log('💳 Navigating to payment for extension...');
      router.push(paymentUrl);
      
    } catch (error) {
      console.error('❌ Error creating extension payment:', error);
      alert(`Failed: ${error.message}. Please try again.`);
    }
  };

  const handleDeleteAd = async (adId) => {
    if (!confirm('Are you sure you want to delete this ad? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/delete-ad?adId=${adId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        alert('Ad deleted successfully');
        // Refresh ads
        window.location.reload();
      } else {
        throw new Error(result.error || 'Failed to delete ad');
      }
    } catch (error) {
      console.error('❌ Error deleting ad:', error);
      alert(`Failed to delete ad: ${error.message}`);
    }
  };

  const getStatusBadge = (ad) => {
    if (!ad.isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle size={12} />
          Expired
        </span>
      );
    }
    
    if (ad.isExpiring) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertCircle size={12} />
          Expiring Soon
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle size={12} />
        Active
      </span>
    );
  };

  const filteredAds = () => {
    let ads = [...activeAds, ...expiredAds];
    
    // Filter by status
    if (filterStatus === 'active') {
      ads = ads.filter(ad => ad.isActive && !ad.isExpiring);
    } else if (filterStatus === 'expiring') {
      ads = ads.filter(ad => ad.isExpiring);
    } else if (filterStatus === 'expired') {
      ads = ads.filter(ad => !ad.isActive);
    }
    
    // Filter by device
    if (filterDevice !== 'all') {
      ads = ads.filter(ad => ad.deviceType === filterDevice);
    }
    
    return ads;
  };

  // Show loading while initializing
  if (isInitializing || publisherLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error if no publisher ID
  if (!currentPublisherId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold text-red-800 mb-2">Access Denied</h2>
            <p className="text-gray-700 mb-4">Please sign in to view your dashboard.</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header publisher={publisher} />
      
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ad Campaign Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your advertising campaigns and track performance</p>
            </div>
            <Link
              href="/print-media/monetization/advertise"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusCircle size={18} />
              <span className="hidden sm:inline">New Campaign</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Active Ads */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Active Ads</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalActive}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Expiring This Week */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Expiring This Week</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.expiringThisWeek}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Total Spent */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Spent</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">R{stats.totalSpent.toLocaleString()}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Expired Ads */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Expired Ads</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.totalExpired}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterStatus('expiring')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'expiring'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Expiring
              </button>
              <button
                onClick={() => setFilterStatus('expired')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'expired'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Expired
              </button>
            </div>

            {/* Device Filter */}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setFilterDevice('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterDevice === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Devices
              </button>
              <button
                onClick={() => setFilterDevice('desktop')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterDevice === 'desktop'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Desktop
              </button>
              <button
                onClick={() => setFilterDevice('mobile')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterDevice === 'mobile'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Mobile
              </button>
            </div>
          </div>
        </div>

        {/* Ads Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your campaigns...</p>
            </div>
          ) : filteredAds().length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns found</h3>
              <p className="text-gray-600 mb-6">
                {filterStatus !== 'all' || filterDevice !== 'all'
                  ? 'Try adjusting your filters to see more campaigns.'
                  : 'Get started by creating your first ad campaign.'}
              </p>
              <Link
                href="/print-media/monetization/advertise"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusCircle size={18} />
                Create New Campaign
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Campaign</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Device</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Duration</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700">End Date</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Days Left</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAds().map((ad) => (
                    <tr key={ad.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {ad.mediaUrl && (
                            <img 
                              src={ad.mediaUrl} 
                              alt={ad.templateName}
                              className="w-16 h-16 object-cover rounded border"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{ad.templateName || `Template ${ad.templateId}`}</p>
                            <p className="text-sm text-gray-500">{ad.fileName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(ad)}
                      </td>
                      <td className="p-4">
                        <span className="capitalize text-sm text-gray-700">{ad.deviceType}</span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <p className="text-gray-900 font-medium">
                            {ad.duration?.quantity} {ad.duration?.type}(s)
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{ad.endDate ? format(ad.endDate, 'MMM dd, yyyy') : 'N/A'}</p>
                          <p className="text-gray-500">{ad.startDate ? format(ad.startDate, 'MMM dd, yyyy') : ''}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        {ad.isActive ? (
                          <span className={`text-sm font-medium ${
                            ad.isExpiring ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {ad.daysRemaining} days
                          </span>
                        ) : (
                          <span className="text-sm text-red-600">Expired</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-semibold text-gray-900">
                          R{(ad.paymentAmount || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {ad.isActive && (
                            <button
                              onClick={() => handleExtendAd(ad)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Extend Campaign"
                            >
                              <RefreshCw size={16} />
                            </button>
                          )}
                          {ad.destinationUrl && (
                            <a
                              href={ad.destinationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View Destination"
                            >
                              <ExternalLink size={16} />
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteAd(ad.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Campaign"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/print-media/monetization/advertise"
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <PlusCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">New Campaign</h3>
                <p className="text-sm text-gray-600">Create a new ad campaign</p>
              </div>
            </div>
          </Link>

          <button
            onClick={() => window.location.reload()}
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <RefreshCw className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Refresh Data</h3>
                <p className="text-sm text-gray-600">Update campaign status</p>
              </div>
            </div>
          </button>

          <Link
            href="/print-media/monetization/analytics"
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">View Analytics</h3>
                <p className="text-sm text-gray-600">Track performance metrics</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Extension Modal */}
      {showExtensionModal && selectedAdForExtension && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl my-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">Extend Campaign</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Current end date: {selectedAdForExtension.endDate ? format(selectedAdForExtension.endDate, 'MMM dd, yyyy') : 'N/A'}
                </p>
              </div>
              <AdPaymentForm
                templateId={selectedAdForExtension.templateId}
                templateName={selectedAdForExtension.templateName}
                dimension={`${selectedAdForExtension.dimensions || 'N/A'}`}
                deviceType={selectedAdForExtension.deviceType}
                onSubmit={handleExtensionSubmit}
                onCancel={() => {
                  setShowExtensionModal(false);
                  setSelectedAdForExtension(null);
                }}
                initialData={{
                  durationType: 'week',
                  customDuration: '1',
                  startDate: selectedAdForExtension.endDate || new Date(),
                  notes: `Extension for ${selectedAdForExtension.templateName}`
                }}
                isEditing={false}
              />
            </div>
          </div>
        </div>
      )}

      <PrintMediaFooter />
    </div>
  );
}