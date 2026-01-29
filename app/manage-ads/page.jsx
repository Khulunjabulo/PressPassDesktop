'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Calendar, 
  DollarSign, 
  Eye, 
  BarChart3, 
  Clock, 
  Edit, 
  Trash2, 
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

function ManageAdsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const publisherId = searchParams?.get('publisherId');

  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAd, setSelectedAd] = useState(null);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extensionDays, setExtensionDays] = useState(7);
  const [extensionCost, setExtensionCost] = useState(0);
  const [processing, setProcessing] = useState(false);

  // Price per day for extension (you can adjust this)
  const PRICE_PER_DAY = 10; // ZAR per day

  useEffect(() => {
    if (publisherId) {
      fetchUserAds();
    } else {
      setError('Publisher ID not found. Please sign in again.');
      setLoading(false);
    }
  }, [publisherId]);

  useEffect(() => {
    setExtensionCost(extensionDays * PRICE_PER_DAY);
  }, [extensionDays]);

  const fetchUserAds = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ads?publisherId=${publisherId}`);
      const data = await response.json();

      if (data.success) {
        setAds(data.ads || []);
      } else {
        setError(data.error || 'Failed to fetch ads');
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
      setError('Failed to load your advertisements');
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

      // Calculate new end date
      const currentEndDate = selectedAd.schedule?.endDate 
        ? new Date(selectedAd.schedule.endDate) 
        : new Date();
      const newEndDate = new Date(currentEndDate);
      newEndDate.setDate(newEndDate.getDate() + extensionDays);

      // Redirect to payment page with extension details
      const paymentUrl = new URL('/payment', window.location.origin);
      paymentUrl.searchParams.set('amount', extensionCost);
      paymentUrl.searchParams.set('currency', 'ZAR');
      paymentUrl.searchParams.set('description', `Extend Ad: ${selectedAd.title} (${extensionDays} days)`);
      paymentUrl.searchParams.set('metadata', JSON.stringify({
        type: 'ad_extension',
        adId: selectedAd.id,
        extensionDays: extensionDays,
        originalEndDate: currentEndDate.toISOString(),
        newEndDate: newEndDate.toISOString(),
        publisherId: publisherId
      }));
      paymentUrl.searchParams.set('returnUrl', `/manage-ads?publisherId=${publisherId}`);

      router.push(paymentUrl.toString());

    } catch (error) {
      console.error('Error processing extension:', error);
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
        fetchUserAds(); // Refresh the list
      } else {
        alert(data.error || 'Failed to delete ad');
      }
    } catch (error) {
      console.error('Error deleting ad:', error);
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
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDaysRemaining = (endDate) => {
    if (!endDate) return 'N/A';
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Your Advertisements</h1>
          <p className="text-gray-600">Track, extend, and manage all your active advertisements</p>
        </div>

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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Advertisements Yet</h3>
            <p className="text-gray-600 mb-6">Start advertising on MediaHub to reach millions of readers</p>
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
                      {/* Ad Preview */}
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

                      {/* Ad Details */}
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

                        {/* Stats Grid */}
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
                                {ad.paymentInfo?.currency} {ad.paymentInfo?.amount}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <span className="font-medium">Start:</span> {formatDate(ad.schedule?.startDate)}
                          </div>
                          <div>
                            <span className="font-medium">End:</span> {formatDate(ad.schedule?.endDate)}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span> {ad.schedule?.duration} {ad.schedule?.durationUnit}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => handleExtendAd(ad)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium"
                          >
                            <Clock className="w-4 h-4" />
                            Extend Duration
                          </button>

                          <button
                            onClick={() => router.push(`/ad-analytics?adId=${ad.id}`)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 text-sm font-medium"
                          >
                            <BarChart3 className="w-4 h-4" />
                            View Analytics
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