'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
const isValidEmail = (email) => EMAIL_REGEX.test(email.trim());

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

const defaultReaderErrors = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: '',
};

const defaultPublisherErrors = {
  companyName: '',
  industry: '',
  contactName: '',
  jobTitle: '',
  email: '',
  password: '',
  confirmPassword: '',
  publicationType: '',
  audienceType: '',
  agreeToTerms: '',
};

const MediaHubRegistration = () => {
  // FIX 1: Read the role from URL search params (?role=reader or ?role=publisher)
  const searchParams = useSearchParams();
  const lockedRole = searchParams.get('role'); // "reader" | "publisher" | null

  // FIX 1: Initialize the tab based on lockedRole
  const [isPublisher, setIsPublisher] = useState(lockedRole === 'publisher');

  const [profilePicPreview, setProfilePicPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [readerFormData, setReaderFormData] = useState(defaultReaderForm);
  const [publisherFormData, setPublisherFormData] = useState(defaultPublisherForm);

  const [readerErrors, setReaderErrors] = useState(defaultReaderErrors);
  const [publisherErrors, setPublisherErrors] = useState(defaultPublisherErrors);

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
    setReaderErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleReaderEmailBlur = () => {
    if (readerFormData.email && !isValidEmail(readerFormData.email)) {
      setReaderErrors((prev) => ({ ...prev, email: 'Invalid email format (e.g. name@example.com)' }));
    } else {
      setReaderErrors((prev) => ({ ...prev, email: '' }));
    }
  };

  // ── Handlers: publisher form ────────────────────────────────────────────────
  const handlePublisherInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPublisherFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setPublisherErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handlePublisherEmailBlur = () => {
    if (publisherFormData.email && !isValidEmail(publisherFormData.email)) {
      setPublisherErrors((prev) => ({ ...prev, email: 'Invalid email format (e.g. name@example.com)' }));
    } else {
      setPublisherErrors((prev) => ({ ...prev, email: '' }));
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

  // ── Inline validation: reader ───────────────────────────────────────────────
  const validateReaderInline = () => {
    const errs = { ...defaultReaderErrors };
    let valid = true;

    if (!readerFormData.agreeToTerms) {
      errs.agreeToTerms = 'You must agree to the Terms of Service and Privacy Policy.';
      valid = false;
    }
    if (!readerFormData.firstName.trim()) {
      errs.firstName = 'First name is required.';
      valid = false;
    }
    if (!readerFormData.lastName.trim()) {
      errs.lastName = 'Last name is required.';
      valid = false;
    }
    if (!readerFormData.email.trim()) {
      errs.email = 'Email address is required.';
      valid = false;
    } else if (!isValidEmail(readerFormData.email)) {
      errs.email = 'Invalid email format (e.g. name@example.com)';
      valid = false;
    }
    if (!readerFormData.password) {
      errs.password = 'Password is required.';
      valid = false;
    } else if (readerFormData.password.length < 8 || !/[A-Z]/.test(readerFormData.password) || !/[0-9]/.test(readerFormData.password)) {
      errs.password = 'Password must be 8+ characters with an uppercase letter and a number.';
      valid = false;
    }
    if (!readerFormData.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password.';
      valid = false;
    } else if (readerFormData.password !== readerFormData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
      valid = false;
    }

    setReaderErrors(errs);
    return valid;
  };

  // ── Inline validation: publisher ────────────────────────────────────────────
  const validatePublisherInline = () => {
    const errs = { ...defaultPublisherErrors };
    let valid = true;

    if (!publisherFormData.agreeToTerms) {
      errs.agreeToTerms = 'You must agree to the Terms of Service and Privacy Policy.';
      valid = false;
    }
    if (!publisherFormData.companyName.trim()) {
      errs.companyName = 'Company name is required.';
      valid = false;
    }
    if (!publisherFormData.industry) {
      errs.industry = 'Please select an industry.';
      valid = false;
    }
    if (!publisherFormData.contactName.trim()) {
      errs.contactName = 'Contact name is required.';
      valid = false;
    }
    if (!publisherFormData.jobTitle.trim()) {
      errs.jobTitle = 'Job title is required.';
      valid = false;
    }
    if (!publisherFormData.email.trim()) {
      errs.email = 'Email address is required.';
      valid = false;
    } else if (!isValidEmail(publisherFormData.email)) {
      errs.email = 'Invalid email format (e.g. name@example.com)';
      valid = false;
    }
    if (!publisherFormData.password) {
      errs.password = 'Password is required.';
      valid = false;
    } else if (publisherFormData.password.length < 8 || !/[A-Z]/.test(publisherFormData.password) || !/[0-9]/.test(publisherFormData.password)) {
      errs.password = 'Password must be 8+ characters with an uppercase letter and a number.';
      valid = false;
    }
    if (!publisherFormData.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password.';
      valid = false;
    } else if (publisherFormData.password !== publisherFormData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
      valid = false;
    }
    if (!publisherFormData.publicationType) {
      errs.publicationType = 'Please select a publication type.';
      valid = false;
    }
    if (!publisherFormData.audienceType) {
      errs.audienceType = 'Please select an audience type.';
      valid = false;
    }

    setPublisherErrors(errs);
    return valid;
  };

  // ── Submit handlers ─────────────────────────────────────────────────────────
  const handleReaderSubmit = async () => {
    if (!validateReaderInline()) return;
    await handleReaderRegistration(readerFormData, router, setIsLoading);
  };

  const handlePublisherSubmit = async () => {
    if (!validatePublisherInline()) return;
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

  // ── Enforce reader-only on mobile (unless lockedRole is publisher) ──────────
  useEffect(() => {
    const enforceMobileRole = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        // Only force reader on mobile if the role is NOT locked to publisher
        if (lockedRole !== 'publisher') {
          setIsPublisher(false);
        }
      }
    };
    enforceMobileRole();
    window.addEventListener('resize', enforceMobileRole);
    return () => window.removeEventListener('resize', enforceMobileRole);
  }, [lockedRole]);

  // ── Shared input class helper ───────────────────────────────────────────────
  const inputClass = (hasError = false) =>
    `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white ${
      hasError ? 'border-red-500 bg-red-50' : 'border-blue-200'
    }`;

  // ── Reusable inline error message ───────────────────────────────────────────
  const FieldError = ({ msg, id }) =>
    msg ? (
      <p id={id} className="text-red-600 text-xs mt-1 flex items-center gap-1">
        <i className="fas fa-exclamation-circle" /> {msg}
      </p>
    ) : null;

  // ── FIX 1: Tab switcher handler — no-op when role is locked ────────────────
  const handleTabSwitch = (targetIsPublisher) => {
    // If a role is locked via URL param, do nothing
    if (lockedRole) return;
    setIsPublisher(targetIsPublisher);
  };

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
                  { icon: 'fa-check',      title: 'Reach Millions',      sub: 'Access our global audience of readers' },
                  { icon: 'fa-chart-line', title: 'Analytics Dashboard', sub: 'Track your publication performance' },
                  { icon: 'fa-mobile-alt', title: 'Multi-Platform',      sub: 'Publish to web, mobile, and tablets' },
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

              {/* FIX 1: Tab switcher — disabled and visually locked when lockedRole is set */}
              <div className="flex mb-5 md:mb-8 bg-blue-100 rounded-lg p-1">
                <button
                  onClick={() => handleTabSwitch(false)}
                  // Disabled only when locked to publisher role
                  disabled={lockedRole === 'publisher'}
                  title={lockedRole === 'publisher' ? 'You arrived here as a publisher' : ''}
                  className={`flex-1 py-2 px-4 rounded-md text-center font-medium transition text-sm md:text-base
                    ${!isPublisher ? 'bg-[#329ae1] text-white' : 'text-gray-600'}
                    ${lockedRole === 'publisher' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  `}
                >
                  News Reader Registration
                </button>

                <button
                  onClick={() => handleTabSwitch(true)}
                  // Disabled only when locked to reader role; also hidden on mobile unless locked to publisher
                  disabled={lockedRole === 'reader'}
                  title={lockedRole === 'reader' ? 'You arrived here as a news reader' : ''}
                  className={`
                    flex-1 py-2 px-4 rounded-md text-center font-medium transition text-sm md:text-base
                    ${isPublisher ? 'bg-[#329ae1] text-white' : 'text-gray-600'}
                    ${lockedRole === 'reader' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                    ${lockedRole === 'publisher' ? 'block' : 'hidden md:block'}
                  `}
                >
                  Print Media Registration
                </button>
              </div>

              {/* ════════════════ READER FORM ════════════════ */}
              {!isPublisher ? (
                <div className="space-y-4 md:space-y-6 bg-blue-50 p-4 md:p-6 rounded-xl">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center">News Reader Registration</h2>

                  <div>
                    <label className={`flex items-center bg-white p-4 rounded-lg border ${readerErrors.agreeToTerms ? 'border-red-500' : 'border-gray-200'}`}>
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={readerFormData.agreeToTerms}
                        onChange={handleReaderInputChange}
                        className="mr-3"
                      />
                      <span className="text-sm">
                        I agree to the
                        <a href="/terms" target="_blank" className="text-blue-600 underline ml-1">Terms of Service</a> and
                        <a href="/privacy" target="_blank" className="text-blue-600 underline ml-1">Privacy Policy</a>.
                      </span>
                    </label>
                    <FieldError msg={readerErrors.agreeToTerms} id="reader-terms-error" />
                  </div>

                  <div className="mb-6">
                    <div
                      id="google-signin-button"
                      className={`flex justify-center ${(!readerFormData.agreeToTerms || isLoading) ? 'opacity-50 pointer-events-none' : ''}`}
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
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
                          : <i className="fas fa-user text-3xl text-blue-400" />}
                      </div>
                      <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer hover:bg-blue-600">
                        <i className="fas fa-camera text-white text-sm" />
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    </div>
                    <p className="text-sm text-blue-600 mt-2">Upload profile picture</p>
                  </div>

                  {/* Name + email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        name="firstName"
                        value={readerFormData.firstName}
                        onChange={handleReaderInputChange}
                        placeholder="First Name"
                        className={inputClass(!!readerErrors.firstName)}
                        aria-describedby="reader-firstname-error"
                      />
                      <FieldError msg={readerErrors.firstName} id="reader-firstname-error" />
                    </div>

                    <div>
                      <input
                        type="text"
                        name="lastName"
                        value={readerFormData.lastName}
                        onChange={handleReaderInputChange}
                        placeholder="Last Name"
                        className={inputClass(!!readerErrors.lastName)}
                        aria-describedby="reader-lastname-error"
                      />
                      <FieldError msg={readerErrors.lastName} id="reader-lastname-error" />
                    </div>

                    <div className="md:col-span-2">
                      <input
                        type="email"
                        name="email"
                        value={readerFormData.email}
                        onChange={handleReaderInputChange}
                        onBlur={handleReaderEmailBlur}
                        placeholder="Email Address"
                        className={inputClass(!!readerErrors.email)}
                        aria-invalid={!!readerErrors.email}
                        aria-describedby="reader-email-error"
                      />
                      <FieldError msg={readerErrors.email} id="reader-email-error" />
                    </div>
                  </div>

                  {/* Passwords */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={readerFormData.password}
                          onChange={handleReaderInputChange}
                          placeholder="Password"
                          className={`${inputClass(!!readerErrors.password)} pr-12`}
                          aria-describedby="reader-password-error"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      <FieldError msg={readerErrors.password} id="reader-password-error" />
                    </div>

                    <div>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={readerFormData.confirmPassword}
                          onChange={handleReaderInputChange}
                          placeholder="Confirm Password"
                          className={`${inputClass(!!readerErrors.confirmPassword)} pr-12`}
                          aria-describedby="reader-confirm-error"
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700" aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}>
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      <FieldError msg={readerErrors.confirmPassword} id="reader-confirm-error" />
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
                    disabled={isLoading || !readerFormData.agreeToTerms}
                    title={!readerFormData.agreeToTerms ? 'Please agree to the Terms of Service first' : ''}
                    className="w-full bg-[#329ae1] text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  >
                    {isLoading ? 'Registering...' : 'Register as News Reader'}
                  </button>
                </div>

              ) : (
                /* ════════════════ PUBLISHER FORM ════════════════ */
                <div className="space-y-4 md:space-y-6 bg-blue-50 p-4 md:p-6 rounded-xl max-h-[70vh] overflow-y-auto">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center">Print Media Registration</h2>

                  <div>
                    <label className={`flex items-center bg-white p-4 rounded-lg border ${publisherErrors.agreeToTerms ? 'border-red-500' : 'border-gray-200'}`}>
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={publisherFormData.agreeToTerms}
                        onChange={handlePublisherInputChange}
                        className="mr-3"
                      />
                      <span className="text-sm">I agree to the Terms of Service and Privacy Policy</span>
                    </label>
                    <FieldError msg={publisherErrors.agreeToTerms} id="publisher-terms-error" />
                  </div>

                  <div className="mb-6">
                    <div
                      id="google-signin-button-publisher"
                      className={`flex justify-center ${(!publisherFormData.agreeToTerms || isLoading) ? 'opacity-50 pointer-events-none' : ''}`}
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-blue-50 text-gray-500">or sign up with email</span>
                    </div>
                  </div>

                  {/* Company Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-black-800 mb-4 flex items-center">
                      <i className="fas fa-building text-blue-600 mr-2" />Company Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          name="companyName"
                          value={publisherFormData.companyName}
                          onChange={handlePublisherInputChange}
                          placeholder="Company Name"
                          className={inputClass(!!publisherErrors.companyName)}
                          aria-describedby="pub-company-error"
                        />
                        <FieldError msg={publisherErrors.companyName} id="pub-company-error" />
                      </div>

                      <div>
                        <select
                          name="industry"
                          value={publisherFormData.industry}
                          onChange={handlePublisherInputChange}
                          className={`${inputClass(!!publisherErrors.industry)} min-w-0 truncate`}
                          style={{ textOverflow: 'ellipsis' }}
                          aria-describedby="pub-industry-error"
                        >
                          <option value="" disabled hidden>Select Industry</option>
                          <option value="news">News &amp; Journalism</option>
                          <option value="magazine">Magazine</option>
                          <option value="academic">Academic Publishing</option>
                          <option value="trade">Trade Publications</option>
                          <option value="other">Other</option>
                        </select>
                        <FieldError msg={publisherErrors.industry} id="pub-industry-error" />
                      </div>
                    </div>
                    <input
                      type="url"
                      name="companyWebsite"
                      value={publisherFormData.companyWebsite}
                      onChange={handlePublisherInputChange}
                      placeholder="Company Website"
                      className={`${inputClass()} mt-4`}
                    />
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-black-800 mb-4 flex items-center">
                      <i className="fas fa-user-tie text-blue-600 mr-2" />Primary Contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          name="contactName"
                          value={publisherFormData.contactName}
                          onChange={handlePublisherInputChange}
                          placeholder="Full Name"
                          className={inputClass(!!publisherErrors.contactName)}
                          aria-describedby="pub-contact-error"
                        />
                        <FieldError msg={publisherErrors.contactName} id="pub-contact-error" />
                      </div>

                      <div>
                        <input
                          type="text"
                          name="jobTitle"
                          value={publisherFormData.jobTitle}
                          onChange={handlePublisherInputChange}
                          placeholder="Job Title"
                          className={inputClass(!!publisherErrors.jobTitle)}
                          aria-describedby="pub-jobtitle-error"
                        />
                        <FieldError msg={publisherErrors.jobTitle} id="pub-jobtitle-error" />
                      </div>

                      <div className="md:col-span-2">
                        <input
                          type="email"
                          name="email"
                          value={publisherFormData.email}
                          onChange={handlePublisherInputChange}
                          onBlur={handlePublisherEmailBlur}
                          placeholder="Email Address"
                          className={inputClass(!!publisherErrors.email)}
                          aria-invalid={!!publisherErrors.email}
                          aria-describedby="pub-email-error"
                        />
                        <FieldError msg={publisherErrors.email} id="pub-email-error" />
                      </div>

                      <input
                        type="tel"
                        name="phone"
                        value={publisherFormData.phone}
                        onChange={handlePublisherInputChange}
                        placeholder="Phone Number"
                        className={inputClass()}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={publisherFormData.password}
                            onChange={handlePublisherInputChange}
                            placeholder="Password"
                            className={`${inputClass(!!publisherErrors.password)} pr-12`}
                            aria-describedby="pub-password-error"
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        <FieldError msg={publisherErrors.password} id="pub-password-error" />
                      </div>

                      <div>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={publisherFormData.confirmPassword}
                            onChange={handlePublisherInputChange}
                            placeholder="Confirm Password"
                            className={`${inputClass(!!publisherErrors.confirmPassword)} pr-12`}
                            aria-describedby="pub-confirm-error"
                          />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        <FieldError msg={publisherErrors.confirmPassword} id="pub-confirm-error" />
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
                      <i className="fas fa-book-open text-blue-600 mr-2" />Publication Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <select
                          name="publicationType"
                          value={publisherFormData.publicationType}
                          onChange={handlePublisherInputChange}
                          className={`${inputClass(!!publisherErrors.publicationType)} min-w-0`}
                          style={{ textOverflow: 'ellipsis' }}
                          aria-describedby="pub-pubtype-error"
                        >
                          <option value="" disabled hidden>Select Type</option>
                          <option value="daily">Daily Newspaper</option>
                          <option value="weekly">Weekly Magazine</option>
                          <option value="monthly">Monthly Publication</option>
                          <option value="quarterly">Quarterly Journal</option>
                          <option value="digital">Digital Only</option>
                        </select>
                        <FieldError msg={publisherErrors.publicationType} id="pub-pubtype-error" />
                      </div>

                      <div>
                        <select
                          name="audienceType"
                          value={publisherFormData.audienceType}
                          onChange={handlePublisherInputChange}
                          className={`${inputClass(!!publisherErrors.audienceType)} min-w-0`}
                          style={{ textOverflow: 'ellipsis' }}
                          aria-describedby="pub-audience-error"
                        >
                          <option value="" disabled hidden>Select Audience</option>
                          <option value="general">General Public</option>
                          <option value="business">Business Professionals</option>
                          <option value="academic">Academic/Researchers</option>
                          <option value="youth">Youth/Students</option>
                          <option value="specialized">Specialized Interest</option>
                        </select>
                        <FieldError msg={publisherErrors.audienceType} id="pub-audience-error" />
                      </div>
                    </div>
                    <input
                      type="number"
                      name="monthlyReadership"
                      value={publisherFormData.monthlyReadership}
                      onChange={handlePublisherInputChange}
                      placeholder="Average Monthly Readership"
                      className={`${inputClass()} mt-4`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handlePublisherSubmit}
                    disabled={isLoading || !publisherFormData.agreeToTerms}
                    title={!publisherFormData.agreeToTerms ? 'Please agree to the Terms of Service first' : ''}
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
        <Link
          href={lockedRole === 'publisher' ? '/print-media' : '/'}
          className="bg-[#3ba6e7] text-white px-4 py-2 rounded-md shadow-sm hover:bg-[#2a7ab8] transition-colors duration-200 mb-8 flex items-center text-sm"
        >
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