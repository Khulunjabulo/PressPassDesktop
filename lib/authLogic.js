// lib/authLogic.js - COMPLETE UPDATED VERSION
import { getAuth, signInWithCustomToken, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../Firebase/firebase';

const auth = getAuth(app);
const db = getFirestore();

// Password validation function
export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return errors;
};

// Initialize Google Sign-In
export const initializeGoogleSignIn = (callback) => {
  ('🔧 Initializing Google Sign-In...');
  if (!document.getElementById('google-client-script')) {
    ('📜 Adding Google script to page...');
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.id = 'google-client-script';
    script.onload = () => {
      ('✅ Google script loaded successfully');
      if (window.google) {
        ('⚙️ Initializing Google Identity Services...');
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: callback,
        });
        ('✅ Google Sign-In initialized');
      } else {
        console.warn('⚠️ window.google is not available after script load');
      }
    };
    script.onerror = () => {
      console.error('❌ Failed to load Google script');
    };
    document.body.appendChild(script);
  } else {
    ('✅ Google script already exists');
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: callback,
      });
    }
  }
};

// Handle Email Sign-In
export const handleSignIn = async (email, password, role, keepSignedIn, router, setError, setLoading) => {
  ('🔐 Email sign-in started');
  setLoading(true);
  setError('');

  try {
    ('🔍 Validating sign-in data...');
    
    if (!email || !password || !role) {
      setError('Please fill in all required fields');
      return;
    }

    ('📤 Sending sign-in request to API');
    const res = await fetch('/api/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        password,
        role,
        keepSignedIn
      }),
    });

    ('📡 API response status:', res.status);
    const result = await res.json();

    if (!result.success) {
      console.error('❌ Sign-in failed:', result.error);
      setError(result.error || 'Sign-in failed');
      return;
    }

    ('✅ API sign-in successful');

    const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
    const user = userCredential.user;
    ('✅ Firebase Auth sign-in successful');

    if (!user.emailVerified) {
      console.warn('📧 Email not verified. Signing user out.');
      await signOut(auth);
      setError('Please verify your email before signing in. Check your inbox for a verification link.');
      return;
    }

    ('💾 Storing user data in localStorage...');
    
    // 🆕 UPDATED: Store user data with both 'user' and 'currentUser' keys for compatibility
    localStorage.setItem('user', JSON.stringify(result.user));
    localStorage.setItem('currentUser', JSON.stringify(result.user));
    localStorage.setItem('userRole', role);
    localStorage.setItem('keepSignedIn', keepSignedIn.toString());
    
    if (role === 'publisher') {
      const publisherId = result.user.uid;
      localStorage.setItem('currentPublisherId', publisherId);
      ('✅ Publisher ID stored:', publisherId);
    }
    
    ('✅ User data stored:', {
      uid: result.user.uid,
      email: result.user.email,
      role: result.user.role,
      companyName: result.user.companyName
    });

    ('🔄 Redirecting user based on role:', role);
    
    if (role === 'reader') {
      ('📰 Reader sign-in, navigating to /news-reader');
      router.push('/news-reader');
    } else if (role === 'publisher') {
      ('🏢 Publisher sign-in, navigating to /print-media/overview');
      router.push('/print-media/overview');
    }

  } catch (error) {
    console.error('❌ Sign-in error:', {
      code: error.code,
      message: error.message,
      fullError: error,
    });
    setError(error.message || 'Sign-in failed. Please check your credentials and try again.');
  } finally {
    setLoading(false);
    ('✅ Sign-in process ended');
  }
};

// Handle Google Sign-In
export const handleGoogleSignIn = async (router, setError, setLoading, setShowRoleSelector, setAvailableRoles, setPendingGoogleCredential) => {
  ('🔐 Google sign-in initiated');
  setError('');
  
  if (!window.google) {
    setError('Google Sign-In is not available. Please refresh the page.');
    return;
  }

  ('🚀 Launching Google Sign-In prompt...');
  window.google.accounts.id.prompt((notification) => {
    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
      ('⚠️ Google prompt was not displayed or was skipped');
    }
  });
};

