// lib/authLogic.js
import { getAuth, signInWithCustomToken, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../Firebase/firebase';

const auth = getAuth(app);
const db = getFirestore();

// Initialize Google Sign-In
export const initializeGoogleSignIn = (callback) => {
  console.log('🔧 Initializing Google Sign-In...');
  if (!document.getElementById('google-client-script')) {
    console.log('📜 Adding Google script to page...');
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.id = 'google-client-script';
    script.onload = () => {
      console.log('✅ Google script loaded successfully');
      if (window.google) {
        console.log('⚙️ Initializing Google Identity Services...');
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: callback,
        });
      } else {
        console.warn('⚠️ window.google is not available after script load');
      }
    };
    script.onerror = () => {
      console.error('❌ Failed to load Google script');
    };
    document.body.appendChild(script);
  } else {
    console.log('✅ Google script already exists');
  }
};

// Handle Email Sign-In
export const handleSignIn = async (email, password, role, keepSignedIn, router, setError, setLoading) => {
  console.log('🔐 Email sign-in started');
  setLoading(true);
  setError('');

  try {
    console.log('🔍 Validating sign-in data...');
    
    if (!email || !password || !role) {
      setError('Please fill in all required fields');
      return;
    }

    console.log('📤 Sending sign-in request to API');
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

    console.log('📡 API response status:', res.status);
    const result = await res.json();

    if (!result.success) {
      console.error('❌ Sign-in failed:', result.error);
      setError(result.error || 'Sign-in failed');
      return;
    }

    console.log('✅ API sign-in successful');

    // Sign in with Firebase Auth to establish the session
    const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
    const user = userCredential.user;
    console.log('✅ Firebase Auth sign-in successful');

    if (!user.emailVerified) {
      console.warn('📧 Email not verified. Signing user out.');
      await signOut(auth); // Sign out the unverified user
      setError('Please verify your email before signing in. Check your inbox for a verification link.');
      return;
    }

    // Store user data in localStorage for the app to use
    console.log('💾 Storing user data in localStorage...');
    localStorage.setItem('currentUser', JSON.stringify(result.user));
    console.log('✅ User data stored:', result.user);

    // Redirect based on role
    console.log('🔄 Redirecting user based on role:', role);
    if (role === 'reader') {
      console.log('📰 Navigating to /news-reader');
      router.push('/news-reader');
    } else {
      console.log('🏢 Navigating to /print-media/overview');
      router.push('/print-media/overview');
    }

  } catch (error) {
    console.error('❌ Sign-in error:', {
      code: error.code,
      message: error.message,
      fullError: error,
    });
    setError(error.message || 'Sign-in failed. Please check your credentials and try again.');
    setError('Sign-in failed. Please try again.');
  } finally {
    setLoading(false);
    console.log('✅ Sign-in process ended');
  }
};

// Handle Google Sign-In
export const handleGoogleSignIn = async (role, keepSignedIn, router, setError, setLoading) => {
  console.log('🔐 Google sign-in initiated for role:', role);
  setError('');
  
  if (!window.google) {
    setError('Google Sign-In is not available. Please refresh the page.');
    return;
  }

  // Initialize Google Sign-In if not already done
  if (!window.google.accounts.id.initialize) {
    console.log('⚙️ Initializing Google Sign-In...');
    initializeGoogleSignIn((response) => handleGoogleSignInCallback(response, role, keepSignedIn, router, setError, setLoading));
  }

  // Trigger Google Sign-In prompt
  console.log('🚀 Launching Google Sign-In prompt...');
  window.google.accounts.id.prompt();
};

