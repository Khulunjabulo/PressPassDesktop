'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/UI/header'
import PublisherSidebar from '@/components/UI/publisherSidebar'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useCurrentPublisher } from "@/hooks/useCurrentPublisher"
import { X, Plus, User, AlertCircle } from 'lucide-react'
import { auth } from '../../../Firebase/firebase'

export default function Journalist() {
  const { publisher, loading } = useCurrentPublisher("currentPublisherId");
  const [journalists, setJournalists] = useState([]);
  const [articlesData, setArticlesData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // New journalist form state
  const [newJournalist, setNewJournalist] = useState({
    name: '',
    position: '',
    email: '',
    department: 'Editorial'
  });

  const departments = [
    'Editorial', 'Journalism', 'Photography', 'Design', 'Research'
  ];

  // Load journalists from publisher profile
  useEffect(() => {
    if (publisher?.staff) {
      const journalistStaff = publisher.staff.filter(member => 
        member.department === 'Editorial' || 
        member.department === 'Journalism' ||
        member.position?.toLowerCase().includes('journalist') ||
        member.position?.toLowerCase().includes('reporter') ||
        member.position?.toLowerCase().includes('editor') ||
        member.position?.toLowerCase().includes('writer')
      );
      
      setJournalists(journalistStaff);
      loadJournalistStats(journalistStaff);
    }
  }, [publisher]);

  const loadJournalistStats = async (journalistList) => {
    try {
      const response = await fetch('/api/articles');
      if (!response.ok) {
        console.error('Failed to fetch articles');
        return;
      }
      
      const articles = await response.json();
      
      const stats = {};
      journalistList.forEach(journalist => {
        const journalistArticles = articles.filter(
          article => article.author === journalist.name
        );
        
        stats[journalist.name] = {
          articleCount: journalistArticles.length,
          totalViews: journalistArticles.reduce((sum, a) => sum + (a.views || 0), 0),
          avgEngagement: journalistArticles.length > 0 
            ? (journalistArticles.reduce((sum, a) => sum + (a.engagement || 0), 0) / journalistArticles.length).toFixed(1)
            : 0,
          status: journalist.status || 'Active'
        };
      });
      
      setArticlesData(stats);
    } catch (error) {
      console.error('Error loading journalist stats:', error);
    }
  };

  const getJournalistColor = (index) => {
    const colors = ['#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534'];
    return colors[index % colors.length];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewJournalist(prev => ({ ...prev, [name]: value }));
    setSubmitError('');
  };

  const handleAddJournalist = async (e) => {
    e.preventDefault();
    
    if (!newJournalist.name.trim()) {
      setSubmitError('Journalist name is required');
      return;
    }
    
    if (!newJournalist.position.trim()) {
      setSubmitError('Position is required');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Check if user is authenticated
      const currentAuthUser = auth.currentUser;
      
      if (!currentAuthUser) {
        throw new Error('Please sign in to add journalists');
      }

      console.log('🔑 Getting Firebase ID token...');
      const idToken = await currentAuthUser.getIdToken(true);
      console.log('✅ ID token obtained');

      const updatedStaff = [
        ...(publisher.staff || []),
        {
          ...newJournalist,
          id: Date.now(),
          status: 'Active',
          addedAt: new Date().toISOString()
        }
      ];

      console.log('📤 Updating profile with new journalist...');
      
      const response = await fetch('/api/publisher-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ staff: updatedStaff })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add journalist');
      }

      const result = await response.json();
      console.log('✅ Journalist added successfully');

      const addedJournalist = updatedStaff[updatedStaff.length - 1];
      setJournalists(prev => [...prev, addedJournalist]);

      // Update localStorage
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      currentUser.staff = updatedStaff;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      setNewJournalist({
        name: '',
        position: '',
        email: '',
        department: 'Editorial'
      });
      setShowAddModal(false);

      alert('Journalist added successfully!');
      loadJournalistStats([...journalists, addedJournalist]);

    } catch (error) {
      console.error('❌ Error adding journalist:', error);
      setSubmitError(error.message || 'Failed to add journalist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-violet-200 border-t-violet-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading journalists...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header publisher={publisher} />
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row overflow-hidden">
        <PublisherSidebar />
        <main className="flex-1 p-2 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
              Journalists ({journalists.length})
            </h1>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700 text-sm w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Journalist
            </button>
          </div>

          {journalists.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <div className="max-w-md mx-auto">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  No Journalists Added Yet
                </h2>
                <p className="text-gray-600 mb-6">
                  No journalists added yet. Please add team members to your profile.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-violet-600 text-white px-6 py-3 rounded-md hover:bg-violet-700 flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Journalist
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {journalists.map((journalist, index) => {
                const stats = articlesData[journalist.name] || {
                  articleCount: 0,
                  totalViews: 0,
                  avgEngagement: 0,
                  status: 'Active'
                };

                return (
                  <div
                    key={journalist.id || index}
                    className="bg-white rounded-xl shadow p-4 flex flex-col justify-between hover:shadow-md transition min-w-0"
                  >
                    <div>
                      <h2 className="text-base md:text-lg font-semibold text-gray-800">
                        {journalist.name}
                      </h2>
                      <p className="text-xs md:text-sm text-gray-500">
                        {journalist.position}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {journalist.department}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600 mt-2">
                        {stats.articleCount} articles published
                      </p>
                      <p className={`text-xs mt-1 ${stats.status === 'Active' ? 'text-green-500' : 'text-yellow-500'}`}>
                        ● {stats.status}
                      </p>
                    </div>

                    <div className="my-4 h-24 sm:h-28 w-full min-w-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[{ engagement: parseFloat(stats.avgEngagement) || 0 }]}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="engagement" hide />
                          <YAxis hide domain={[0, 10]} />
                          <Tooltip />
                          <Bar
                            dataKey="engagement"
                            fill={getJournalistColor(index)}
                            animationDuration={1500}
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex justify-between items-center text-xs md:text-sm text-gray-700">
                      <span className="font-medium">
                        {(stats.totalViews / 1000).toFixed(1)}k views
                      </span>
                      <span className="text-green-600 font-medium">
                        {stats.avgEngagement}% engagement
                      </span>
                    </div>

                    {journalist.email && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">{journalist.email}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Add Journalist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <User className="w-6 h-6 text-violet-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Add Journalist</h2>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewJournalist({
                    name: '',
                    position: '',
                    email: '',
                    department: 'Editorial'
                  });
                  setSubmitError('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddJournalist} className="p-6">
              {submitError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{submitError}</p>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Journalist Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newJournalist.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                  Position/Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={newJournalist.position}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="e.g., Senior Journalist, Reporter, Editor"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newJournalist.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="journalist@example.com"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  id="department"
                  name="department"
                  value={newJournalist.department}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  required
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewJournalist({
                      name: '',
                      position: '',
                      email: '',
                      department: 'Editorial'
                    });
                    setSubmitError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Journalist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}