// Handle Google Sign-In Callback for Sign-In page
export const handleGoogleSignInCallback = async (response, router, setError, setLoading, setShowRoleSelector, setAvailableRoles, setPendingGoogleCredential) => {
  ('🔐 Google sign-in callback triggered');
  setLoading(true);

  try {
    ('📤 Checking available roles for Google account');
    const checkRes = await fetch('/api/google-signin-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credential: response.credential,
      }),
    });

    ('📡 API response status:', checkRes.status);
    const checkResult = await checkRes.json();

    if (!checkResult.success) {
      console.error('❌ Google sign-in check failed:', checkResult.error);
      setError(checkResult.error || 'Google sign-in failed');
      setLoading(false);
      return;
    }

    if (checkResult.roles && checkResult.roles.length > 1) {
      ('🎭 Multiple roles found, showing selector');
      setAvailableRoles(checkResult.roles);
      setPendingGoogleCredential(response.credential);
      setShowRoleSelector(true);
      setLoading(false);
      return;
    }

    const role = checkResult.roles[0];
    await completeGoogleSignIn(response.credential, role, router, setError, setLoading);

  } catch (error) {
    console.error('❌ Google sign-in error:', error);
    setError('Google sign-in failed. Please try again.');
    setLoading(false);
  }
};

// Complete Google Sign-In with selected role
export const completeGoogleSignIn = async (credential, role, router, setError, setLoading) => {
  ('🔐 Completing Google sign-in with role:', role);
  setLoading(true);

  try {
    const res = await fetch('/api/google-signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credential: credential,
        role,
        keepSignedIn: true
      }),
    });

    ('📡 API response status:', res.status);
    const result = await res.json();

    if (!result.success) {
      console.error('❌ Google sign-in failed:', result.error);
      setError(result.error || 'Google sign-in failed');
      return;
    }

    ('✅ Google sign-in successful');

    if (result.customToken) {
      ('🔐 Signing in with custom token...');
      await signInWithCustomToken(auth, result.customToken);
      ('✅ Firebase Auth session established');
    }

    ('💾 Storing user data in localStorage...');
    
    // 🆕 UPDATED: Store user data with both keys for compatibility
    localStorage.setItem('user', JSON.stringify(result.user));
    localStorage.setItem('currentUser', JSON.stringify(result.user));
    localStorage.setItem('userRole', role);
    localStorage.setItem('keepSignedIn', 'true');
    
    if (role === 'publisher') {
      const publisherId = result.user.uid;
      localStorage.setItem('currentPublisherId', publisherId);
      ('✅ Publisher ID stored:', publisherId);
    }
    
    ('✅ User data stored:', {
      uid: result.user.uid,
      email: result.user.email,
      role: result.user.role
    });

    ('🔄 Redirecting user based on role:', role);
    
    if (role === 'reader') {
      ('📰 Navigating to /news-reader');
      router.push('/news-reader');
    } else if (role === 'publisher') {
      ('🏢 Publisher Google sign-in, navigating to /print-media/overview');
      router.push('/print-media/overview');
    }

  } catch (error) {
    console.error('❌ Google sign-in error:', error);
    setError('Google sign-in failed. Please try again.');
  } finally {
    setLoading(false);
    ('✅ Google sign-in process ended');
  }
};

// Handle Google Sign-Up (First Step - Get Google credential)
export const handleGoogleSignUp = async (response, setIsLoading, setShowFormModal, setGoogleUserData) => {
  ('🔐 Google sign-up callback triggered');
  ('📥 Raw Google response:', response);

  setIsLoading(true);
  try {
    ('🔄 Processing Google sign-up...');

    const res = await fetch('/api/google-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credential: response.credential,
      }),
    });

    ('📡 Request sent to /api/google-signup, status:', res.status);

    const result = await res.json().catch((error) => {
      console.error('❌ Failed to parse response as JSON:', error);
      return null;
    });

    if (!result || !res.ok) {
      console.error('❌ Google sign-up failed:', result?.error || 'Unknown error');
      alert(result?.error || 'Google sign-up failed');
      return;
    }

    ('✅ Google sign-up API success:', result);

    if (result.needsFormCompletion) {
      ('📝 Form completion needed, showing modal...');
      setGoogleUserData({
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.name,
        picture: result.user.picture,
        tempToken: result.tempToken
      });
      setShowFormModal(true);
    } else {
      ('🎉 Registration completed, signing in...');
      if (result.customToken) {
        await signInWithCustomToken(auth, result.customToken);
        ('✅ Signed in with custom token');
      }
      
      // 🆕 UPDATED: Store with both keys
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('currentUser', JSON.stringify(result.user));
    }

  } catch (error) {
    console.error('❌ Google sign-up callback error:', error);
    alert('Google sign-up failed. Please try again.');
  } finally {
    setIsLoading(false);
    ('✅ Google sign-up process ended');
  }
};

