// components/admin/AdsManagement.jsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  MousePointer, 
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function AdsManagement() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, pending, inactive
  const [selectedAdType, setSelectedAdType] = useState('all');

  useEffect(() => {
    fetchAds();
  }, [filter, selectedAdType]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        includeInactive: 'true'
      });
      
      if (selectedAdType !== 'all') {
        params.append('type', selectedAdType);
      }

      const response = await fetch(`/api/ads?${params}`);
      const data = await response.json();
      
      if (data.success) {
        let filteredAds = data.ads;
        
        if (filter !== 'all') {
          filteredAds = data.ads.filter(ad => ad.status === filter);
        }
        
        setAds(filteredAds);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAdStatus = async (adId, status, approved = null) => {
    try {
      const updateData = { id: adId, status };
      if (approved !== null) {
        updateData.approved = approved;
      }

      const response = await fetch('/api/ads', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      
      if (result.success) {
        fetchAds(); // Refresh the list
        alert(`Ad ${status === 'active' ? 'approved' : status} successfully`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating ad:', error);
      alert('Error updating ad: ' + error.message);
    }
  };

  const deleteAd = async (adId) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;

    try {
      const response = await fetch(`/api/ads?id=${adId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        fetchAds(); // Refresh the list
        alert('Ad deleted successfully');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting ad:', error);
      alert('Error deleting ad: ' + error.message);
    }
  };

  const getStatusBadge = (status, approved) => {
    if (status === 'active' && approved) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </span>
      );
    } else if (status === 'pending') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Pending
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Inactive
        </span>
      );
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    let date;
    if (timestamp.seconds) {
      // Firestore timestamp
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ads Management</h1>
        <p className="text-gray-600">Manage and approve advertisements across the platform</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad Type</label>
            <select
              value={selectedAdType}
              onChange={(e) => setSelectedAdType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="sidebar_rectangle">Sidebar Rectangle</option>
              <option value="sidebar_skyscraper">Sidebar Skyscraper</option>
              <option value="mobile">Mobile Banner</option>
            </select>
          </div>

          <div className="text-sm text-gray-600 ml-auto">
            <span className="font-medium">{ads.length}</span> ads found
          </div>
        </div>
      </div>

      {/* Ads List */}
      <div className="space-y-4">
        {ads.map((ad) => (
          <div key={ad.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{ad.title}</h3>
                  {getStatusBadge(ad.status, ad.approved)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Created: {formatDate(ad.createdAt)}
                  </div>
                  <div className="flex items-center">
                    <MousePointer className="w-4 h-4 mr-2" />
                    Clicks: {ad.clicks || 0}
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Impressions: {ad.impressions || 0}
                  </div>
                </div>

                {ad.company && (
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Company:</strong> {ad.company}
                  </p>
                )}
                
                {ad.contactEmail && (
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Contact:</strong> {ad.contactEmail}
                  </p>
                )}
                
                <div className="flex items-center text-sm text-gray-600">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  <a 
                    href={ad.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    {ad.url}
                  </a>
                </div>
              </div>

              {/* Ad Preview */}
              <div className="ml-6 flex-shrink-0">
                <div 
                  className="border border-gray-300 rounded overflow-hidden"
                  style={{ 
                    width: Math.min(ad.dimensions?.width || 300, 200), 
                    height: Math.min(ad.dimensions?.height || 250, 150) 
                  }}
                >
                  <img
                    src={ad.desktopImage}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-gray-500 text-center mt-1">
                  {ad.dimensions?.width}×{ad.dimensions?.height}px
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Type:</span> {ad.adType}
              </div>

              <div className="flex items-center space-x-2">
                {ad.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateAdStatus(ad.id, 'active', true)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateAdStatus(ad.id, 'inactive', false)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
                
                {ad.status === 'active' && (
                  <button
                    onClick={() => updateAdStatus(ad.id, 'inactive', false)}
                    className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors flex items-center"
                  >
                    <EyeOff className="w-4 h-4 mr-1" />
                    Deactivate
                  </button>
                )}
                
                {ad.status === 'inactive' && (
                  <button
                    onClick={() => updateAdStatus(ad.id, 'active', true)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Activate
                  </button>
                )}
                
                <button
                  onClick={() => deleteAd(ad.id)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {ads.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <TrendingUp className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ads found</h3>
          <p className="text-gray-600">
            {filter === 'all' ? 'No advertisements have been created yet.' : `No ${filter} ads found.`}
          </p>
        </div>
      )}
    </div>
  );
}