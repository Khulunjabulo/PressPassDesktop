import React, { useState } from 'react';
import { completeGoogleSignUp } from '../lib/authLogic';
import { useRouter } from 'next/navigation';

const GoogleSignUpModal = ({ 
  isOpen, 
  onClose, 
  googleUserData, 
  setIsLoading, 
  isLoading 
}) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({
    firstName: googleUserData?.name?.split(' ')[0] || '',
    lastName: googleUserData?.name?.split(' ').slice(1).join(' ') || '',
    email: googleUserData?.email || '',
    agreeToTerms: false,
    
    // Reader specific
    profilePic: null,
    
    // Publisher specific
    companyName: '',
    industry: '',
    companyWebsite: '',
    contactName: googleUserData?.name || '',
    jobTitle: '',
    phone: '',
    publicationType: '',
    audienceType: '',
    monthlyReadership: '',
  });
  const [profilePicPreview, setProfilePicPreview] = useState(googleUserData?.picture || '');
  
  const router = useRouter();

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    (`📝 Input change: ${name} = ${type === 'checkbox' ? checked : value}`);
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    ('🖼️ Image selected:', file?.name);
    
    if (file) {
      setFormData(prev => ({ ...prev, profilePic: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
        ('👀 Profile pic preview updated');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    ('🚀 Submitting Google sign-up form');
    
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }

    if (!formData.agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    const completeFormData = {
      ...formData,
      role: selectedRole
    };

    ('📋 Complete form data:', completeFormData);
    
    try {
      await completeGoogleSignUp(
        googleUserData, 
        completeFormData, 
        profilePicPreview, 
        router, 
        setIsLoading
      );
      onClose();
    } catch (error) {
      console.error('❌ Form submission error:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Complete Your Registration</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Google User Info Display */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-center">
              <img 
                src={googleUserData?.picture} 
                alt="Profile" 
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <p className="font-semibold">{googleUserData?.name}</p>
                <p className="text-sm text-gray-600">{googleUserData?.email}</p>
              </div>
            </div>

            {/* Role Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Choose Your Role</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                  selectedRole === 'reader' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="reader"
                    checked={selectedRole === 'reader'}
                    onChange={() => setSelectedRole('reader')}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <i className="fas fa-newspaper text-2xl text-blue-500 mb-2"></i>
                    <h4 className="font-semibold">News Reader</h4>
                    <p className="text-sm text-gray-600">Read and discover news content</p>
                  </div>
                </label>

                <label className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                  selectedRole === 'publisher' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="publisher"
                    checked={selectedRole === 'publisher'}
                    onChange={() => setSelectedRole('publisher')}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <i className="fas fa-building text-2xl text-blue-500 mb-2"></i>
                    <h4 className="font-semibold">Print Media</h4>
                    <p className="text-sm text-gray-600">Publish and manage content</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Role-specific forms */}
            {selectedRole === 'reader' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">Reader Information</h4>
                
                {/* Profile Picture */}
                <div className="flex justify-center">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            )}

            {selectedRole === 'publisher' && (
              <div className="space-y-6">
                <h4 className="font-semibold text-gray-800">Publisher Information</h4>
                
                {/* Company Info */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <i className="fas fa-building text-blue-500 mr-2"></i>Company Information
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Company Name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-4"
                  />
                </div>

                {/* Contact Info */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <i className="fas fa-user-tie text-blue-500 mr-2"></i>Contact Information
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      placeholder="Full Name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      placeholder="Job Title"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone Number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Publication Details */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <i className="fas fa-book-open text-blue-500 mr-2"></i>Publication Details
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      name="publicationType"
                      value={formData.publicationType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-4"
                  />
                </div>
              </div>
            )}

            {/* Terms and Submit */}
            <div className="mt-6 space-y-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mr-2 mt-1"
                  required
                />
                <span className="text-sm text-gray-600">
                  I agree to the Terms of Service and Privacy Policy
                </span>
              </label>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !selectedRole || !formData.agreeToTerms}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Completing Registration...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GoogleSignUpModal;