// Handle Google Sign-In Callback
const handleGoogleSignInCallback = async (response, role, keepSignedIn, router, setError, setLoading) => {
  console.log('🔐 Google sign-in callback triggered');
  setLoading(true);

  try {
    console.log('📤 Sending Google sign-in request to API');
    const res = await fetch('/api/google-signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credential: response.credential,
        role,
        keepSignedIn
      }),
    });

    console.log('📡 API response status:', res.status);
    const result = await res.json();

    if (!result.success) {
      console.error('❌ Google sign-in failed:', result.error);
      setError(result.error || 'Google sign-in failed');
      return;
    }

    console.log('✅ Google sign-in successful');

    // Sign in with Firebase using custom token if provided
    if (result.customToken) {
      console.log('🔐 Signing in with custom token...');
      await signInWithCustomToken(auth, result.customToken);
      console.log('✅ Firebase Auth session established');
    }

    // Store user data in localStorage
    console.log('💾 Storing user data in localStorage...');
    localStorage.setItem('currentUser', JSON.stringify(result.user));
    console.log('✅ User data stored:', result.user);

    // Redirect based on role
    console.log('🔄 Redirecting user based on role:', role);
    if (role === 'reader') {
      console.log('📰 Navigating to /news-reader');
      router.push('/news-reader');
    } else {
      console.log('🏢 Navigating to /print-media/overview');
      router.push('/print-media/overview');
    }

  } catch (error) {
    console.error('❌ Google sign-in error:', error);
    setError('Google sign-in failed. Please try again.');
  } finally {
    setLoading(false);
    console.log('✅ Google sign-in process ended');
  }
};

// Handle Google Sign-Up (First Step - Get Google credential)
export const handleGoogleSignUp = async (response, setIsLoading, setShowFormModal, setGoogleUserData) => {
  console.log('🔐 Google callback triggered');
  console.log('📥 Raw Google response:', response);

  setIsLoading(true);
  try {
    console.log('🔄 Processing Google sign-in...');

    // First, get Google user info
    const res = await fetch('/api/google-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credential: response.credential,
      }),
    });

    console.log('📡 Request sent to /api/google-signup, status:', res.status);

    const result = await res.json().catch((error) => {
      console.error('❌ Failed to parse response as JSON:', error);
      return null;
    });

    if (!result || !res.ok) {
      console.error('❌ Google sign-up failed:', result?.error || 'Unknown error');
      alert(result?.error || 'Google sign-up failed');
      return;
    }

    console.log('✅ Google sign-up API success:', result);

    if (result.needsFormCompletion) {
      console.log('📝 Form completion needed, showing modal...');
      setGoogleUserData({
        ...result.user,
        tempToken: result.tempToken
      });
      setShowFormModal(true);
    } else {
      console.log('🎉 Registration completed, signing in...');
      // Sign in with Firebase using custom token
      if (result.customToken) {
        await signInWithCustomToken(auth, result.customToken);
        console.log('✅ Signed in with custom token');
      }
      
      // Store user data in localStorage
      localStorage.setItem('currentUser', JSON.stringify(result.user));
      
      // Redirect logic will be handled by parent component
    }

  } catch (error) {
    console.error('❌ Google callback error:', error);
    alert('Google sign-up failed. Please try again.');
  } finally {
    setIsLoading(false);
    console.log('✅ Google sign-in process ended');
  }
};

