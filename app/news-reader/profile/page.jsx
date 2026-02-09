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
    rating: 5,
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
    ('👤 Setting up auth listener...');
    
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      ('💾 Found user in localStorage');
      try {
        const userData = JSON.parse(storedUser);
        ('✅ User from localStorage:', userData.email);
        
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
      ('🔄 Auth state changed:', firebaseUser ? firebaseUser.email : 'No user');
      
      setAuthChecked(true);
      
      if (firebaseUser) {
        ('✅ Firebase user is authenticated');
        loadUserProfile();
        loadUserReview();
      } else {
        console.warn('⚠️ No authenticated Firebase user');
        
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          ('📱 User session found in storage, attempting to restore...');
          router.push('/signin');
        } else {
          router.push('/signin');
        }
        setIsLoading(false);
      }
    });

    return () => {
      ('🧹 Cleaning up auth listener');
      unsubscribe();
    };
  }, [router]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      ('📡 Loading user profile...');
      
      let currentUser = auth.currentUser;
      let attempts = 0;
      
      while (!currentUser && attempts < 10) {
        (`⏳ Waiting for auth user... attempt ${attempts + 1}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        currentUser = auth.currentUser;
        attempts++;
      }

      if (!currentUser) {
        console.error('❌ No authenticated user found after waiting');
        router.push('/signin');
        return;
      }

      ('✅ Auth user found:', currentUser.email);
      ('🎫 Getting ID token...');
      
      const idToken = await currentUser.getIdToken();
      ('✅ ID token obtained');

      ('📡 Fetching user profile from API...');
      const response = await fetch('/api/user-profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      ('📡 API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const userData = await response.json();
      ('✅ User profile loaded successfully');

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
        ('🔐 Authentication error, redirecting to signin...');
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
        setReviewFormData({ rating: 5, reviewText: '' });
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
        className={`w-6 h-6 ${interactive ? 'cursor-pointer' : ''} ${
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
    (`📝 Input change: ${name} = ${value}`);

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
    (`🏷️ Toggling category: ${category}`);
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
    ('🖼️ Image selected:', file?.name);

    if (file) {
      setFormData(prev => ({ ...prev, profilePicture: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
        ('👀 Profile pic preview updated');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    ('💾 Saving profile...');
    setIsLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      const idToken = await currentUser.getIdToken();
      ('📤 Sending profile update to API...');
      
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
      ('✅ Profile updated successfully:', result);

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
    ('🗑️ Starting profile deletion...');
    setIsDeleting(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      const idToken = await currentUser.getIdToken();
      ('📤 Sending delete request to API...');
      
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

      ('✅ Profile deleted successfully');
      
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
    ('❌ Cancelling edit');
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16 md:pt-0">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8 pt-20 md:pt-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Picture Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto flex items-center justify-center overflow-hidden">
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
                      <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
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
                  <h2 className="mt-4 text-xl font-semibold text-gray-800">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-gray-600">{user?.email}</p>
                  <div className="mt-4 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm inline-block">
                    ✓ Active Reader
                  </div>

                  {/* Delete Profile Button */}
                  <div className="mt-6">
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition w-full justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Profile Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">{user?.firstName || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">{user?.lastName || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </label>
                    <p className="px-3 py-2 bg-gray-100 rounded-lg text-gray-600">{user?.email}</p>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">{user?.phone || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">{user?.location || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Date of Birth
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">
                        {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-lg min-h-[2.5rem]">
                      {user?.bio || 'No bio provided'}
                    </p>
                  )}
                </div>
              </div>

              {/* Preferences Section */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  <Settings className="w-5 h-5 inline mr-2" />
                  Preferences
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Favorite Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {newsCategories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => isEditing && handleCategoryToggle(category)}
                          disabled={!isEditing}
                          className={`px-3 py-1 text-sm rounded-full border transition ${
                            (formData.preferences.categories || []).includes(category)
                              ? 'bg-blue-100 border-blue-300 text-blue-800'
                              : 'bg-gray-100 border-gray-300 text-gray-600'
                          } ${isEditing ? 'cursor-pointer hover:bg-blue-50' : 'cursor-default'}`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="preferences.notifications"
                        checked={formData.preferences.notifications}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable push notifications</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="preferences.emailUpdates"
                        checked={formData.preferences.emailUpdates}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Receive email updates</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Review Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    <MessageSquare className="w-5 h-5 inline mr-2" />
                    My Review
                  </h3>
                  {!loadingReview && !userReview && !showReviewForm && (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      Write a Review
                    </button>
                  )}
                </div>

                {loadingReview ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading review...</p>
                  </div>
                ) : userReview && !showReviewForm ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        {renderStars(userReview.rating)}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowReviewForm(true);
                            setReviewFormData({
                              rating: userReview.rating,
                              reviewText: userReview.reviewText
                            });
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={handleReviewDelete}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{userReview.reviewText}</p>
                    <p className="text-xs text-gray-500">
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
                        Rating
                      </label>
                      <div className="flex items-center gap-1">
                        {renderStars(reviewFormData.rating, true, (rating) => 
                          setReviewFormData(prev => ({ ...prev, rating }))
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review
                      </label>
                      <textarea
                        value={reviewFormData.reviewText}
                        onChange={(e) => setReviewFormData(prev => ({ ...prev, reviewText: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Share your experience with Press Pass..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Minimum 10 characters
                      </p>
                    </div>

                    {reviewError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-600 text-sm">{reviewError}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowReviewForm(false);
                          setReviewError('');
                          if (!userReview) {
                            setReviewFormData({ rating: 5, reviewText: '' });
                          }
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReviewSubmit}
                        disabled={submittingReview}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        {submittingReview ? 'Submitting...' : (userReview ? 'Update Review' : 'Submit Review')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">You haven&apos;t written a review yet</p>
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Delete Profile</h3>
              <div className="mb-6">
                <p className="text-gray-700 mb-3">
                  Are you sure you want to delete your profile? This action will:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
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
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProfile}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
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