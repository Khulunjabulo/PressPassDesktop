'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Calendar, 
  DollarSign, 
  Eye, 
  BarChart3, 
  Clock, 
  Trash2, 
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

function ManageAdsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [ads, setAds] = useState([]);
  const [allAds, setAllAds] = useState([]); // Store all ads for debugging
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAd, setSelectedAd] = useState(null);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extensionDays, setExtensionDays] = useState(7);
  const [extensionCost, setExtensionCost] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [publisherId, setPublisherId] = useState('');
  const [userData, setUserData] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  const PRICE_PER_DAY = 10;

  // Get user data from localStorage
  useEffect(() => {
    try {
      let userDataStr = localStorage.getItem('user');
      if (!userDataStr) {
        userDataStr = localStorage.getItem('currentUser');
      }
      
      ('📦 [MANAGE-ADS-DEBUG] Raw localStorage data:', userDataStr);
      
      if (!userDataStr) {
        console.error('❌ [MANAGE-ADS-DEBUG] No user data found');
        setError('Please sign in to view your ads');
        setLoading(false);
        return;
      }

      const user = JSON.parse(userDataStr);
      ('👤 [MANAGE-ADS-DEBUG] Full user object:', user);

      setUserData(user);
      
      const urlPublisherId = searchParams?.get('publisherId');
      const finalPublisherId = urlPublisherId || user.uid;
      
      ('🆔 [MANAGE-ADS-DEBUG] Publisher IDs:', {
        fromUrl: urlPublisherId,
        fromUser: user.uid,
        final: finalPublisherId,
        userKeys: Object.keys(user)
      });
      
      setPublisherId(finalPublisherId);

    } catch (error) {
      console.error('❌ [MANAGE-ADS-DEBUG] Error:', error);
      setError('Failed to load user data. Please sign in again.');
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (publisherId) {
      fetchUserAds();
    }
  }, [publisherId]);

  useEffect(() => {
    setExtensionCost(extensionDays * PRICE_PER_DAY);
  }, [extensionDays]);

  const fetchUserAds = async () => {
    try {
      setLoading(true);
      setError('');
      
      ('📡 [MANAGE-ADS-DEBUG] Fetching ads...');
      
      // Fetch ALL ads with debug mode
      const response = await fetch(`/api/ads?includeInactive=true&debug=true`);
      const data = await response.json();

      ('📥 [MANAGE-ADS-DEBUG] Full API response:', data);
      ('📥 [MANAGE-ADS-DEBUG] Total ads in database:', data.totalInDatabase);
      ('📥 [MANAGE-ADS-DEBUG] Ads returned:', data.ads?.length);

      if (data.success) {
        setAllAds(data.ads || []);
        
        // Log every ad's publisherId
        (data.ads || []).forEach((ad, index) => {
          (`🔍 [MANAGE-ADS-DEBUG] Ad ${index + 1}:`, {
            id: ad.id,
            title: ad.title,
            publisherId: ad.publisherId,
            publisherEmail: ad.publisherEmail,
            hasPublisherId: !!ad.publisherId,
            publisherIdType: typeof ad.publisherId,
            allKeys: Object.keys(ad)
          });
        });

        // Try multiple matching strategies
        const userAds1 = (data.ads || []).filter(ad => ad.publisherId === publisherId);
        const userAds2 = (data.ads || []).filter(ad => ad.publisherId?.includes(publisherId));
        const userAds3 = (data.ads || []).filter(ad => publisherId?.includes(ad.publisherId));
        const userAds4 = (data.ads || []).filter(ad => ad.publisherEmail === userData?.email);

        ('🔍 [MANAGE-ADS-DEBUG] Matching attempts:', {
          currentPublisherId: publisherId,
          userEmail: userData?.email,
          exactMatch: userAds1.length,
          publisherIdIncludes: userAds2.length,
          userIdIncludes: userAds3.length,
          emailMatch: userAds4.length
        });

        // Set debug info
        setDebugInfo({
          totalAds: data.ads?.length || 0,
          publisherId: publisherId,
          userEmail: userData?.email,
          allPublisherIds: [...new Set((data.ads || []).map(ad => ad.publisherId))],
          matchStrategies: {
            exact: userAds1.length,
            includes: userAds2.length,
            reverse: userAds3.length,
            email: userAds4.length
          }
        });

        // Use the best match
        let userAds = userAds1;
        if (userAds1.length === 0 && userAds4.length > 0) {
          ('✅ [MANAGE-ADS-DEBUG] Using email match');
          userAds = userAds4;
        } else if (userAds1.length === 0 && userAds2.length > 0) {
          ('✅ [MANAGE-ADS-DEBUG] Using includes match');
          userAds = userAds2;
        }

        ('✅ [MANAGE-ADS-DEBUG] Final user ads:', userAds.length);
        setAds(userAds);
        
      } else {
        console.error('❌ [MANAGE-ADS-DEBUG] API error:', data.error);
        setError(data.error || 'Failed to fetch ads');
      }
    } catch (error) {
      console.error('💥 [MANAGE-ADS-DEBUG] Error:', error);
      setError('Failed to load your advertisements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExtendAd = (ad) => {
    setSelectedAd(ad);
    setShowExtendModal(true);
  };

  const processExtension = async () => {
    if (!selectedAd) return;

    try {
      setProcessing(true);

      const currentEndDate = selectedAd.schedule?.endDate 
        ? new Date(selectedAd.schedule.endDate) 
        : new Date();
      const newEndDate = new Date(currentEndDate);
      newEndDate.setDate(newEndDate.getDate() + extensionDays);

      const paymentUrl = new URL('/payment', window.location.origin);
      paymentUrl.searchParams.set('amount', extensionCost);
      paymentUrl.searchParams.set('currency', 'ZAR');
      paymentUrl.searchParams.set('description', `Extend Ad: ${selectedAd.title} (${extensionDays} days)`);
      
      const metadata = {
        type: 'ad_extension',
        adId: selectedAd.id,
        extensionDays: extensionDays,
        originalEndDate: currentEndDate.toISOString(),
        newEndDate: newEndDate.toISOString(),
        publisherId: publisherId,
        templateName: selectedAd.title,
        deviceType: selectedAd.adType,
        dimensions: selectedAd.dimensions
      };
      
      paymentUrl.searchParams.set('metadata', JSON.stringify(metadata));
      paymentUrl.searchParams.set('returnUrl', `/manage-ads`);

      router.push(paymentUrl.toString());

    } catch (error) {
      console.error('💥 [MANAGE-ADS-DEBUG] Error processing extension:', error);
      alert('Failed to process extension. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteAd = async (adId) => {
    if (!confirm('Are you sure you want to delete this ad? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/ads?id=${adId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert('Ad deleted successfully');
        fetchUserAds();
      } else {
        alert(data.error || 'Failed to delete ad');
      }
    } catch (error) {
      console.error('💥 [MANAGE-ADS-DEBUG] Error deleting ad:', error);
      alert('Failed to delete ad');
    }
  };

  const getAdStatus = (ad) => {
    if (ad.status === 'active' && ad.approved) {
      return { text: 'Active', color: 'text-green-600 bg-green-100', icon: CheckCircle };
    } else if (ad.status === 'pending') {
      return { text: 'Pending', color: 'text-yellow-600 bg-yellow-100', icon: Clock };
    } else if (!ad.approved) {
      return { text: 'Not Approved', color: 'text-red-600 bg-red-100', icon: XCircle };
    } else {
      return { text: 'Inactive', color: 'text-gray-600 bg-gray-100', icon: AlertCircle };
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const calculateDaysRemaining = (endDate) => {
    if (!endDate) return 'N/A';
    try {
      const end = new Date(endDate);
      const now = new Date();
      const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
    } catch (error) {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your advertisements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/signin')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Your Advertisements</h1>
          <p className="text-gray-600">
            Track, extend, and manage all your active advertisements
            {userData && (
              <span className="ml-2 text-sm">
                • Signed in as <strong>{userData.email}</strong>
              </span>
            )}
          </p>
        </div>

        {/* DEBUG INFO */}
        {debugInfo && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-yellow-900 mb-4">🔍 Debug Information</h3>
            <div className="space-y-2 text-sm font-mono">
              <div><strong>Your Publisher ID:</strong> {debugInfo.publisherId}</div>
              <div><strong>Your Email:</strong> {debugInfo.userEmail}</div>
              <div><strong>Total Ads in DB:</strong> {debugInfo.totalAds}</div>
              <div><strong>All Publisher IDs in DB:</strong></div>
              <ul className="ml-4 list-disc">
                {debugInfo.allPublisherIds.map((id, i) => (
                  <li key={i}>{id || '(empty)'}</li>
                ))}
              </ul>
              <div className="mt-4"><strong>Match Results:</strong></div>
              <ul className="ml-4">
                <li>Exact Match: {debugInfo.matchStrategies.exact} ads</li>
                <li>Includes Match: {debugInfo.matchStrategies.includes} ads</li>
                <li>Email Match: {debugInfo.matchStrategies.email} ads</li>
              </ul>
              <div className="mt-4 p-3 bg-yellow-100 rounded">
                <strong>💡 Tip:</strong> Check browser console for detailed logs
              </div>
            </div>
          </div>
        )}

        {/* Show ALL ads for debugging */}
        {allAds.length > 0 && ads.length === 0 && (
          <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4">📢 All Ads in Database</h3>
            <p className="text-sm text-blue-800 mb-4">
              There are {allAds.length} ads in the database, but none match your publisherId. 
              Here they are:
            </p>
            <div className="space-y-2">
              {allAds.map((ad, index) => (
                <div key={ad.id} className="bg-white p-3 rounded border border-blue-200 text-xs font-mono">
                  <div><strong>#{index + 1}</strong></div>
                  <div>ID: {ad.id}</div>
                  <div>Title: {ad.title}</div>
                  <div>PublisherId: {ad.publisherId || '(EMPTY!)'}</div>
                  <div>PublisherEmail: {ad.publisherEmail || '(EMPTY!)'}</div>
                  <div className={ad.publisherId === publisherId ? 'text-green-600 font-bold' : 'text-red-600'}>
                    Match: {ad.publisherId === publisherId ? 'YES ✓' : 'NO ✗'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Ads</p>
                <p className="text-2xl font-bold text-gray-900">{ads.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Ads</p>
                <p className="text-2xl font-bold text-green-600">
                  {ads.filter(ad => ad.status === 'active' && ad.approved).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Views</p>
                <p className="text-2xl font-bold text-purple-600">
                  {ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0)}
                </p>
              </div>
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Clicks</p>
                <p className="text-2xl font-bold text-orange-600">
                  {ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0)}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Ads List */}
        {ads.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Matching Advertisements</h3>
            <p className="text-gray-600 mb-6">
              {allAds.length > 0 
                ? `There are ${allAds.length} ads in the database, but none match your account. Check the debug info above.`
                : 'Start advertising on MediaHub to reach millions of readers'
              }
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Ad
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {ads.map((ad) => {
              const status = getAdStatus(ad);
              const StatusIcon = status.icon;
              const daysRemaining = calculateDaysRemaining(ad.schedule?.endDate);

              return (
                <div key={ad.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="lg:w-1/4">
                        {ad.desktopImage ? (
                          <img
                            src={ad.desktopImage}
                            alt={ad.title}
                            className="w-full h-auto rounded-lg border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500">No preview</p>
                          </div>
                        )}
                      </div>

                      <div className="lg:w-3/4">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{ad.title}</h3>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color} flex items-center gap-1`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.text}
                              </span>
                              <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-700">
                                {ad.adType}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-600">Impressions</p>
                              <p className="text-sm font-semibold text-gray-900">{ad.impressions || 0}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-600">Clicks</p>
                              <p className="text-sm font-semibold text-gray-900">{ad.clicks || 0}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-600">Days Left</p>
                              <p className="text-sm font-semibold text-gray-900">{daysRemaining}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-600">Paid</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {ad.paymentInfo?.currency || 'ZAR'} {ad.paymentInfo?.amount || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <span className="font-medium">Start:</span> {formatDate(ad.schedule?.startDate || ad.createdAt)}
                          </div>
                          <div>
                            <span className="font-medium">End:</span> {formatDate(ad.schedule?.endDate)}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span> {ad.schedule?.duration || 'N/A'} {ad.schedule?.durationUnit || 'days'}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => handleExtendAd(ad)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium"
                          >
                            <Clock className="w-4 h-4" />
                            Extend Duration
                          </button>

                          <button
                            onClick={() => handleDeleteAd(ad.id)}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-2 text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Extend Duration Modal */}
      {showExtendModal && selectedAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Extend Ad Duration</h2>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Extend the duration of <strong>{selectedAd.title}</strong>
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Days
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={extensionDays}
                  onChange={(e) => setExtensionDays(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Price per day:</span>
                  <span className="font-semibold">ZAR {PRICE_PER_DAY}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Days:</span>
                  <span className="font-semibold">{extensionDays}</span>
                </div>
                <div className="border-t border-blue-300 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">ZAR {extensionCost}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Current end date: {formatDate(selectedAd.schedule?.endDate)}<br />
                New end date: {formatDate(new Date(new Date(selectedAd.schedule?.endDate || new Date()).getTime() + extensionDays * 24 * 60 * 60 * 1000))}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={processExtension}
                disabled={processing}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-5 h-5 mr-2" />
                    Proceed to Payment
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  setShowExtendModal(false);
                  setSelectedAd(null);
                  setExtensionDays(7);
                }}
                disabled={processing}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ManageAds() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ManageAdsContent />
    </Suspense>
  );
}