// Complete Google Sign-Up with form data
export const completeGoogleSignUp = async (googleUserData, formData, profilePicPreview, router, setIsLoading) => {
  console.log('📋 Completing Google sign-up with form data...');
  setIsLoading(true);

  try {
    const additionalData = {
      ...formData,
      profilePicture: profilePicPreview || googleUserData.picture
    };

    console.log('📤 Sending completion data:', { role: formData.role, additionalData });

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

    console.log('✅ Registration completed successfully');

    // Sign in with Firebase using custom token
    if (result.customToken) {
      console.log('🔐 Signing in with custom token...');
      await signInWithCustomToken(auth, result.customToken);
      console.log('✅ Signed in successfully');
    }

    // Store user data in localStorage
    localStorage.setItem('currentUser', JSON.stringify(result.user));

    // Redirect based on role
    console.log('🔄 Redirecting user based on role:', formData.role);
    if (formData.role === 'reader') {
      console.log('📰 Navigating to /news-reader');
      router.push('/news-reader');
    } else {
      console.log('🏢 Navigating to /print-media/overview');
      router.push('/print-media/overview');
    }

  } catch (error) {
    console.error('❌ Form completion error:', error);
    alert('Registration completion failed. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

// Handle Google Sign-Up Button Click
export const handleGoogleSignUpClick = (agreeToTerms) => {
  console.log('🔘 Google Sign-Up button clicked');
  if (!agreeToTerms) {
    console.warn('⚠️ Cannot proceed: User has not agreed to terms');
    alert('Please agree to the terms and conditions first.');
    return;
  }

  if (typeof window !== 'undefined' && window.google) {
    console.log('🚀 Launching Google prompt...');
    window.google.accounts.id.prompt();
  } else {
    console.error('❌ Google Sign-In not available: window.google is undefined');
    alert('Google Sign-In is not available. Please refresh the page.');
  }
};

// Handle Reader Registration (Email)
export const handleReaderRegistration = async (formData, router, setIsLoading) => {
  console.log('📝 Reader email registration started');
  setIsLoading(true);
  console.log('⏳ isLoading set to true');

  try {
    console.log('🔍 Validating reader form...');
    const errors = validateReaderForm(formData);
    if (errors.length > 0) {
      console.warn('⚠️ Validation errors:', errors);
      alert(errors.join('\n'));
      return;
    }

    console.log('✅ Validation passed. Creating user with Firebase...');

    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
    const user = userCredential.user;
    console.log('✅ Firebase user created:', user.uid, user.email);

    // Use the custom domain for the verification link and ensure it redirects to the app.
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/signin`,
      handleCodeInApp: true,
    };

    // Send verification email
    await sendEmailVerification(user, actionCodeSettings);
    console.log(
      '📧 Verification email sent to:',
      user.email,
      'with URL:',
      actionCodeSettings.url
    );

    // Save additional data to Firestore via API
    console.log('📤 Sending user data to /api/signup');
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

    console.log('📡 API response status:', res.status);
    const result = await res.json();
    
    if (result.success) {
      console.log('✅ Reader registration successful, redirecting to verify email page.');
      // Do NOT sign the user in. Redirect to a page telling them to check their email.
      await signOut(auth); // Ensure user is signed out
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
    console.log('✅ Reader submission ended');
  }
};

// Handle Publisher Registration (Email)
export const handlePublisherRegistration = async (formData, router, setIsLoading) => {
  console.log('🏢 Publisher email registration started');
  setIsLoading(true);
  console.log('⏳ isLoading set to true');

  try {
    console.log('🔍 Validating publisher form...');
    const errors = validatePublisherForm(formData);
    if (errors.length > 0) {
      console.warn('⚠️ Validation errors:', errors);
      alert(errors.join('\n'));
      return;
    }

    console.log('✅ Validation passed. Creating publisher account...');

    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
    const user = userCredential.user;
    console.log('✅ Firebase user created:', user.uid, user.email);

    // Use the custom domain for the verification link and ensure it redirects to the app.
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/signin`,
      handleCodeInApp: true,
    };

    // Send verification email
    await sendEmailVerification(user, actionCodeSettings);
    console.log(
      '📧 Verification email sent to:',
      user.email,
      'with URL:',
      actionCodeSettings.url
    );

    // Save additional data to Firestore via API
    console.log('📤 Sending publisher data to /api/signup');
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
        signUpMethod: 'email'
      }),
    });

    console.log('📡 API response status:', res.status);
    const result = await res.json();
    
    if (result.success) {
      console.log('✅ Publisher registration successful, redirecting to verify email page.');
      // Do NOT sign the user in. Redirect to a page telling them to check their email.
      await signOut(auth); // Ensure user is signed out
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
    console.log('✅ Publisher submission ended');
  }
};

// Form validation helpers
export const validateReaderForm = (formData) => {
  const errors = [];
  
  if (!formData.firstName?.trim()) errors.push('First name is required');
  if (!formData.lastName?.trim()) errors.push('Last name is required');
  if (!formData.email?.trim()) errors.push('Email is required');
  if (!formData.password) errors.push('Password is required');
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
  
  if (formData.password !== formData.confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  if (!formData.agreeToTerms) {
    errors.push('You must agree to the terms and conditions');
  }
  
  return errors;
};