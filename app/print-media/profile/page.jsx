'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../Firebase/firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import { 
  Camera, User, Mail, Calendar, MapPin, Phone, Settings, Save, Edit2, X, 
  Building, Users, Globe, FileText, Plus, Trash2, Briefcase, Award, AlertTriangle,
  CheckCircle, Clock, Shield
} from 'lucide-react';
import PressPassHeader from '@/components/UI/PressPassHeader';

const PublisherProfile = () => {
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [missingRequirements, setMissingRequirements] = useState([]);
  const [user, setUser] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState('');
  const [companyLogoPreview, setCompanyLogoPreview] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    dateOfBirth: '',
    idNumber: '', // South African ID
    businessRegistrationNumber: '',
    vatNumber: '',
    publishingLicense: null, // File upload
    proofOfAddress: null, // File upload
    bankingDetails: '',
    companyWebsite: '',
    contactName: '',
    jobTitle: '',
    phone: '',
    publicationType: '',
    audienceType: '',
    monthlyReadership: '',
    companyDescription: '',
    address: '',
    city: '',
    foundedYear: '',
    employeeCount: '',
    profilePicture: null,
    companyLogo: null,
    staff: [],
  });
  const [newStaffMember, setNewStaffMember] = useState({
    name: '',
    position: '',
    email: '',
    department: ''
  });

  const router = useRouter();

  const industries = [
    'News & Journalism', 'Magazine', 'Academic Publishing', 'Trade Publications', 
    'Digital Media', 'Broadcasting', 'Other'
  ];

  const handleDocumentUpload = (e, docType) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
      setFormData(prev => ({ ...prev, [docType]: file }));
    } else {
      alert('File must be less than 5MB');
    }
  };

  // Updated validation to focus only on required fields
  const validateRequiredFields = () => {

      // Check if already verified/approved - if so, profile is considered complete
  if (user?.isVerified || user?.isApproved) {
    console.log('✅ User is verified/approved - profile complete');
    setIsProfileComplete(true);
    setMissingRequirements([]);
    return true;
  }

    // Only these fields are required - Legal Requirements + Personal Information
    const required = [
      'dateOfBirth',         // Personal Information
      'idNumber',            // Personal Information  
      'businessRegistrationNumber', // Legal Requirements
      'publishingLicense',   // Legal Requirements
      'proofOfAddress'       // Legal Requirements
    ];
    
    const missing = required.filter(field => {
      const value = formData[field];
      return !value || value === '';
    });

     console.log('📋 Validation result:', {
    missing: missing,
    isComplete: missing.length === 0,
    isVerified: user?.isVerified,
    isApproved: user?.isApproved
  });
    
    setMissingRequirements(missing);
    setIsProfileComplete(missing.length === 0);
    
    return missing.length === 0;
  };

  // Modified complete profile function
  const handleCompleteProfile = async () => {
    if (!validateRequiredFields()) {
      const fieldLabels = {
        'dateOfBirth': 'Date of Birth',
        'idNumber': 'SA ID Number',
        'businessRegistrationNumber': 'Business Registration Number',
        'publishingLicense': 'Publishing License',
        'proofOfAddress': 'Proof of Address'
      };
      
      const missingLabels = missingRequirements.map(field => fieldLabels[field] || field);
      alert(`Please complete these required fields before proceeding:\n\n• ${missingLabels.join('\n• ')}`);
      return;
    }
    
    // Save profile data
    await handleSaveProfile();
    
    // Mark profile as complete and redirect to overview
    if (isProfileComplete) {
      try {
        const idToken = await authUser.getIdToken();
        await fetch('/api/publisher-profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({ 
            profileComplete: true,
            completedAt: new Date().toISOString()
          })
        });
        
        // Update local storage
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        currentUser.profileComplete = true;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        alert('Profile completed successfully! Your account is now pending admin approval.');
        router.push('/print-media/overview');
      } catch (error) {
        console.error('Error marking profile complete:', error);
      }
    }
  };

  const departments = [
    'Editorial', 'Marketing', 'Sales', 'Technology', 'Administration', 
    'Design', 'Photography', 'Research', 'Legal', 'Finance'
  ];