// Complete Google Sign-Up with form data
export const completeGoogleSignUp = async (googleUserData, formData, profilePicPreview, router, setIsLoading) => {
  ('📋 Completing Google sign-up with form data...');
  setIsLoading(true);

  try {
    const additionalData = {
      ...formData,
      profilePicture: profilePicPreview || googleUserData.picture
    };

    ('📤 Sending completion data:', { role: formData.role, additionalData });

    const res = await fetch('/api/google-signup-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: googleUserData.uid,
        role: formData.role,
        additionalData,
        tempToken: googleUserData.tempToken
      }),
    });

    const result = await res.json();

    if (!result.success) {
      console.error('❌ Form completion failed:', result.error);
      alert(result.error || 'Registration completion failed');
      return;
    }

    ('✅ Registration completed successfully');

    if (result.customToken) {
      ('🔐 Signing in with custom token...');
      await signInWithCustomToken(auth, result.customToken);
      ('✅ Signed in successfully');
    }

    // 🆕 UPDATED: Store with both keys
    localStorage.setItem('user', JSON.stringify(result.user));
    localStorage.setItem('currentUser', JSON.stringify(result.user));

    if (formData.role === 'publisher') {
      const publisherId = result.user.uid;
      localStorage.setItem('currentPublisherId', publisherId);
      ('✅ Publisher ID stored:', publisherId);
    }

    ('🔄 Redirecting user based on role:', formData.role);
    
    if (formData.role === 'publisher') {
      ('📝 Publisher sign-up complete, redirecting to profile to complete required fields');
      router.push('/print-media/profile');
    } else if (formData.role === 'reader') {
      ('📰 Reader sign-up complete, navigating to news-reader');
      router.push('/news-reader');
    } else {
      ('🏢 Default navigation to overview');
      router.push('/print-media/overview');
    }

  } catch (error) {
    console.error('❌ Form completion error:', error);
    alert('Registration completion failed. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

// Render Google Sign-In Button
export const renderGoogleSignInButton = (elementId, callback) => {
  ('🎨 Rendering Google Sign-In button...');
  if (window.google && window.google.accounts && window.google.accounts.id) {
    window.google.accounts.id.renderButton(
      document.getElementById(elementId),
      {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'signup_with',
        shape: 'rectangular'
      }
    );
    ('✅ Google Sign-In button rendered');
  } else {
    console.warn('⚠️ Google Sign-In not available for button rendering');
  }
};

// Handle Reader Registration (Email)
export const handleReaderRegistration = async (formData, router, setIsLoading) => {
  ('📝 Reader email registration started');
  setIsLoading(true);
  ('⏳ isLoading set to true');

  try {
    ('🔍 Validating reader form...');
    const errors = validateReaderForm(formData);
    if (errors.length > 0) {
      console.warn('⚠️ Validation errors:', errors);
      alert(errors.join('\n'));
      return;
    }

    ('✅ Validation passed. Creating user with Firebase...');

    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
    const user = userCredential.user;
    ('✅ Firebase user created:', user.uid, user.email);

    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/signin`,
      handleCodeInApp: true,
    };

    await sendEmailVerification(user, actionCodeSettings);
    ('📧 Verification email sent to:', user.email);

    ('📤 Sending user data to /api/signup');
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.uid,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: 'reader',
        signUpMethod: 'email'
      }),
    });

    ('📡 API response status:', res.status);
    const result = await res.json();
    
    if (result.success) {
      ('✅ Reader registration successful, redirecting to verify email page.');
      await signOut(auth);
      router.push('/verify-email');
    } else {
      console.error('❌ Failed to save user data:', result.error);
      alert('Registration failed. Please try again.');
    }

  } catch (error) {
    console.error('❌ Reader Sign-Up Error:', {
      code: error.code,
      message: error.message,
      fullError: error,
    });
    if (error.code === 'auth/email-already-in-use') {
      console.warn('⚠️ Email already in use');
      alert('This email is already registered. Please use a different email or sign in.');
    } else {
      alert('Registration failed. Please try again.');
    }
  } finally {
    setIsLoading(false);
    ('✅ Reader submission ended');
  }
};

// Handle Publisher Registration (Email)
export const handlePublisherRegistration = async (formData, router, setIsLoading) => {
  ('🏢 Publisher email registration started');
  setIsLoading(true);
  ('⏳ isLoading set to true');

  try {
    ('🔍 Validating publisher form...');
    const errors = validatePublisherForm(formData);
    if (errors.length > 0) {
      console.warn('⚠️ Validation errors:', errors);
      alert(errors.join('\n'));
      return;
    }

    ('✅ Validation passed. Creating publisher account...');

    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
    const user = userCredential.user;
    ('✅ Firebase user created:', user.uid, user.email);

    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/signin`,
      handleCodeInApp: true,
    };

    await sendEmailVerification(user, actionCodeSettings);
    ('📧 Verification email sent to:', user.email);

    ('📤 Sending publisher data to /api/signup');
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.uid,
        email: formData.email,
        firstName: formData.contactName.split(' ')[0] || '',
        lastName: formData.contactName.split(' ').slice(1).join(' ') || '',
        role: 'publisher',
        companyName: formData.companyName,
        industry: formData.industry,
        companyWebsite: formData.companyWebsite,
        jobTitle: formData.jobTitle,
        phone: formData.phone,
        publicationType: formData.publicationType,
        audienceType: formData.audienceType,
        monthlyReadership: formData.monthlyReadership,
        contactName: formData.contactName,
        signUpMethod: 'email',
        isApproved: false,
        approvalStatus: 'pending',
        profileComplete: false
      }),
    });

    ('📡 API response status:', res.status);
    const result = await res.json();
    
    if (result.success) {
      ('✅ Publisher registration successful, redirecting to verify email page.');
      await signOut(auth);
      router.push('/verify-email');
    } else {
      console.error('❌ Failed to save publisher data:', result.error);
      alert('Registration failed. Please try again.');
    }

  } catch (error) {
    console.error('❌ Publisher Sign-Up Error:', {
      code: error.code,
      message: error.message,
      fullError: error,
    });
    if (error.code === 'auth/email-already-in-use') {
      console.warn('⚠️ Email already in use');
      alert('This email is already registered. Please use a different email or sign in.');
    } else {
      alert('Registration failed. Please try again.');
    }
  } finally {
    setIsLoading(false);
    ('✅ Publisher submission ended');
  }
};

