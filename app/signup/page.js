'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import "../globals.css";
import GoogleSignUpModal from '@/components/GoogleSignUpModal';
import {
  initializeGoogleSignIn,
  handleGoogleSignUp,
  handleReaderRegistration,
  handlePublisherRegistration,
  validateReaderForm,
  validatePublisherForm
} from '../../lib/authLogic';
import Link from 'next/link';

const MediaHubRegistration = () => {
  const [isPublisher, setIsPublisher] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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

  // Initialize Google Sign-In
  useEffect(() => {
    const handleGoogleCallback = (response) => {
      console.log('📞 Google callback received in signup page');
      handleGoogleSignUp(response, setIsLoading, setShowFormModal, setGoogleUserData);
    };

    initializeGoogleSignIn(handleGoogleCallback);

    // Render Google Sign-In buttons after initialization
    const timer = setTimeout(() => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        // Render button for reader section
        const readerButton = document.getElementById('google-signin-button');
        if (readerButton) {
          window.google.accounts.id.renderButton(
            readerButton,
            {
              theme: 'outline',
              size: 'large',
              width: 400,
              text: 'signup_with',
              shape: 'rectangular'
            }
          );
          console.log('✅ Reader Google button rendered');
        }

        // Render button for publisher section
        const publisherButton = document.getElementById('google-signin-button-publisher');
        if (publisherButton) {
          window.google.accounts.id.renderButton(
            publisherButton,
            {
              theme: 'outline',
              size: 'large',
              width: 400,
              text: 'signup_with',
              shape: 'rectangular'
            }
          );
          console.log('✅ Publisher Google button rendered');
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
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

    setFormData((prev) => ({
      ...prev,
      profilePic: file
    }));

    const reader = new FileReader();
    reader.onloadend = () => {
      console.log('🎨 FileReader finished loading image');
      setProfilePicPreview(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    } else {
      setProfilePicPreview('');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(`📝 Input change: ${name}`);

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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
                  
                  {/* Terms Agreement */}
                  <label className="flex items-center bg-white p-4 rounded-lg border">
                    <input 
                      type="checkbox" 
                      name="agreeToTerms" 
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      required 
                      className="mr-3" 
                    />
                    <span className="text-sm">
                      I agree to the 
                      <a href="/terms" target="_blank" className="text-blue-600 underline ml-1">
                        Terms of Service
                      </a> and 
                      <a href="/privacy" target="_blank" className="text-blue-600 underline ml-1">
                        Privacy Policy
                      </a>.
                    </span>
                  </label>
                  
                  {/* Google Sign Up Button */}
                  <div className="mb-6">
                    <div
                      id="google-signin-button"
                      className={`flex justify-center ${(!formData.agreeToTerms || isLoading) ? 'opacity-50 pointer-events-none' : ''}`}
                    ></div>
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
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        name="password" 
                        value={formData.password}
                        onChange={handleInputChange}
                        required 
                        placeholder="Password" 
                        className="w-full px-4 py-2 pr-12 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword" 
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required 
                        placeholder="Confirm Password" 
                        className="w-full px-4 py-2 pr-12 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 bg-white p-3 rounded-lg">
                    <p className="font-semibold mb-1">Password must contain:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>At least 8 characters</li>
                      <li>At least one uppercase letter</li>
                      <li>At least one number</li>
                    </ul>
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
                <div className="space-y-4 md:space-y-6 bg-blue-50 p-4 md:p-6 rounded-xl max-h-[70vh] overflow-y-auto">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center">Print Media Registration</h2>
                  
                  {/* Terms Agreement */}
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
                    <div
                      id="google-signin-button-publisher"
                      className={`flex justify-center ${(!formData.agreeToTerms || isLoading) ? 'opacity-50 pointer-events-none' : ''}`}
                    ></div>
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
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"}
                          name="password" 
                          value={formData.password}
                          onChange={handleInputChange}
                          required 
                          placeholder="Password" 
                          className="w-full px-4 py-2 pr-12 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white" 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      <div className="relative">
                        <input 
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword" 
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required 
                          placeholder="Confirm Password" 
                          className="w-full px-4 py-2 pr-12 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white" 
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-gray-600 bg-white p-3 rounded-lg mt-4">
                      <p className="font-semibold mb-1">Password must contain:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>At least 8 characters</li>
                        <li>At least one uppercase letter</li>
                        <li>At least one number</li>
                      </ul>
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
      </div>

      <div className="absolute top-4 left-4">
        <Link href="/" className="bg-[#3ba6e7] text-white px-4 py-2 rounded-md shadow-sm hover:bg-[#2a7ab8] transition-colors duration-200 mb-8 flex items-center text-sm">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>
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