useEffect(() => {
  if (user) {
    console.log('🔍 Running validation check...', {
      hasUser: !!user,
      isVerified: user.isVerified,
      isApproved: user.isApproved,
      profileComplete: user.profileComplete
    });
    validateRequiredFields();
  }
}, [user, formData]);

  // Handle authentication state changes
  useEffect(() => {
    console.log('🔐 Setting up auth state listener...');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 Auth state changed:', user ? 'User signed in' : 'User signed out');
      setAuthUser(user);
      setAuthLoading(false);
      
      if (user) {
        console.log('✅ User authenticated:', user.uid);
        loadPublisherProfile(user);
      } else {
        console.warn('⚠️ No authenticated user, redirecting to sign in');
        router.push('/signin');
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth listener');
      unsubscribe();
    };
  }, [router]);

 const loadPublisherProfile = async (currentUser = null) => {
  try {
    setIsLoading(true);
    const userToUse = currentUser || authUser;
    
    if (!userToUse) {
      console.warn('⚠️ No authenticated user available');
      return;
    }

    console.log('📡 Fetching publisher profile from API...');
    const idToken = await userToUse.getIdToken();
    
    const response = await fetch('/api/publisher-profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch profile');
    }

    const userData = await response.json();
    console.log('✅ Publisher profile loaded:', userData);
    console.log('👥 Staff members:', userData.staff?.length || 0);

    setUser(userData);
    
    // CRITICAL FIX: Update localStorage with fresh data including staff
    const updatedUserData = {
      uid: userToUse.uid,
      email: userToUse.email,
      ...userData,
      role: 'publisher' // Ensure role is set
    };
    
    console.log('💾 Updating localStorage with fresh data...');
    localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
    
    setFormData({
      companyName: userData.companyName || '',
      industry: userData.industry || '',
      dateOfBirth: userData.dateOfBirth || '',
      idNumber: userData.idNumber || '',
      businessRegistrationNumber: userData.businessRegistrationNumber || '',
      vatNumber: userData.vatNumber || '',
      publishingLicense: userData.publishingLicense || null,
      proofOfAddress: userData.proofOfAddress || null,
      bankingDetails: userData.bankingDetails || '',
      companyWebsite: userData.companyWebsite || '',
      contactName: userData.contactName || userData.email || '',
      jobTitle: userData.jobTitle || '',
      phone: userData.phone || '',
      publicationType: userData.publicationType || '',
      audienceType: userData.audienceType || '',
      monthlyReadership: userData.monthlyReadership || '',
      companyDescription: userData.companyDescription || '',
      address: userData.address || '',
      city: userData.city || '',
      foundedYear: userData.foundedYear || '',
      employeeCount: userData.employeeCount || '',
      profilePicture: null,
      companyLogo: null,
      staff: userData.staff || []
    });
    setProfilePicPreview(userData.profilePicture || '');
    setCompanyLogoPreview(userData.companyLogo || '');

  } catch (error) {
    console.error('❌ Error loading profile:', error);
    alert(`Failed to load profile: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`📝 Input change: ${name} = ${value}`);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    console.log(`🖼️ ${type} image selected:`, file?.name);

    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'profile') {
          setFormData(prev => ({ ...prev, profilePicture: file }));
          setProfilePicPreview(reader.result);
          console.log('👀 Profile pic preview updated');
        } else if (type === 'logo') {
          setFormData(prev => ({ ...prev, companyLogo: file }));
          setCompanyLogoPreview(reader.result);
          console.log('🏢 Company logo preview updated');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStaffInputChange = (e) => {
    const { name, value } = e.target;
    setNewStaffMember(prev => ({ ...prev, [name]: value }));
  };

  const addStaffMember = () => {
    if (!newStaffMember.name.trim() || !newStaffMember.position.trim()) {
      alert('Please fill in name and position');
      return;
    }

    console.log('👥 Adding staff member:', newStaffMember);
    setFormData(prev => ({
      ...prev,
      staff: [...prev.staff, { ...newStaffMember, id: Date.now() }]
    }));
    setNewStaffMember({ name: '', position: '', email: '', department: '' });
  };

  const removeStaffMember = (id) => {
    console.log('🗑️ Removing staff member:', id);
    setFormData(prev => ({
      ...prev,
      staff: prev.staff.filter(member => member.id !== id)
    }));
  };

  const handleSaveProfile = async () => {
    if (!authUser) {
      alert('Please sign in to save your profile');
      return;
    }

    // Basic validation
    if (!formData.companyName.trim()) {
      alert('Company name is required');
      return;
    }

    console.log('💾 Saving publisher profile...');
    setIsLoading(true);

    try {
      const idToken = await authUser.getIdToken();
      console.log('📤 Sending profile update to API...');
      
      // Prepare data for submission
      const dataToSend = {
        ...formData,
        // Only send image data if new images were uploaded
        profilePicture: profilePicPreview !== user?.profilePicture ? profilePicPreview : undefined,
        companyLogo: companyLogoPreview !== user?.companyLogo ? companyLogoPreview : undefined
      };

      const response = await fetch('/api/publisher-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        const errorData = await response.json();
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
    // Reset form data to original values
    setFormData({
      companyName: user?.companyName || '',
      industry: user?.industry || '',
      dateOfBirth: user?.dateOfBirth || '',
      idNumber: user?.idNumber || '',
      businessRegistrationNumber: user?.businessRegistrationNumber || '',
      vatNumber: user?.vatNumber || '',
      publishingLicense: user?.publishingLicense || null,
      proofOfAddress: user?.proofOfAddress || null,
      bankingDetails: user?.bankingDetails || '',
      companyWebsite: user?.companyWebsite || '',
      contactName: user?.contactName || '',
      jobTitle: user?.jobTitle || '',
      phone: user?.phone || '',
      publicationType: user?.publicationType || '',
      audienceType: user?.audienceType || '',
      monthlyReadership: user?.monthlyReadership || '',
      companyDescription: user?.companyDescription || '',
      address: user?.address || '',
      city: user?.city || '',
      foundedYear: user?.foundedYear || '',
      employeeCount: user?.employeeCount || '',
      profilePicture: null,
      companyLogo: null,
      staff: user?.staff || []
    });
    setProfilePicPreview(user?.profilePicture || '');
    setCompanyLogoPreview(user?.companyLogo || '');
  };

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-slate-600 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading spinner while loading profile data
  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-slate-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PressPassHeader/>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Updated Requirements Notice - Only show required fields */}
        {/* Updated Requirements Notice - Only show if NOT verified AND missing fields */}
{!isProfileComplete && !user?.isVerified && !user?.isApproved && (
  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-8 shadow-sm">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <AlertTriangle className="h-6 w-6 text-amber-500" />
      </div>
      <div className="ml-4">
        <h3 className="text-lg font-semibold text-amber-800 mb-2">Complete Required Fields</h3>
        <p className="text-amber-700 mb-3">
          To activate your publisher account, please complete the following required sections:
        </p>
        <div className="bg-white/50 rounded-lg p-4 mb-3">
          <h4 className="font-semibold text-amber-800 mb-2">Required Sections:</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• <strong>Personal Information:</strong> Date of Birth, SA ID Number</li>
            <li>• <strong>Legal Requirements:</strong> Business Registration, Publishing License, Proof of Address</li>
          </ul>
        </div>
        <p className="text-sm text-amber-600">
          Other fields are optional and can be completed later.
        </p>
      </div>
    </div>
  </div>
)}

{/* Show success banner when verified */}
{(user?.isVerified || user?.isApproved) && (
  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-8 shadow-sm">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <CheckCircle className="h-6 w-6 text-green-500" />
      </div>
      <div className="ml-4">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Profile Verified</h3>
        <p className="text-green-700">
          Your publisher account has been approved and verified. You can now publish articles without restrictions.
        </p>
      </div>
    </div>
  </div>
)}

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-10 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
            </div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-8">
                {/* Company Logo */}
                <div className="relative group">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl bg-white backdrop-blur-sm">
                    {companyLogoPreview || user?.companyLogo ? (
                      <img 
                        src={companyLogoPreview || user?.companyLogo} 
                        alt="Company Logo" 
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                        <Building className="w-14 h-14 text-slate-400" />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-3 cursor-pointer hover:bg-blue-700 shadow-lg transition-all transform hover:scale-105">
                      <Camera className="w-5 h-5 text-white" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageChange(e, 'logo')} 
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>

                {/* Profile Picture */}
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl bg-white">
                    {profilePicPreview || user?.profilePicture ? (
                      <img 
                        src={profilePicPreview || user?.profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                        <User className="w-12 h-12 text-slate-400" />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 shadow-lg transition-all transform hover:scale-105">
                      <Camera className="w-4 h-4 text-white" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageChange(e, 'profile')} 
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>

                {/* User Info */}
                <div className="text-white">
                  <h1 className="text-3xl font-bold mb-2 text-white drop-shadow-sm">
                    {user?.companyName || 'Your Company Name'}
                  </h1>
                  <div className="space-y-2 text-blue-50">
                    <p className="flex items-center text-lg">
                      <User className="w-5 h-5 mr-2" />
                      {user?.contactName || authUser?.displayName || authUser?.email} 
                      {user?.jobTitle && (
                        <span className="ml-2 px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                          {user.jobTitle}
                        </span>
                      )}
                    </p>
                    <p className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {user?.email || authUser?.email}
                    </p>
                    <div className="flex items-center space-x-4 mt-3">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                        Print Media Publisher
                      </span>
                      {user?.isVerified && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-100 rounded-full text-sm font-medium flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white/20 backdrop-blur-sm text-white border border-white/30 px-6 py-3 rounded-xl flex items-center space-x-2 hover:bg-white/30 transition-all transform hover:scale-105 shadow-lg"
                  >
                    <Edit2 className="w-5 h-5" />
                    <span className="font-medium">Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCompleteProfile}
                      disabled={isLoading}
                      className="bg-green-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:bg-green-700 transition-all disabled:opacity-50 shadow-lg transform hover:scale-105"
                    >
                      <Save className="w-5 h-5" />
                      <span className="font-medium">
                        {isLoading ? 'Saving...' : isProfileComplete ? 'Complete & Continue' : 'Save Progress'}
                      </span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                      className="bg-white/20 backdrop-blur-sm text-white border border-white/30 px-6 py-3 rounded-xl flex items-center space-x-2 hover:bg-white/30 transition-all shadow-lg"
                    >
                      <X className="w-5 h-5" />
                      <span className="font-medium">Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Information */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Company Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-blue-100 rounded-xl mr-4">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Company Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter your company name"
                      required
                    />
                  ) : (
                    <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                      {user?.companyName || <span className="text-slate-400">Not provided</span>}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Industry</label>
                  {isEditing ? (
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="">Select Industry</option>
                      {industries.map(industry => (
                        <option key={industry} value={industry.toLowerCase().replace(/\s+/g, '-')}>
                          {industry}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                      {user?.industry || <span className="text-slate-400">Not provided</span>}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Website</label>
                  {isEditing ? (
                    <input
                      type="url"
                      name="companyWebsite"
                      value={formData.companyWebsite}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="https://example.com"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center">
                      <Globe className="w-5 h-5 mr-3 text-slate-400" />
                      {user?.companyWebsite ? (
                        <a href={user.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                          {user.companyWebsite}
                        </a>
                      ) : (
                        <span className="text-slate-400">Not provided</span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Founded Year</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="foundedYear"
                      value={formData.foundedYear}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      min="1800"
                      max={new Date().getFullYear()}
                      placeholder="e.g., 2010"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center">
                      <Calendar className="w-5 h-5 mr-3 text-slate-400" />
                      {user?.foundedYear || <span className="text-slate-400">Not provided</span>}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Employee Count</label>
                  {isEditing ? (
                    <select
                      name="employeeCount"
                      value={formData.employeeCount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="">Select Size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="500+">500+ employees</option>
                    </select>
                  ) : (
                    <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center">
                      <Users className="w-5 h-5 mr-3 text-slate-400" />
                      {user?.employeeCount || <span className="text-slate-400">Not provided</span>}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="+27 XX XXX XXXX"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center">
                      <Phone className="w-5 h-5 mr-3 text-slate-400" />
                      {user?.phone || <span className="text-slate-400">Not provided</span>}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Company Address</label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    placeholder="Enter your complete business address"
                  />
                ) : (
                  <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start min-h-[80px]">
                    <MapPin className="w-5 h-5 mr-3 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span className={user?.address ? "text-slate-700" : "text-slate-400"}>
                      {user?.address || 'Not provided'}
                    </span>
                  </div>
                )}
              </div>
              
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    City <span className="text-red-500">*</span>
  </label>
  {isEditing ? (
    <input
      type="text"
      name="city"
      value={formData.city || ""}
      onChange={handleInputChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      placeholder="Enter your city"
      required
    />
  ) : (
    <p className="px-3 py-2 bg-gray-50 rounded-lg">
      {user?.city || "Not provided"}
    </p>
  )}
</div>


              <div className="mt-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Company Description</label>
                {isEditing ? (
                  <textarea
                    name="companyDescription"
                    value={formData.companyDescription}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    placeholder="Tell us about your company, mission, and what makes you unique..."
                  />
                ) : (
                  <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 min-h-[120px]">
                    <span className={user?.companyDescription ? "text-slate-700" : "text-slate-400"}>
                      {user?.companyDescription || 'No description provided'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Publication Details */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-green-100 rounded-xl mr-4">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Publication Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Your full name"
                      required
                    />
                  ) : (
                    <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                      {user?.contactName || <span className="text-slate-400">Not provided</span>}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="e.g., Editor-in-Chief, Publisher"
                      required
                    />
                  ) : (
                    <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center">
                      <Briefcase className="w-5 h-5 mr-3 text-slate-400" />
                      {user?.jobTitle || <span className="text-slate-400">Not provided</span>}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Publication Type <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <select
                      name="publicationType"
                      value={formData.publicationType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="daily">Daily Newspaper</option>
                      <option value="weekly">Weekly Magazine</option>
                      <option value="monthly">Monthly Publication</option>
                      <option value="quarterly">Quarterly Journal</option>
                      <option value="digital">Digital Only</option>
                    </select>
                  ) : (
                    <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                      {user?.publicationType || <span className="text-slate-400">Not provided</span>}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Target Audience <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <select
                      name="audienceType"
                      value={formData.audienceType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    >
                      <option value="">Select Audience</option>
                      <option value="general">General Public</option>
                      <option value="business">Business Professionals</option>
                      <option value="academic">Academic/Researchers</option>
                      <option value="youth">Youth/Students</option>
                      <option value="specialized">Specialized Interest</option>
                    </select>
                  ) : (
                    <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                      {user?.audienceType || <span className="text-slate-400">Not provided</span>}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Monthly Readership</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="monthlyReadership"
                      value={formData.monthlyReadership}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Average monthly readers"
                      min="0"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center">
                      <Users className="w-5 h-5 mr-3 text-slate-400" />
                      {user?.monthlyReadership ? 
                        <span className="font-medium text-slate-700">{user.monthlyReadership.toLocaleString()} readers/month</span> : 
                        <span className="text-slate-400">Not provided</span>
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Staff Management */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-purple-100 rounded-xl mr-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Staff Members</h2>
              </div>

              {isEditing && (
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                  <h3 className="text-lg font-semibold text-slate-700 mb-4">Add New Staff Member</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="name"
                      value={newStaffMember.name}
                      onChange={handleStaffInputChange}
                      placeholder="Full Name"
                      className="px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    />
                    <input
                      type="text"
                      name="position"
                      value={newStaffMember.position}
                      onChange={handleStaffInputChange}
                      placeholder="Position/Title"
                      className="px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    />
                    <input
                      type="email"
                      name="email"
                      value={newStaffMember.email}
                      onChange={handleStaffInputChange}
                      placeholder="Email (optional)"
                      className="px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    />
                    <select
                      name="department"
                      value={newStaffMember.department}
                      onChange={handleStaffInputChange}
                      className="px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={addStaffMember}
                    className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Staff Member</span>
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {formData.staff.length > 0 ? (
                  formData.staff.map((member) => (
                    <div key={member.id || member.name} className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:shadow-md transition-all">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800 text-lg">{member.name}</div>
                        <div className="text-slate-600 mb-1">
                          {member.position}
                          {member.department && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                              {member.department}
                            </span>
                          )}
                        </div>
                        {member.email && (
                          <div className="text-blue-600 font-medium">{member.email}</div>
                        )}
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => removeStaffMember(member.id || member.name)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">No staff members added yet</p>
                    <p className="text-slate-400 text-sm">Add team members to showcase your organization</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Personal Info & Legal */}
          <div className="space-y-8">
            
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-orange-100 rounded-xl mr-4">
                  <User className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Personal Information</h2>
                  <p className="text-sm text-slate-500">Required for SA Publishers</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  ) : (
                    <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center">
                      <Calendar className="w-5 h-5 mr-3 text-slate-400" />
                      {user?.dateOfBirth ? 
                        <span className="font-medium text-slate-700">{new Date(user.dateOfBirth).toLocaleDateString()}</span> : 
                        <span className="text-slate-400">Not provided</span>
                      }
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    SA ID Number <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="idNumber"
                      value={formData.idNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter your SA ID number"
                      required
                    />
                  ) : (
                    <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center">
                      <Shield className="w-5 h-5 mr-3 text-slate-400" />
                      {user?.idNumber ? 
                        <span className="font-mono text-slate-700">{user.idNumber.substring(0, 6)}****{user.idNumber.substring(10)}</span> : 
                        <span className="text-slate-400">Not provided</span>
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Legal Requirements */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-red-100 rounded-xl mr-4">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Legal Requirements</h2>
                  <p className="text-sm text-slate-500">SA Publisher Documentation</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Business Registration Number <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="businessRegistrationNumber"
                      value={formData.businessRegistrationNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="CK/YYYY/XXXXXX"
                      required
                    />
                  ) : (
                    <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                      {user?.businessRegistrationNumber || <span className="text-slate-400">Not provided</span>}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">VAT Number (if applicable)</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="vatNumber"
                      value={formData.vatNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="4XXXXXXXXX"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                      {user?.vatNumber || <span className="text-slate-400">Not applicable</span>}
                    </div>
                  )}
                </div>

                {/* Document Uploads */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Publishing License <span className="text-red-500">*</span>
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleDocumentUpload(e, 'publishingLicense')}
                          className="w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:font-medium"
                        />
                        <p className="text-xs text-slate-500 mt-2">PDF, JPG, PNG up to 5MB</p>
                      </div>
                    ) : (
                      <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center">
                        <FileText className="w-5 h-5 mr-3 text-slate-400" />
                        {user?.publishingLicense ? 
                          <span className="text-green-600 font-medium flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Document uploaded
                          </span> : 
                          <span className="text-slate-400">Not provided</span>
                        }
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Proof of Address <span className="text-red-500">*</span>
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleDocumentUpload(e, 'proofOfAddress')}
                          className="w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:font-medium"
                        />
                        <p className="text-xs text-slate-500 mt-2">PDF, JPG, PNG up to 5MB</p>
                      </div>
                    ) : (
                      <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center">
                        <FileText className="w-5 h-5 mr-3 text-slate-400" />
                        {user?.proofOfAddress ? 
                          <span className="text-green-600 font-medium flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Document uploaded
                          </span> : 
                          <span className="text-slate-400">Not provided</span>
                        }
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-emerald-100 rounded-xl mr-4">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Account Status</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Account Type</span>
                  <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl text-sm font-bold">
                    Publisher
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Status</span>
                  <span className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center ${
                    user?.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user?.isActive ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Active
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        Inactive
                      </>
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Verification</span>
                  <span className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center ${
                    user?.isVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user?.isVerified ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verified
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        Pending
                      </>
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-3">
                  <span className="text-slate-600 font-medium">Member Since</span>
                  <span className="text-slate-800 font-semibold">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default PublisherProfile;