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

// ─── Robust email validator ───────────────────────────────────────────────────
// Rejects: abc@.com  |  abc@com  |  @domain.com  |  user@domain.  |  user@-bad.com
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

const isValidEmail = (email) => EMAIL_REGEX.test(email.trim());

// ─── Default form shapes ──────────────────────────────────────────────────────
const defaultReaderForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  profilePic: null,
  agreeToTerms: false,
  role: 'reader',
};

const defaultPublisherForm = {
  companyName: '',
  industry: '',
  companyWebsite: '',
  contactName: '',
  jobTitle: '',
  phone: '',
  publicationType: '',
  audienceType: '',
  monthlyReadership: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false,
  role: 'publisher',
};

const MediaHubRegistration = () => {
  const [isPublisher, setIsPublisher] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── FIX 1: Two completely separate form states ──────────────────────────────
  const [readerFormData, setReaderFormData] = useState(defaultReaderForm);
  const [publisherFormData, setPublisherFormData] = useState(defaultPublisherForm);

  // ── FIX 2: Email error states (one per form) ────────────────────────────────
  const [readerEmailError, setReaderEmailError] = useState('');
  const [publisherEmailError, setPublisherEmailError] = useState('');

  // Google Sign-up modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [googleUserData, setGoogleUserData] = useState(null);

  const router = useRouter();

  // ── Handlers: reader form ───────────────────────────────────────────────────
  const handleReaderInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReaderFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear email error as user types
    if (name === 'email') setReaderEmailError('');
  };

  const handleReaderEmailBlur = () => {
    if (readerFormData.email && !isValidEmail(readerFormData.email)) {
      setReaderEmailError('Invalid email format (e.g. name@example.com)');
    } else {
      setReaderEmailError('');
    }
  };

  // ── Handlers: publisher form ────────────────────────────────────────────────
  const handlePublisherInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPublisherFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (name === 'email') setPublisherEmailError('');
  };

  const handlePublisherEmailBlur = () => {
    if (publisherFormData.email && !isValidEmail(publisherFormData.email)) {
      setPublisherEmailError('Invalid email format (e.g. name@example.com)');
    } else {
      setPublisherEmailError('');
    }
  };

  // ── Profile picture (reader only) ──────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setReaderFormData((prev) => ({ ...prev, profilePic: file }));
    const reader = new FileReader();
    reader.onloadend = () => setProfilePicPreview(reader.result);
    if (file) reader.readAsDataURL(file);
    else setProfilePicPreview('');
  };

  // ── Submit handlers ─────────────────────────────────────────────────────────
  const handleReaderSubmit = async () => {
    // Validate email before delegating to authLogic
    if (!isValidEmail(readerFormData.email)) {
      setReaderEmailError('Invalid email format (e.g. name@example.com)');
      return;
    }
    const errors = validateReaderForm(readerFormData);
    if (errors.length > 0) { alert(errors.join('\n')); return; }
    await handleReaderRegistration(readerFormData, router, setIsLoading);
  };

  const handlePublisherSubmit = async () => {
    if (!isValidEmail(publisherFormData.email)) {
      setPublisherEmailError('Invalid email format (e.g. name@example.com)');
      return;
    }
    const errors = validatePublisherForm(publisherFormData);
    if (errors.length > 0) { alert(errors.join('\n')); return; }
    await handlePublisherRegistration(publisherFormData, router, setIsLoading);
  };

  const handleModalClose = () => {
    setShowFormModal(false);
    setGoogleUserData(null);
  };

  // ── Google Sign-In ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handleGoogleCallback = (response) => {
      handleGoogleSignUp(response, setIsLoading, setShowFormModal, setGoogleUserData);
    };
    initializeGoogleSignIn(handleGoogleCallback);

    const timer = setTimeout(() => {
      if (window.google?.accounts?.id) {
        const btnConfig = { theme: 'outline', size: 'large', width: 400, text: 'signup_with', shape: 'rectangular' };
        const readerBtn = document.getElementById('google-signin-button');
        if (readerBtn) window.google.accounts.id.renderButton(readerBtn, btnConfig);
        const publisherBtn = document.getElementById('google-signin-button-publisher');
        if (publisherBtn) window.google.accounts.id.renderButton(publisherBtn, btnConfig);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // ── Enforce reader-only on mobile ───────────────────────────────────────────
  useEffect(() => {
    const enforceMobileRole = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setIsPublisher(false);
      }
    };
    enforceMobileRole();
    window.addEventListener('resize', enforceMobileRole);
    return () => window.removeEventListener('resize', enforceMobileRole);
  }, []);

  // ── Shared input class helper ───────────────────────────────────────────────
  const inputClass = (hasError = false) =>
    `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white ${
      hasError ? 'border-red-500 bg-red-50' : 'border-blue-200'
    }`;

  return (
    <>
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row">

            {/* ── Left panel ── */}
            <div className="md:w-2/5 bg-gradient-to-br bg-[#329ae1] text-white p-6 md:p-8 flex flex-col justify-center">
              <div className="text-center mb-8">
                <div className="bg-white/20 p-4 rounded-full inline-block mb-4">
                  <img src="/Presspass.png" alt="News Icon" className="w-12 h-12" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">MediaHub</h1>
                <p className="text-blue-100">Publishing Platform</p>
              </div>
              <div className="space-y-4 md:space-y-6">
                {[
                  { icon: 'fa-check',     title: 'Reach Millions',       sub: 'Access our global audience of readers' },
                  { icon: 'fa-chart-line', title: 'Analytics Dashboard',  sub: 'Track your publication performance' },
                  { icon: 'fa-mobile-alt', title: 'Multi-Platform',       sub: 'Publish to web, mobile, and tablets' },
                ].map(({ icon, title, sub }) => (
                  <div key={title} className="flex items-start">
                    <div className="bg-white/20 p-2 rounded-lg mr-4">
                      <i className={`fas ${icon} text-xl`}></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{title}</h3>
                      <p className="text-blue-100 text-sm">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right panel ── */}
            <div className="md:w-3/5 p-5 md:p-8">
              {/* Tab switcher */}
              <div className="flex mb-5 md:mb-8 bg-blue-100 rounded-lg p-1">
                <button
                  onClick={() => setIsPublisher(false)}
                  className={`flex-1 py-2 px-4 rounded-md text-center font-medium transition text-sm md:text-base ${
                    !isPublisher ? 'bg-[#329ae1] text-white' : 'text-black-600'
                  }`}
                >
                  News Reader Registration
                </button>
                <button
                  onClick={() => setIsPublisher(true)}
                  className={`hidden md:block flex-1 py-2 px-4 rounded-md text-center font-medium transition text-sm md:text-base ${
                    isPublisher ? 'bg-[#329ae1] text-white' : 'text-black-600'
                  }`}
                >
                  Print Media Registration
                </button>
              </div>

              {/* ════════════════ READER FORM ════════════════ */}
              {!isPublisher ? (
                <div className="space-y-4 md:space-y-6 bg-blue-50 p-4 md:p-6 rounded-xl">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center">News Reader Registration</h2>

                  {/* Terms */}
                  <label className="flex items-center bg-white p-4 rounded-lg border">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={readerFormData.agreeToTerms}
                      onChange={handleReaderInputChange}
                      required
                      className="mr-3"
                    />
                    <span className="text-sm">
                      I agree to the
                      <a href="/terms" target="_blank" className="text-blue-600 underline ml-1">Terms of Service</a> and
                      <a href="/privacy" target="_blank" className="text-blue-600 underline ml-1">Privacy Policy</a>.
                    </span>
                  </label>

                  {/* Google button */}
                  <div className="mb-6">
                    <div
                      id="google-signin-button"
                      className={`flex justify-center ${(!readerFormData.agreeToTerms || isLoading) ? 'opacity-50 pointer-events-none' : ''}`}
                    />
                    {!readerFormData.agreeToTerms && (
                      <p className="text-sm text-red-600 mt-2">Please agree to the terms first</p>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"/></div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-blue-50 text-gray-500">or sign up with email</span>
                    </div>
                  </div>

                  {/* Profile picture */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-blue-100 border-2 border-dashed border-blue-300 flex items-center justify-center overflow-hidden">
                        {profilePicPreview
                          ? <img src={profilePicPreview} className="w-full h-full object-cover" alt="Profile preview" />
                          : <i className="fas fa-user text-3xl text-blue-400"/>}
                      </div>
                      <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer hover:bg-blue-600">
                        <i className="fas fa-camera text-white text-sm"/>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    </div>
                    <p className="text-sm text-blue-600 mt-2">Upload profile picture</p>
                  </div>

                  {/* Name + email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="firstName" value={readerFormData.firstName} onChange={handleReaderInputChange} required placeholder="First Name" className={inputClass()} />
                    <input type="text" name="lastName"  value={readerFormData.lastName}  onChange={handleReaderInputChange} required placeholder="Last Name"  className={inputClass()} />

                    {/* ── FIX 2: email with validation ── */}
                    <div className="md:col-span-2">
                      <input
                        type="email"
                        name="email"
                        value={readerFormData.email}
                        onChange={handleReaderInputChange}
                        onBlur={handleReaderEmailBlur}
                        required
                        placeholder="Email Address"
                        className={inputClass(!!readerEmailError)}
                        aria-invalid={!!readerEmailError}
                        aria-describedby="reader-email-error"
                      />
                      {readerEmailError && (
                        <p id="reader-email-error" className="text-red-600 text-xs mt-1 flex items-center gap-1">
                          <i className="fas fa-exclamation-circle"/> {readerEmailError}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Passwords */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} name="password" value={readerFormData.password} onChange={handleReaderInputChange} required placeholder="Password" className={`${inputClass()} pr-12`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                        {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                      </button>
                    </div>
                    <div className="relative">
                      <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={readerFormData.confirmPassword} onChange={handleReaderInputChange} required placeholder="Confirm Password" className={`${inputClass()} pr-12`} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                        {showConfirmPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
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

                  {/* ── FIX 3: disabled until terms checked ── */}
                  <button
                    type="button"
                    onClick={handleReaderSubmit}
                    disabled={isLoading || !readerFormData.agreeToTerms}
                    title={!readerFormData.agreeToTerms ? 'Please agree to the terms first' : ''}
                    className="w-full bg-[#329ae1] text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  >
                    {isLoading ? 'Registering...' : 'Register as News Reader'}
                  </button>
                </div>

              ) : (
              /* ════════════════ PUBLISHER FORM ════════════════ */
                <div className="space-y-4 md:space-y-6 bg-blue-50 p-4 md:p-6 rounded-xl max-h-[70vh] overflow-y-auto">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center">Print Media Registration</h2>

                  {/* Terms */}
                  <label className="flex items-center bg-white p-4 rounded-lg border">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={publisherFormData.agreeToTerms}
                      onChange={handlePublisherInputChange}
                      required
                      className="mr-3"
                    />
                    <span className="text-sm">I agree to the Terms of Service and Privacy Policy</span>
                  </label>

                  {/* Google button */}
                  <div className="mb-6">
                    <div
                      id="google-signin-button-publisher"
                      className={`flex justify-center ${(!publisherFormData.agreeToTerms || isLoading) ? 'opacity-50 pointer-events-none' : ''}`}
                    />
                    {!publisherFormData.agreeToTerms && (
                      <p className="text-sm text-red-600 mt-2">Please agree to the terms first</p>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"/></div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-blue-50 text-gray-500">or sign up with email</span>
                    </div>
                  </div>

                  {/* Company Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-black-800 mb-4 flex items-center">
                      <i className="fas fa-building text-blue-600 mr-2"/>Company Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text" name="companyName" value={publisherFormData.companyName} onChange={handlePublisherInputChange} required placeholder="Company Name" className={inputClass()} />
                      <select name="industry" value={publisherFormData.industry} onChange={handlePublisherInputChange} required className={inputClass()}>
                        <option value="">Select Industry</option>
                        <option value="news">News &amp; Journalism</option>
                        <option value="magazine">Magazine</option>
                        <option value="academic">Academic Publishing</option>
                        <option value="trade">Trade Publications</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <input type="url" name="companyWebsite" value={publisherFormData.companyWebsite} onChange={handlePublisherInputChange} placeholder="Company Website" className={`${inputClass()} mt-4`} />
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-black-800 mb-4 flex items-center">
                      <i className="fas fa-user-tie text-blue-600 mr-2"/>Primary Contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text"  name="contactName" value={publisherFormData.contactName} onChange={handlePublisherInputChange} required placeholder="Full Name"    className={inputClass()} />
                      <input type="text"  name="jobTitle"    value={publisherFormData.jobTitle}    onChange={handlePublisherInputChange} required placeholder="Job Title"    className={inputClass()} />
                      <div className="md:col-span-2">
                        <input
                          type="email"
                          name="email"
                          value={publisherFormData.email}
                          onChange={handlePublisherInputChange}
                          onBlur={handlePublisherEmailBlur}
                          required
                          placeholder="Email Address"
                          className={inputClass(!!publisherEmailError)}
                          aria-invalid={!!publisherEmailError}
                          aria-describedby="publisher-email-error"
                        />
                        {publisherEmailError && (
                          <p id="publisher-email-error" className="text-red-600 text-xs mt-1 flex items-center gap-1">
                            <i className="fas fa-exclamation-circle"/> {publisherEmailError}
                          </p>
                        )}
                      </div>
                      <input type="tel" name="phone" value={publisherFormData.phone} onChange={handlePublisherInputChange} placeholder="Phone Number" className={inputClass()} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} name="password" value={publisherFormData.password} onChange={handlePublisherInputChange} required placeholder="Password" className={`${inputClass()} pr-12`} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                          {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                        </button>
                      </div>
                      <div className="relative">
                        <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={publisherFormData.confirmPassword} onChange={handlePublisherInputChange} required placeholder="Confirm Password" className={`${inputClass()} pr-12`} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                          {showConfirmPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
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
                      <i className="fas fa-book-open text-blue-600 mr-2"/>Publication Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <select name="publicationType" value={publisherFormData.publicationType} onChange={handlePublisherInputChange} required className={inputClass()}>
                        <option value="">Select Type</option>
                        <option value="daily">Daily Newspaper</option>
                        <option value="weekly">Weekly Magazine</option>
                        <option value="monthly">Monthly Publication</option>
                        <option value="quarterly">Quarterly Journal</option>
                        <option value="digital">Digital Only</option>
                      </select>
                      <select name="audienceType" value={publisherFormData.audienceType} onChange={handlePublisherInputChange} required className={inputClass()}>
                        <option value="">Select Audience</option>
                        <option value="general">General Public</option>
                        <option value="business">Business Professionals</option>
                        <option value="academic">Academic/Researchers</option>
                        <option value="youth">Youth/Students</option>
                        <option value="specialized">Specialized Interest</option>
                      </select>
                    </div>
                    <input type="number" name="monthlyReadership" value={publisherFormData.monthlyReadership} onChange={handlePublisherInputChange} placeholder="Average Monthly Readership" className={`${inputClass()} mt-4`} />
                  </div>

                  {/* ── FIX 3: disabled until terms checked ── */}
                  <button
                    type="button"
                    onClick={handlePublisherSubmit}
                    disabled={isLoading || !publisherFormData.agreeToTerms}
                    title={!publisherFormData.agreeToTerms ? 'Please agree to the terms first' : ''}
                    className="w-full bg-[#329ae1] text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  >
                    {isLoading ? 'Registering...' : 'Register as Print Media'}
                  </button>
                </div>
              )}

              <div className="mt-6 text-center text-sm text-gray-700">
                <p>
                  Already have an account?{' '}
                  <a href="/signin" className="text-blue-600 font-medium hover:underline">Sign in here</a>
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