'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../Firebase/firebase'; // Make sure this path is correct
import { onAuthStateChanged } from 'firebase/auth';
import { 
  Camera, User, Mail, Calendar, MapPin, Phone, Settings, Save, Edit2, X, 
  Building, Users, Globe, FileText, Plus, Trash2, Briefcase, Award
} from 'lucide-react';

const PublisherProfile = () => {
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
    companyWebsite: '',
    contactName: '',
    jobTitle: '',
    phone: '',
    publicationType: '',
    audienceType: '',
    monthlyReadership: '',
    companyDescription: '',
    address: '',
    foundedYear: '',
    employeeCount: '',
    profilePicture: null,
    companyLogo: null,
    staff: []
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

  const departments = [
    'Editorial', 'Marketing', 'Sales', 'Technology', 'Administration', 
    'Design', 'Photography', 'Research', 'Legal', 'Finance'
  ];

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

      setUser(userData);
      setFormData({
        companyName: userData.companyName || '',
        industry: userData.industry || '',
        companyWebsite: userData.companyWebsite || '',
        contactName: userData.contactName || userData.email || '',
        jobTitle: userData.jobTitle || '',
        phone: userData.phone || '',
        publicationType: userData.publicationType || '',
        audienceType: userData.audienceType || '',
        monthlyReadership: userData.monthlyReadership || '',
        companyDescription: userData.companyDescription || '',
        address: userData.address || '',
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
      companyWebsite: user?.companyWebsite || '',
      contactName: user?.contactName || '',
      jobTitle: user?.jobTitle || '',
      phone: user?.phone || '',
      publicationType: user?.publicationType || '',
      audienceType: user?.audienceType || '',
      monthlyReadership: user?.monthlyReadership || '',
      companyDescription: user?.companyDescription || '',
      address: user?.address || '',
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading spinner while loading profile data
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
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Company Logo */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-lg overflow-hidden border-4 border-white shadow-lg bg-white">
                    {companyLogoPreview || user?.companyLogo ? (
                      <img 
                        src={companyLogoPreview || user?.companyLogo} 
                        alt="Company Logo" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Building className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 shadow-lg">
                      <Camera className="w-4 h-4 text-white" />
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
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                    {profilePicPreview || user?.profilePicture ? (
                      <img 
                        src={profilePicPreview || user?.profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <User className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1.5 cursor-pointer hover:bg-blue-700 shadow-lg">
                      <Camera className="w-3 h-3 text-white" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageChange(e, 'profile')} 
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>

                <div className="text-white">
                  <h1 className="text-2xl font-bold">
                    {user?.companyName || 'Your Company Name'}
                  </h1>
                  <p className="text-blue-100 flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {user?.contactName || authUser?.displayName || authUser?.email} 
                    {user?.jobTitle && ` - ${user.jobTitle}`}
                  </p>
                  <p className="text-blue-100 flex items-center mt-1">
                    <Mail className="w-4 h-4 mr-1" />
                    {user?.email || authUser?.email}
                  </p>
                  <p className="text-blue-100 text-sm mt-1">Print Media Publisher</p>
                </div>
              </div>

              <div className="flex space-x-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-50 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isLoading ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-700 transition"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Company Information */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2 text-blue-600" />
                Company Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your company name"
                      required
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-lg">{user?.companyName || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  {isEditing ? (
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Industry</option>
                      {industries.map(industry => (
                        <option key={industry} value={industry.toLowerCase().replace(/\s+/g, '-')}>
                          {industry}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-lg">{user?.industry || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  {isEditing ? (
                    <input
                      type="url"
                      name="companyWebsite"
                      value={formData.companyWebsite}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-lg flex items-center">
                      <Globe className="w-4 h-4 mr-2 text-gray-400" />
                      {user?.companyWebsite ? (
                        <a href={user.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {user.companyWebsite}
                        </a>
                      ) : (
                        'Not provided'
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Founded Year</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="foundedYear"
                      value={formData.foundedYear}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1800"
                      max={new Date().getFullYear()}
                      placeholder="e.g., 2010"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-lg flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {user?.foundedYear || 'Not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee Count</label>
                  {isEditing ? (
                    <select
                      name="employeeCount"
                      value={formData.employeeCount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="500+">500+ employees</option>
                    </select>
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-lg flex items-center">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      {user?.employeeCount || 'Not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-lg flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {user?.phone || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Address</label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter company address"
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-lg flex items-start">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                    {user?.address || 'Not provided'}
                  </p>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
                {isEditing ? (
                  <textarea
                    name="companyDescription"
                    value={formData.companyDescription}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tell us about your company..."
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-lg min-h-[100px]">
                    {user?.companyDescription || 'No description provided'}
                  </p>
                )}
              </div>
            </div>

            {/* Contact & Publication Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Publication Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your full name"
                      required
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-lg">{user?.contactName || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Editor-in-Chief, Publisher"
                      required
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-lg flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                      {user?.jobTitle || 'Not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Publication Type</label>
                  {isEditing ? (
                    <select
                      name="publicationType"
                      value={formData.publicationType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    <p className="px-3 py-2 bg-gray-50 rounded-lg">{user?.publicationType || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  {isEditing ? (
                    <select
                      name="audienceType"
                      value={formData.audienceType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    <p className="px-3 py-2 bg-gray-50 rounded-lg">{user?.audienceType || 'Not provided'}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Readership</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="monthlyReadership"
                      value={formData.monthlyReadership}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Average monthly readers"
                      min="0"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-lg flex items-center">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      {user?.monthlyReadership ? `${user.monthlyReadership.toLocaleString()} readers/month` : 'Not provided'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Staff Management */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Staff Members
              </h2>

              {isEditing && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Add Staff Member</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="name"
                      value={newStaffMember.name}
                      onChange={handleStaffInputChange}
                      placeholder="Full Name"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="text"
                      name="position"
                      value={newStaffMember.position}
                      onChange={handleStaffInputChange}
                      placeholder="Position/Title"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="email"
                      name="email"
                      value={newStaffMember.email}
                      onChange={handleStaffInputChange}
                      placeholder="Email (optional)"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <select
                      name="department"
                      value={newStaffMember.department}
                      onChange={handleStaffInputChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Staff Member</span>
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {formData.staff.length > 0 ? (
                  formData.staff.map((member) => (
                    <div key={member.id || member.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-600">
                          {member.position}
                          {member.department && ` • ${member.department}`}
                        </div>
                        {member.email && (
                          <div className="text-sm text-blue-600">{member.email}</div>
                        )}
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => removeStaffMember(member.id || member.name)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No staff members added yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Company Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Stats</h2>
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {user?.articlesCount || 0}
                  </div>
                  <div className="text-sm text-gray-600">Articles Published</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {user?.monthlyReadership ? user.monthlyReadership.toLocaleString() : '0'}
                  </div>
                  <div className="text-sm text-gray-600">Monthly Readers</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {user?.staff?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Staff Members</div>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                  </div>
                  <div className="text-sm text-gray-600">Days Active</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {user?.lastPosted ? (
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <FileText className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Last Article</div>
                      <div className="text-xs text-gray-600">
                        {new Date(user.lastPosted).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No articles published yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button 
                  onClick={() => router.push('/print-media/publish')}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Article</span>
                </button>
                
                <button 
                  onClick={() => router.push('/print-media/analytics')}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center justify-center space-x-2"
                >
                  <Award className="w-4 h-4" />
                  <span>View Analytics</span>
                </button>
                
                <button 
                  onClick={() => router.push('/print-media/manage')}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Manage Content</span>
                </button>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Account Type</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    Publisher
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user?.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Verification</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                    {user?.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </span>
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