'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/Firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Camera, User, Mail, Calendar, MapPin, Phone, Settings, Save, Edit2, X } from 'lucide-react';

const ReaderProfile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [authChecked, setAuthChecked] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState('');
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
    
    // Check if user is stored in localStorage first
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      console.log('💾 Found user in localStorage');
      try {
        const userData = JSON.parse(storedUser);
        console.log('✅ User from localStorage:', userData.email);
        
        // Check if it's a reader
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

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('🔄 Auth state changed:', firebaseUser ? firebaseUser.email : 'No user');
      
      setAuthChecked(true);
      
      if (firebaseUser) {
        console.log('✅ Firebase user is authenticated');
        loadUserProfile();
      } else {
        console.warn('⚠️ No authenticated Firebase user');
        
        // Check if we have a stored user session
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          console.log('📱 User session found in storage, attempting to restore...');
          // Try to restore the session or redirect to signin
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
      
      // Wait a bit for auth to be fully ready
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

  // Show loading until auth is checked
  if (!authChecked || (isLoading && !user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
              </div>
            </div>
          </div>

          {/* Profile Details Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
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
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReaderProfile;