'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/Firebase/firebase'; // ✅ Import initialized auth
import { Camera, User, Mail, Calendar, MapPin, Phone, Settings, Save, Edit2, X } from 'lucide-react';

const ReaderProfile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    console.log('👤 Loading user profile...');
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const currentUser = auth.currentUser; // ✅ Now uses initialized auth

      if (!currentUser) {
        console.warn('⚠️ No authenticated user found');
        router.push('/signin');
        return;
      }

      console.log('📡 Fetching user profile from API...');
      const response = await fetch('/api/user-profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const userData = await response.json();
      console.log('✅ User profile loaded:', userData);

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
      alert('Failed to load profile. Please try again.');
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
      const currentUser = auth.currentUser; // ✅ Using initialized auth
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      console.log('📤 Sending profile update to API...');
      const response = await fetch('/api/user-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        },
        body: JSON.stringify({
          ...formData,
          profilePicture: profilePicPreview !== user?.profilePicture ? profilePicPreview : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      console.log('✅ Profile updated successfully:', result);

      setUser(result.user);
      setIsEditing(false);
      alert('Profile updated successfully!');

    } catch (error) {
      console.error('❌ Error saving profile:', error);
      alert('Failed to update profile. Please try again.');
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

  if (isLoading && !user) {
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
        {/* The rest of your JSX remains unchanged */}
      </div>
    </div>
  );
};

export default ReaderProfile;
