'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/Firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Camera, User, Mail, Calendar, MapPin, Phone, Settings, Save, Edit2, X, Trash2, Star, MessageSquare } from 'lucide-react';
import Header from '@/components/news-reader/Header';

const ReaderProfile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Review states
  const [userReview, setUserReview] = useState(null);
  const [loadingReview, setLoadingReview] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    rating: 0,
    reviewText: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    dateOfBirth: '',
    profilePicture: null,
    preferences: {
      categories: [],
      notifications: true,
      emailUpdates: true
    }
  });

  const router = useRouter();

  const newsCategories = [
    'Politics', 'Technology', 'Sports', 'Entertainment', 'Business',
    'Health', 'Science', 'Travel', 'Food', 'Fashion', 'Environment', 'Education'
  ];

  useEffect(() => {
    console.log('👤 Setting up auth listener...');

    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      console.log('💾 Found user in localStorage');
      try {
        const userData = JSON.parse(storedUser);
        console.log('✅ User from localStorage:', userData.email);

        if (userData.role !== 'reader') {
          console.warn('⚠️ User is not a reader, redirecting...');
          router.push('/signin');
          return;
        }
      } catch (error) {
        console.error('❌ Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('🔄 Auth state changed:', firebaseUser ? firebaseUser.email : 'No user');

      setAuthChecked(true);

      if (firebaseUser) {
        console.log('✅ Firebase user is authenticated');
        loadUserProfile();
        loadUserReview();
      } else {
        console.warn('⚠️ No authenticated Firebase user');

        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          console.log('📱 User session found in storage, attempting to restore...');
          router.push('/signin');
        } else {
          router.push('/signin');
        }
        setIsLoading(false);
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth listener');
      unsubscribe();
    };
  }, [router]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      console.log('📡 Loading user profile...');

      let currentUser = auth.currentUser;
      let attempts = 0;

      while (!currentUser && attempts < 10) {
        console.log(`⏳ Waiting for auth user... attempt ${attempts + 1}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        currentUser = auth.currentUser;
        attempts++;
      }

      if (!currentUser) {
        console.error('❌ No authenticated user found after waiting');
        router.push('/signin');
        return;
      }

      console.log('✅ Auth user found:', currentUser.email);
      console.log('🎫 Getting ID token...');

      const idToken = await currentUser.getIdToken();
      console.log('✅ ID token obtained');

      console.log('📡 Fetching user profile from API...');
      const response = await fetch('/api/user-profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const userData = await response.json();
      console.log('✅ User profile loaded successfully');

      setUser(userData);
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        bio: userData.bio || '',
        location: userData.location || '',
        dateOfBirth: userData.dateOfBirth || '',
        profilePicture: null,
        preferences: {
          categories: userData.preferences?.categories || [],
          notifications: userData.preferences?.notifications ?? true,
          emailUpdates: userData.preferences?.emailUpdates ?? true
        }
      });
      setProfilePicPreview(userData.profilePicture || '');

    } catch (error) {
      console.error('❌ Error loading profile:', error);

      if (error.message.includes('Unauthorized') || error.message.includes('401')) {
        console.log('🔐 Authentication error, redirecting to signin...');
        localStorage.removeItem('currentUser');
        router.push('/signin');
      } else {
        alert(`Failed to load profile: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserReview = async () => {
    try {
      setLoadingReview(true);
      const currentUser = auth.currentUser;

      if (!currentUser) return;

      const idToken = await currentUser.getIdToken();
      const response = await fetch('/api/reviews', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.reviews) {
          const readerUid = `reader_${currentUser.uid}`;
          const review = data.reviews.find(r => r.userId === readerUid);

          if (review) {
            setUserReview(review);
            setReviewFormData({
              rating: review.rating,
              reviewText: review.reviewText
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading user review:', error);
    } finally {
      setLoadingReview(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (reviewFormData.rating === 0) {
      setReviewError('Please select a star rating before submitting');
      return;
    }

    if (!reviewFormData.reviewText.trim()) {
      setReviewError('Please write a review before submitting');
      return;
    }

    if (reviewFormData.reviewText.trim().length < 10) {
      setReviewError('Review must be at least 10 characters long');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError('');

      const currentUser = auth.currentUser;
      const idToken = await currentUser.getIdToken();

      const url = '/api/reviews';
      const method = userReview ? 'PUT' : 'POST';
      const body = userReview
        ? { reviewId: userReview.id, ...reviewFormData }
        : reviewFormData;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        setUserReview(data.review);
        setShowReviewForm(false);
        alert(userReview ? 'Review updated successfully!' : 'Review submitted successfully!');
        loadUserReview();
      } else {
        setReviewError(data.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setReviewError('An error occurred. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewDelete = async () => {
    if (!confirm('Are you sure you want to delete your review?')) return;

    try {
      const currentUser = auth.currentUser;
      const idToken = await currentUser.getIdToken();

      const response = await fetch(`/api/reviews?reviewId=${userReview.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setUserReview(null);
        setReviewFormData({ rating: 0, reviewText: '' });
        alert('Review deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-6 h-6 transition-all duration-200 ${interactive ? 'cursor-pointer hover:scale-125' : ''} ${
          index < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
        onClick={() => interactive && onChange && onChange(index + 1)}
      />
    ));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(`📝 Input change: ${name} = ${value}`);

    if (name.startsWith('preferences.')) {
      const prefKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCategoryToggle = (category) => {
    console.log(`🏷️ Toggling category: ${category}`);
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        categories: prev.preferences.categories.includes(category)
          ? prev.preferences.categories.filter(c => c !== category)
          : [...prev.preferences.categories, category]
      }
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log('🖼️ Image selected:', file?.name);

    if (file) {
      setFormData(prev => ({ ...prev, profilePicture: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
        console.log('👀 Profile pic preview updated');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    console.log('💾 Saving profile...');
    setIsLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      const idToken = await currentUser.getIdToken();
      console.log('📤 Sending profile update to API...');

      const response = await fetch('/api/user-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          ...formData,
          profilePicture: profilePicPreview !== user?.profilePicture ? profilePicPreview : undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const result = await response.json();
      console.log('✅ Profile updated successfully:', result);

      setUser(result.user);
      setIsEditing(false);
      alert('Profile updated successfully!');

    } catch (error) {
      console.error('❌ Error saving profile:', error);
      alert(`Failed to update profile: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    console.log('🗑️ Starting profile deletion...');
    setIsDeleting(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      const idToken = await currentUser.getIdToken();
      console.log('📤 Sending delete request to API...');

      const response = await fetch('/api/user-profile', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete profile');
      }

      console.log('✅ Profile deleted successfully');

      localStorage.removeItem('currentUser');
      await auth.signOut();
      router.push('/');

    } catch (error) {
      console.error('❌ Error deleting profile:', error);
      alert(`Failed to delete profile: ${error.message}`);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelEdit = () => {
    console.log('❌ Cancelling edit');
    setIsEditing(false);
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      location: user?.location || '',
      dateOfBirth: user?.dateOfBirth || '',
      profilePicture: null,
      preferences: {
        categories: user?.preferences?.categories || [],
        notifications: user?.preferences?.notifications ?? true,
        emailUpdates: user?.preferences?.emailUpdates ?? true
      }
    });
    setProfilePicPreview(user?.profilePicture || '');
  };

  if (!authChecked || (isLoading && !user)) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50/60 flex items-center justify-center pt-16 md:pt-0">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-gray-200 border-t-[#329ae1] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50/60 py-8 pt-20 md:pt-8">
        <div className="max-w-4xl mx-auto px-4 space-y-6">

          {/* ── Header Card ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Profile</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your account and preferences</p>
            </div>
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-5 py-2.5 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all duration-200 font-medium text-sm"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#329ae1] text-white rounded-xl hover:bg-[#2580c0] hover:shadow-lg hover:shadow-[#329ae1]/20 transition-all duration-300 font-medium text-sm shadow-sm disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#329ae1] text-white rounded-xl hover:bg-[#2580c0] hover:shadow-lg hover:shadow-[#329ae1]/20 transition-all duration-300 font-medium text-sm shadow-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left: Profile Card ── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
                <div className="relative inline-block mx-auto">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 mx-auto flex items-center justify-center overflow-hidden shadow-inner border-2 border-gray-100">
                    {profilePicPreview || user?.profilePicture ? (
                      <img
                        src={profilePicPreview || user?.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute -bottom-2 -right-2 bg-[#329ae1] text-white p-2.5 rounded-xl cursor-pointer hover:bg-[#2580c0] hover:shadow-lg hover:shadow-[#329ae1]/30 transition-all duration-300 shadow-md border-2 border-white">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <h2 className="mt-5 text-xl font-bold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-semibold">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  Active Reader
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-100 text-red-600 rounded-xl hover:bg-red-100 hover:shadow-sm transition-all duration-200 w-full justify-center text-sm font-medium group"
                  >
                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Delete Profile
                  </button>
                </div>
              </div>
            </div>

            {/* ── Right: Profile Details ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Profile Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#329ae1]/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-[#329ae1]" />
                  </div>
                  Profile Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">First Name</label>
                    {isEditing ? (
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#329ae1]/20 focus:border-[#329ae1] transition-all duration-200 text-sm"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 font-medium">{user?.firstName || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Last Name</label>
                    {isEditing ? (
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#329ae1]/20 focus:border-[#329ae1] transition-all duration-200 text-sm"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 font-medium">{user?.lastName || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-xl border border-gray-100">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">{user?.email}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5 ml-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Phone</label>
                    {isEditing ? (
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#329ae1]/20 focus:border-[#329ae1] transition-all duration-200 text-sm"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 font-medium">{user?.phone || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Location</label>
                    {isEditing ? (
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#329ae1]/20 focus:border-[#329ae1] transition-all duration-200 text-sm"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 font-medium">{user?.location || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Date of Birth</label>
                    {isEditing ? (
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#329ae1]/20 focus:border-[#329ae1] transition-all duration-200 text-sm"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 font-medium">
                          {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bio</label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#329ae1]/20 focus:border-[#329ae1] transition-all duration-200 text-sm resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 min-h-[80px]">
                      <p className="text-sm text-gray-700 leading-relaxed">{user?.bio || 'No bio provided'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#329ae1]/10 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-[#329ae1]" />
                  </div>
                  Preferences
                </h3>

                <div className="mb-6">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Favorite Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {newsCategories.map((category) => {
                      const isSelected = (formData.preferences.categories || []).includes(category);
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => isEditing && handleCategoryToggle(category)}
                          disabled={!isEditing}
                          className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-200 ${
                            isSelected
                              ? 'bg-blue-50 border-blue-200 text-[#329ae1] font-medium shadow-sm'
                              : 'bg-gray-50 border-gray-200 text-gray-500'
                          } ${isEditing ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-95' : 'cursor-default'}`}
                        >
                          {category}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="preferences.notifications"
                        checked={formData.preferences.notifications}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="peer sr-only"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#329ae1] disabled:opacity-40"></div>
                    </div>
                    <span className="ml-3 text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">Enable push notifications</span>
                  </label>

                  <label className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="preferences.emailUpdates"
                        checked={formData.preferences.emailUpdates}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="peer sr-only"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#329ae1] disabled:opacity-40"></div>
                    </div>
                    <span className="ml-3 text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">Receive email updates</span>
                  </label>
                </div>
              </div>

              {/* My Review */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-yellow-600" />
                    </div>
                    My Review
                  </h3>
                  {!loadingReview && !userReview && !showReviewForm && (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="px-4 py-2.5 bg-[#329ae1] text-white rounded-xl hover:bg-[#2580c0] hover:shadow-lg hover:shadow-[#329ae1]/20 transition-all duration-300 text-sm font-medium shadow-sm"
                    >
                      Write a Review
                    </button>
                  )}
                </div>

                {loadingReview ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-3 border-gray-200 border-t-[#329ae1] rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">Loading review...</p>
                  </div>
                ) : userReview && !showReviewForm ? (
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        {renderStars(userReview.rating)}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setShowReviewForm(true);
                            setReviewFormData({
                              rating: userReview.rating,
                              reviewText: userReview.reviewText
                            });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#329ae1] border border-blue-200 rounded-lg hover:bg-blue-50 transition-all duration-200"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={handleReviewDelete}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all duration-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-2">{userReview.reviewText}</p>
                    <p className="text-xs text-gray-400">
                      {userReview.updatedAt !== userReview.createdAt && 'Updated '}
                      {new Date(userReview.updatedAt || userReview.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                ) : showReviewForm ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {renderStars(reviewFormData.rating, true, (rating) =>
                            setReviewFormData(prev => ({ ...prev, rating }))
                          )}
                        </div>
                        {reviewFormData.rating === 0 && (
                          <span className="text-xs text-gray-400 italic">Click to rate</span>
                        )}
                        {reviewFormData.rating > 0 && (
                          <span className="text-xs text-gray-500 font-medium">
                            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewFormData.rating]}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={reviewFormData.reviewText}
                        onChange={(e) => setReviewFormData(prev => ({ ...prev, reviewText: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#329ae1]/20 focus:border-[#329ae1] transition-all duration-200 text-sm resize-none"
                        placeholder="Share your experience with Press Pass..."
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum 10 characters</p>
                    </div>

                    {reviewError && (
                      <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                        <p className="text-red-600 text-sm">{reviewError}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowReviewForm(false);
                          setReviewError('');
                          if (!userReview) {
                            setReviewFormData({ rating: 0, reviewText: '' });
                          }
                        }}
                        className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 text-sm font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReviewSubmit}
                        disabled={submittingReview}
                        className="px-5 py-2.5 bg-[#329ae1] text-white rounded-xl hover:bg-[#2580c0] hover:shadow-lg hover:shadow-[#329ae1]/20 transition-all duration-300 text-sm font-medium shadow-sm disabled:opacity-50"
                      >
                        {submittingReview ? 'Submitting...' : (userReview ? 'Update Review' : 'Submit Review')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-600 mb-4">You haven&apos;t written a review yet</p>
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="px-6 py-2.5 bg-[#329ae1] text-white rounded-xl hover:bg-[#2580c0] hover:shadow-lg hover:shadow-[#329ae1]/20 transition-all duration-300 font-medium text-sm shadow-sm"
                    >
                      Write Your First Review
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Delete Profile</h3>
              <div className="mb-6">
                <p className="text-gray-700 mb-3 text-sm text-center">
                  Are you sure you want to delete your profile? This action will:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2 text-sm bg-gray-50 rounded-xl p-4">
                  <li>Permanently delete your account</li>
                  <li>Remove all your personal data</li>
                  <li>Delete your preferences and settings</li>
                  <li>Delete any reviews you&apos;ve written</li>
                  <li><strong>Cannot be undone or retrieved</strong></li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProfile}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 font-medium text-sm disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Forever'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ReaderProfile;