// Form validation helpers
export const validateReaderForm = (formData) => {
  const errors = [];
  
  if (!formData.firstName?.trim()) errors.push('First name is required');
  if (!formData.lastName?.trim()) errors.push('Last name is required');
  if (!formData.email?.trim()) errors.push('Email is required');
  if (!formData.password) errors.push('Password is required');
  
  // Validate password strength
  const passwordErrors = validatePassword(formData.password);
  errors.push(...passwordErrors);
  
  if (formData.password !== formData.confirmPassword) errors.push('Passwords do not match');
  if (!formData.agreeToTerms) errors.push('You must agree to the terms and conditions');
  
  return errors;
};

export const validatePublisherForm = (formData) => {
  const errors = [];
  
  const requiredFields = {
    companyName: 'Company name',
    industry: 'Industry',
    contactName: 'Contact name',
    jobTitle: 'Job title',
    email: 'Email',
    password: 'Password',
    publicationType: 'Publication type',
    audienceType: 'Audience type'
  };
  
  Object.entries(requiredFields).forEach(([field, label]) => {
    if (!formData[field]?.trim()) {
      errors.push(`${label} is required`);
    }
  });
  
  // Validate password strength
  const passwordErrors = validatePassword(formData.password);
  errors.push(...passwordErrors);
  
  if (formData.password !== formData.confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  if (!formData.agreeToTerms) {
    errors.push('You must agree to the terms and conditions');
  }
  
  return errors;
};

// 🆕 NEW HELPER FUNCTIONS FOR MANAGE ADS PAGE

// Check if user is signed in
export const isUserSignedIn = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return !!user;
  }
  return false;
};

// Get current user from localStorage
export const getCurrentUser = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        return null;
      }
    }
  }
  return null;
};

// Sign out user
export const handleSignOut = async (router) => {
  ('👋 Signing out user...');
  
  try {
    // Sign out from Firebase Auth
    await signOut(auth);
    ('✅ Firebase Auth sign-out successful');
  } catch (error) {
    console.error('❌ Firebase sign-out error:', error);
  }
  
  // Clear localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('keepSignedIn');
    localStorage.removeItem('currentPublisherId');
    ('✅ User data cleared from localStorage');
  }
  
  // Redirect to sign-in page
  if (router) {
    router.push('/signin');
  }
};