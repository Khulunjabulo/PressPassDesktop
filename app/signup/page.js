'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '@fortawesome/fontawesome-free/css/all.min.css';
import "../globals.css";
import GoogleSignUpModal from '@/components/GoogleSignUpModal';
import {
  initializeGoogleSignIn,
  handleGoogleSignUp,
  handleGoogleSignUpClick,
  handleReaderRegistration,
  handlePublisherRegistration,
  validateReaderForm,
  validatePublisherForm
} from '../../lib/authLogic';

const MediaHubRegistration = () => {
  const [isPublisher, setIsPublisher] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Google Sign-up modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [googleUserData, setGoogleUserData] = useState(null);
  
  const [formData, setFormData] = useState({
    // Common fields
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePic: null,
    agreeToTerms: false,
    role: 'reader',
    
    // Publisher specific fields
    companyName: '',
    industry: '',
    companyWebsite: '',
    contactName: '',
    jobTitle: '',
    phone: '',
    publicationType: '',
    audienceType: '',
    monthlyReadership: '',
  });

  const router = useRouter();

  console.log('🔄 Rendering MediaHubRegistration component');
  console.log('📊 Current formData:', formData);
  console.log('📷 Profile pic preview:', profilePicPreview);
  console.log('⏳ isLoading:', isLoading);
  console.log('👥 isPublisher:', isPublisher);
  console.log('🔍 Google modal state:', { showFormModal, googleUserData: !!googleUserData });

  useEffect(() => {
    const handleGoogleCallback = (response) => {
      console.log('📞 Google callback received');
      handleGoogleSignUp(response, setIsLoading, setShowFormModal, setGoogleUserData);
    };

    initializeGoogleSignIn(handleGoogleCallback);
  }, []);

  // Enforce reader-only registration on mobile screens
  useEffect(() => {
    const enforceMobileRole = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setIsPublisher(false);
        setFormData(prev => ({ ...prev, role: 'reader' }));
      }
    };
    enforceMobileRole();
    window.addEventListener('resize', enforceMobileRole);
    return () => window.removeEventListener('resize', enforceMobileRole);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log('🖼️ Image selected:', file ? file.name : 'No file');
    if (file) {
      console.log('📏 File size:', file.size, 'bytes | Type:', file.type);
    }

    setFormData((prev) => {
      const updated = { ...prev, profilePic: file };
      console.log('💾 Updated formData.profilePic:', updated.profilePic);
      return updated;
    });

    const reader = new FileReader();
    reader.onloadend = () => {
      console.log('🎨 FileReader finished loading image');
      setProfilePicPreview(reader.result);
      console.log('👀 Profile pic preview updated (data URL length):', reader.result.length);
    };
    if (file) {
      console.log('🔍 Reading file as data URL...');
      reader.readAsDataURL(file);
    } else {
      setProfilePicPreview('');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(`📝 Input change detected: ${name} = ${type === 'checkbox' ? checked : value} (${type})`);

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
      console.log('🔄 Form data updated:', updated);
      return updated;
    });
  };

  const handleToggleForm = () => {
    console.log('🔄 Toggling registration form: isPublisher was', isPublisher);
    const newIsPublisher = !isPublisher;
    setIsPublisher(newIsPublisher);

    setFormData((prev) => {
      const role = newIsPublisher ? 'publisher' : 'reader';
      console.log(`🔁 Switching role to: ${role}`);

      const updated = {
        ...prev,
        role,
      };

      if (newIsPublisher === false) {
        // Switching to reader: clear publisher fields
        delete updated.companyName;
        delete updated.industry;
        delete updated.companyWebsite;
        delete updated.contactName;
        delete updated.jobTitle;
        delete updated.phone;
        delete updated.publicationType;
        delete updated.audienceType;
        delete updated.monthlyReadership;

        console.log('🧹 Cleared publisher-specific fields');
      }

      console.log('🔄 Final formData after toggle:', updated);
      return updated;
    });
  };

  const handleGoogleSignUpButtonClick = () => {
    console.log('🔘 Google Sign-Up button clicked');
    handleGoogleSignUpClick(formData.agreeToTerms);
  };

  const handleReaderSubmit = async () => {
    console.log('📝 Reader submit button clicked');
    const errors = validateReaderForm(formData);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }
    await handleReaderRegistration(formData, router, setIsLoading);
  };

  const handlePublisherSubmit = async () => {
    console.log('🏢 Publisher submit button clicked');
    const errors = validatePublisherForm(formData);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }
    await handlePublisherRegistration(formData, router, setIsLoading);
  };

  const handleModalClose = () => {
    console.log('❌ Closing Google sign-up modal');
    setShowFormModal(false);
    setGoogleUserData(null);
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-2/5 bg-gradient-to-br bg-[#329ae1] text-white p-6 md:p-8 flex flex-col justify-center">
              <div className="text-center mb-8">
                <div className="bg-white/20 p-4 rounded-full inline-block mb-4">
                  <img 
                    src="/Presspass.png"
                    alt="News Icon" 
                    className="w-12 h-12"
                  />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">MediaHub</h1>
                <p className="text-blue-100">Publishing Platform</p>
              </div>
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-lg mr-4">
                    <i className="fas fa-check text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Reach Millions</h3>
                    <p className="text-blue-100 text-sm">Access our global audience of readers</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-lg mr-4">
                    <i className="fas fa-chart-line text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Analytics Dashboard</h3>
                    <p className="text-blue-100 text-sm">Track your publication performance</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-lg mr-4">
                    <i className="fas fa-mobile-alt text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Multi-Platform</h3>
                    <p className="text-blue-100 text-sm">Publish to web, mobile, and tablets</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:w-3/5 p-5 md:p-8">
              <div className="flex mb-5 md:mb-8 bg-blue-100 rounded-lg p-1">
                <button 
                  onClick={() => { setIsPublisher(false); setFormData(prev => ({ ...prev, role: 'reader' })); }} 
                  className={`flex-1 py-2 px-4 rounded-md text-center font-medium transition text-sm md:text-base ${
                    !isPublisher ? 'bg-[#329ae1] text-white' : 'text-black-600'
                  }`}
                >
                  News Reader Registration
                </button>
                <button 
                  onClick={() => { setIsPublisher(true); setFormData(prev => ({ ...prev, role: 'publisher' })); }} 
                  className={`hidden md:block flex-1 py-2 px-4 rounded-md text-center font-medium transition text-sm md:text-base ${
                    isPublisher ? 'bg-[#329ae1] text-white' : 'text-black-600'
                  }`}
                >
                  Print Media Registration
                </button>
              </div>

              {!isPublisher ? (
                <div className="space-y-4 md:space-y-6 bg-blue-50 p-4 md:p-6 rounded-xl">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center">News Reader Registration</h2>
                  
                  {/* Terms Agreement - Moved to top */}
                  <label className="flex items-center bg-white p-4 rounded-lg border">
                    <input 
                      type="checkbox" 
                      name="agreeToTerms" 
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      required 
                      className="mr-3" 
                    />
                    <span className="text-sm">I agree to the Terms of Service and Privacy Policy</span>
                  </label>
                  
                  {/* Google Sign Up Button */}
                  <div className="mb-6">
                    <button
                      type="button"
                      onClick={handleGoogleSignUpButtonClick}
                      disabled={isLoading || !formData.agreeToTerms}
                      className="w-full bg-white text-gray-700 font-semibold py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition duration-300 flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      {isLoading ? 'Signing up...' : 'Sign up with Google'}
                    </button>
                    {!formData.agreeToTerms && (
                      <p className="text-sm text-red-600 mt-2">Please agree to the terms first</p>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-blue-50 text-gray-500">or sign up with email</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-blue-100 border-2 border-dashed border-blue-300 flex items-center justify-center overflow-hidden">
                        {profilePicPreview ? (
                          <img src={profilePicPreview} className="w-full h-full object-cover" alt="Profile preview" />
                        ) : (
                          <i className="fas fa-user text-3xl text-blue-400"></i>
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer hover:bg-blue-600">
                        <i className="fas fa-camera text-white text-sm"></i>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    </div>
                    <p className="text-sm text-blue-600 mt-2">Upload profile picture</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required 
                      placeholder="First Name" 
                      className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white" 
                    />
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required 
                      placeholder="Last Name" 
                      className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white" 
                    />
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required 
                      placeholder="Email Address" 
                      className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="password" 
                      name="password" 
                      value={formData.password}
                      onChange={handleInputChange}
                      required 
                      placeholder="Password" 
                      className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white" 
                    />
                    <input 
                      type="password" 
                      name="confirmPassword" 
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required 
                      placeholder="Confirm Password" 
                      className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white" 
                    />
                  </div>
                  
                  <button 
                    type="button" 
                    onClick={handleReaderSubmit}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r bg-[#329ae1] text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  >
                    {isLoading ? 'Registering...' : 'Register as News Reader'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 md:space-y-6 bg-blue-50 p-4 md:p-6 rounded-xl">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center">Print Media Registration</h2>
                  
                  {/* Terms Agreement - Moved to top */}
                  <label className="flex items-center bg-white p-4 rounded-lg border">
                    <input 
                      type="checkbox" 
                      name="agreeToTerms" 
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      required 
                      className="mr-3" 
                    />
                    <span className="text-sm">I agree to the Terms of Service and Privacy Policy</span>
                  </label>
                  
                  {/* Google Sign Up Button */}
                  <div className="mb-6">
                    <button
                      type="button"
                      onClick={handleGoogleSignUpButtonClick}
                      disabled={isLoading || !formData.agreeToTerms}
                      className="w-full bg-white text-gray-700 font-semibold py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition duration-300 flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      {isLoading ? 'Signing up...' : 'Sign up with Google'}
                    </button>
                    {!formData.agreeToTerms && (
                      <p className="text-sm text-red-600 mt-2">Please agree to the terms first</p>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-blue-50 text-gray-500">or sign up with email</span>
                    </div>
                  </div>
                  
                  {/* Company Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-black-800 mb-4 flex items-center">
                      <i className="fas fa-building text-blue-600 mr-2"></i>Company Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        required 
                        placeholder="Company Name" 
                        className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white" 
                      />
                      <select 
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        required 
                        className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                      >
                        <option value="">Select Industry</option>
                        <option value="news">News & Journalism</option>
                        <option value="magazine">Magazine</option>
                        <option value="academic">Academic Publishing</option>
                        <option value="trade">Trade Publications</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <input 
                      type="url" 
                      name="companyWebsite"
                      value={formData.companyWebsite}
                      onChange={handleInputChange}
                      placeholder="Company Website" 
                      className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white mt-4" 
                    />
                  </div>
                  
                  {/* Contact Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-black-800 mb-4 flex items-center">
                      <i className="fas fa-user-tie text-blue-600 mr-2"></i>Primary Contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        required 
                        placeholder="Full Name" 
                        className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white" 
                      />
                      <input 
                        type="text" 
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        required 
                        placeholder="Job Title" 
                        className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white" 
                      />
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required 
                        placeholder="Email Address" 
                        className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white" 
                      />
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Phone Number" 
                        className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white" 
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <input 
                        type="password" 
                        name="password" 
                        value={formData.password}
                        onChange={handleInputChange}
                        required 
                        placeholder="Password" 
                        className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white" 
                      />
                      <input 
                        type="password" 
                        name="confirmPassword" 
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required 
                        placeholder="Confirm Password" 
                        className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white" 
                      />
                    </div>
                  </div>
                  
                  {/* Publication Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-black-800 mb-4 flex items-center">
                      <i className="fas fa-book-open text-blue-600 mr-2"></i>Publication Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <select 
                        name="publicationType"
                        value={formData.publicationType}
                        onChange={handleInputChange}
                        required 
                        className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                      >
                        <option value="">Select Type</option>
                        <option value="daily">Daily Newspaper</option>
                        <option value="weekly">Weekly Magazine</option>
                        <option value="monthly">Monthly Publication</option>
                        <option value="quarterly">Quarterly Journal</option>
                        <option value="digital">Digital Only</option>
                      </select>
                      <select 
                        name="audienceType"
                        value={formData.audienceType}
                        onChange={handleInputChange}
                        required 
                        className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                      >
                        <option value="">Select Audience</option>
                        <option value="general">General Public</option>
                        <option value="business">Business Professionals</option>
                        <option value="academic">Academic/Researchers</option>
                        <option value="youth">Youth/Students</option>
                        <option value="specialized">Specialized Interest</option>
                      </select>
                    </div>
                    <input 
                      type="number" 
                      name="monthlyReadership"
                      value={formData.monthlyReadership}
                      onChange={handleInputChange}
                      placeholder="Average Monthly Readership" 
                      className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white mt-4" 
                    />
                  </div>
                  
                  <button 
                    type="button" 
                    onClick={handlePublisherSubmit}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r bg-[#329ae1] text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  >
                    {isLoading ? 'Registering...' : 'Register as Print Media'}
                  </button>
                </div>
              )}

              <div className="mt-6 text-center text-sm text-gray-700">
                <p>
                  Already have an account?{' '}
                  <a href="/signin" className="text-blue-600 font-medium hover:underline">
                    Sign in here
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hidden container for Google Sign-In button */}
        <div id="google-signin-button" style={{ display: 'none' }}></div>
      </div>

      {/* Google Sign-Up Modal */}
      <GoogleSignUpModal
        isOpen={showFormModal}
        onClose={handleModalClose}
        googleUserData={googleUserData}
        setIsLoading={setIsLoading}
        isLoading={isLoading}
      />
    </>
  );
};

export default MediaHubRegistration;