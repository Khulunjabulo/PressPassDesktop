// lib/authLogic.js - MERGED VERSION: onUnverified callback + resend verification + verbose logging
import { getAuth, signInWithCustomToken, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../Firebase/firebase';

const auth = getAuth(app);
const db = getFirestore();

// ─── Email Validation ─────────────────────────────────────────────────────────
// Rejects: abc@.com | abc@com | @domain.com | user@domain. | user@-bad.com
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export const isValidEmail = (email) => EMAIL_REGEX.test((email || '').trim());

// ─── Password Validation ──────────────────────────────────────────────────────
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

// ─── Initialize Google Sign-In ────────────────────────────────────────────────
export const initializeGoogleSignIn = (callback) => {
  console.log('🔧 Initializing Google Sign-In...');

  if (typeof window === 'undefined') {
    console.warn('⚠️ Not in browser environment, skipping Google Sign-In initialization');
    return;
  }

  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    console.error('❌ Google Client ID not found in environment variables');
    return;
  }

  if (!document.getElementById('google-client-script')) {
    console.log('📜 Adding Google script to page...');
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.id = 'google-client-script';

    script.onload = () => {
      console.log('✅ Google script loaded successfully');

      if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
          console.log('⚙️ Initializing Google Identity Services...');
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            callback: callback,
            auto_select: false,
            cancel_on_tap_outside: true,
            itp_support: true,
          });
          console.log('✅ Google Sign-In initialized successfully');
        } catch (error) {
          console.error('❌ Error initializing Google Sign-In:', error);
        }
      } else {
        console.warn('⚠️ window.google is not available after script load');
      }
    };

    script.onerror = (error) => {
      console.error('❌ Failed to load Google script:', error);
    };

    document.body.appendChild(script);
  } else {
    console.log('✅ Google script already exists');

    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: callback,
          auto_select: false,
          cancel_on_tap_outside: true,
          itp_support: true,
        });
        console.log('✅ Google Sign-In re-initialized');
      } catch (error) {
        console.error('❌ Error re-initializing Google Sign-In:', error);
      }
    }
  }
};

// ─── Resend Verification Email ────────────────────────────────────────────────
export const resendVerificationEmail = async (email, password, setError, setLoading, setSuccess) => {
  console.log('📧 Resending verification email to:', email);
  setLoading(true);
  setError('');

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
    const user = userCredential.user;

    if (user.emailVerified) {
      console.log('✅ Email already verified');
      setError('Your email is already verified. Please sign in.');
      await signOut(auth);
      return;
    }

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://presspass.africa').replace(/\/$/, '');
    const actionCodeSettings = {
      url: `${appUrl}/signin`,
      handleCodeInApp: true,
    };

    await sendEmailVerification(user, actionCodeSettings);
    console.log('✅ Verification email resent to:', email);

    await signOut(auth);

    if (typeof setSuccess === 'function') {
      setSuccess('Verification email sent! Please check your inbox.');
    }
  } catch (error) {
    console.error('❌ Resend verification error:', error.code, error.message);
    let msg = 'Failed to resend verification email.';
    if (error.code === 'auth/user-not-found')   msg = 'No account found with this email address.';
    else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') msg = 'Incorrect password. Cannot resend verification email.';
    else if (error.code === 'auth/too-many-requests') msg = 'Too many attempts. Please wait a moment before trying again.';
    setError(msg);
  } finally {
    setLoading(false);
  }
};

// ─── Handle Email Sign-In ─────────────────────────────────────────────────────
export const handleSignIn = async (
  email,
  password,
  role,
  keepSignedIn,
  router,
  setError,
  setLoading,
  onUnverified
) => {
  console.log('🔐 Email sign-in started');
  setLoading(true);
  setError('');

  try {
    console.log('🔍 Validating sign-in data...');

    if (!email || !password || !role) {
      setError('Please fill in all required fields');
      return;
    }

    // ── Validate email format before hitting Firebase ──
    if (!isValidEmail(email)) {
      setError('Invalid email format (e.g. name@example.com)');
      return;
    }

    let firebaseUser;
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.toLowerCase().trim(),
        password
      );
      firebaseUser = userCredential.user;
      console.log('✅ Firebase Auth sign-in successful');
    } catch (authError) {
      console.error('❌ Firebase Auth failed:', authError.code);
      let msg = 'Invalid email or password.';
      if (authError.code === 'auth/user-not-found')      msg = 'No account found with this email address.';
      else if (authError.code === 'auth/wrong-password') msg = 'Incorrect password.';
      else if (authError.code === 'auth/invalid-email')  msg = 'Invalid email address format.';
      else if (authError.code === 'auth/user-disabled')  msg = 'This account has been disabled.';
      else if (authError.code === 'auth/too-many-requests') msg = 'Too many failed attempts. Please try again later.';
      else if (authError.code === 'auth/invalid-credential') msg = 'Invalid email or password.';
      setError(msg);
      return;
    }

    if (!firebaseUser.emailVerified) {
      console.warn('📧 Email not verified for:', email);
      await signOut(auth);

      if (typeof onUnverified === 'function') {
        onUnverified(email.toLowerCase().trim(), role);
      } else {
        setError('Please verify your email before signing in. Check your inbox for a verification link.');
      }
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
        keepSignedIn,
      }),
    });

    console.log('📡 API response status:', res.status);
    const result = await res.json();

    if (!result.success) {
      console.error('❌ Sign-in failed:', result.error);
      await signOut(auth);
      setError(result.error || 'Sign-in failed');
      return;
    }

    console.log('✅ API sign-in successful');

    localStorage.setItem('user', JSON.stringify(result.user));
    localStorage.setItem('currentUser', JSON.stringify(result.user));
    localStorage.setItem('userRole', role);
    localStorage.setItem('keepSignedIn', keepSignedIn.toString());

    if (role === 'publisher') {
      localStorage.setItem('currentPublisherId', result.user.uid);
    }

    if (role === 'reader') {
      router.push('/news-reader');
    } else if (role === 'publisher') {
      router.push('/print-media/overview');
    }

  } catch (error) {
    console.error('❌ Sign-in error:', error);
    setError(error.message || 'Sign-in failed. Please check your credentials and try again.');
  } finally {
    setLoading(false);
    console.log('✅ Sign-in process ended');
  }
};

// ─── Handle Google Sign-In Callback ──────────────────────────────────────────
export const handleGoogleSignInCallback = async (
  response,
  router,
  setError,
  setLoading,
  setShowRoleSelector,
  setAvailableRoles,
  setPendingGoogleCredential
) => {
  console.log('🔐 Google sign-in callback triggered');
  setLoading(true);
  setError('');

  try {
    if (!response || !response.credential) {
      console.error('❌ No credential in Google response');
      setError('Google sign-in failed. Please try again.');
      setLoading(false);
      return;
    }

    const checkRes = await fetch('/api/google-signin-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential }),
    });

    const checkResult = await checkRes.json();

    if (!checkResult.success) {
      setError(checkResult.error || 'Google sign-in failed');
      setLoading(false);
      return;
    }

    if (checkResult.roles && checkResult.roles.length > 1) {
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

// ─── Complete Google Sign-In ──────────────────────────────────────────────────
export const completeGoogleSignIn = async (credential, role, router, setError, setLoading) => {
  console.log('🔐 Completing Google sign-in with role:', role);
  setLoading(true);
  setError('');

  try {
    const res = await fetch('/api/google-signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, role, keepSignedIn: true }),
    });

    const result = await res.json();

    if (!result.success) {
      setError(result.error || 'Google sign-in failed');
      return;
    }

    if (result.customToken) {
      await signInWithCustomToken(auth, result.customToken);
    }

    localStorage.setItem('user', JSON.stringify(result.user));
    localStorage.setItem('currentUser', JSON.stringify(result.user));
    localStorage.setItem('userRole', role);
    localStorage.setItem('keepSignedIn', 'true');

    if (role === 'publisher') {
      localStorage.setItem('currentPublisherId', result.user.uid);
    }

    if (role === 'reader') {
      router.push('/news-reader');
    } else if (role === 'publisher') {
      router.push('/print-media/overview');
    }
  } catch (error) {
    console.error('❌ Google sign-in error:', error);
    setError('Google sign-in failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

// ─── Handle Google Sign-Up (Step 1) ──────────────────────────────────────────
export const handleGoogleSignUp = async (response, setIsLoading, setShowFormModal, setGoogleUserData) => {
  console.log('🔐 Google sign-up callback triggered');
  setIsLoading(true);

  try {
    const res = await fetch('/api/google-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential }),
    });

    const result = await res.json().catch((error) => {
      console.error('❌ Failed to parse response as JSON:', error);
      return null;
    });

    if (!result || !res.ok) {
      alert(result?.error || 'Google sign-up failed');
      return;
    }

    if (result.needsFormCompletion) {
      setGoogleUserData({
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.name,
        picture: result.user.picture,
        tempToken: result.tempToken,
      });
      setShowFormModal(true);
    } else {
      if (result.customToken) {
        await signInWithCustomToken(auth, result.customToken);
      }
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('currentUser', JSON.stringify(result.user));
    }
  } catch (error) {
    console.error('❌ Google sign-up callback error:', error);
    alert('Google sign-up failed. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

// ─── Complete Google Sign-Up (Step 2) ────────────────────────────────────────
export const completeGoogleSignUp = async (googleUserData, formData, profilePicPreview, router, setIsLoading) => {
  console.log('📋 Completing Google sign-up with form data...');
  setIsLoading(true);

  try {
    const additionalData = {
      ...formData,
      profilePicture: profilePicPreview || googleUserData.picture,
    };

    const res = await fetch('/api/google-signup-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: googleUserData.uid,
        role: formData.role,
        additionalData,
        tempToken: googleUserData.tempToken,
      }),
    });

    const result = await res.json();

    if (!result.success) {
      alert(result.error || 'Registration completion failed');
      return;
    }

    if (result.customToken) {
      await signInWithCustomToken(auth, result.customToken);
    }

    localStorage.setItem('user', JSON.stringify(result.user));
    localStorage.setItem('currentUser', JSON.stringify(result.user));

    if (formData.role === 'publisher') {
      localStorage.setItem('currentPublisherId', result.user.uid);
      router.push('/print-media/profile');
    } else if (formData.role === 'reader') {
      router.push('/news-reader');
    } else {
      router.push('/print-media/overview');
    }
  } catch (error) {
    console.error('❌ Form completion error:', error);
    alert('Registration completion failed. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

// ─── Render Google Sign-In Button ─────────────────────────────────────────────
export const renderGoogleSignInButton = (elementId) => {
  if (window.google && window.google.accounts && window.google.accounts.id) {
    window.google.accounts.id.renderButton(document.getElementById(elementId), {
      theme: 'outline',
      size: 'large',
      width: '100%',
      text: 'signup_with',
      shape: 'rectangular',
    });
  }
};

// ─── Handle Reader Registration (Email) ──────────────────────────────────────
export const handleReaderRegistration = async (formData, router, setIsLoading) => {
  console.log('📝 Reader email registration started');
  setIsLoading(true);

  try {
    const errors = validateReaderForm(formData);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
    const user = userCredential.user;
    console.log('✅ Firebase user created:', user.uid, user.email);

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://presspass.africa').replace(/\/$/, '');
    const actionCodeSettings = { url: `${appUrl}/signin`, handleCodeInApp: true };

    await sendEmailVerification(user, actionCodeSettings);
    console.log('📧 Verification email sent to:', user.email);

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.uid,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: 'reader',
        signUpMethod: 'email',
      }),
    });

    const result = await res.json();

    if (result.success) {
      await signOut(auth);
      router.push('/verify-email');
    } else {
      console.error('❌ Failed to save user data:', result.error);
      alert('Registration failed. Please try again.');
    }
  } catch (error) {
    console.error('❌ Reader Sign-Up Error:', error);
    if (error.code === 'auth/email-already-in-use') {
      alert('This email is already registered. Please use a different email or sign in.');
    } else {
      alert('Registration failed. Please try again.');
    }
  } finally {
    setIsLoading(false);
  }
};

// ─── Handle Publisher Registration (Email) ───────────────────────────────────
export const handlePublisherRegistration = async (formData, router, setIsLoading) => {
  console.log('🏢 Publisher email registration started');
  setIsLoading(true);

  try {
    const errors = validatePublisherForm(formData);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
    const user = userCredential.user;
    console.log('✅ Firebase user created:', user.uid, user.email);

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://presspass.africa').replace(/\/$/, '');
    const actionCodeSettings = { url: `${appUrl}/signin`, handleCodeInApp: true };

    await sendEmailVerification(user, actionCodeSettings);
    console.log('📧 Verification email sent to:', user.email);

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
        profileComplete: false,
      }),
    });

    const result = await res.json();

    if (result.success) {
      await signOut(auth);
      router.push('/verify-email');
    } else {
      console.error('❌ Failed to save publisher data:', result.error);
      alert('Registration failed. Please try again.');
    }
  } catch (error) {
    console.error('❌ Publisher Sign-Up Error:', error);
    if (error.code === 'auth/email-already-in-use') {
      alert('This email is already registered. Please use a different email or sign in.');
    } else {
      alert('Registration failed. Please try again.');
    }
  } finally {
    setIsLoading(false);
  }
};

// ─── Form Validation Helpers ──────────────────────────────────────────────────
export const validateReaderForm = (formData) => {
  const errors = [];

  if (!formData.firstName?.trim()) errors.push('First name is required');
  if (!formData.lastName?.trim())  errors.push('Last name is required');

  // ── FIX: validate email format, not just presence ──
  if (!formData.email?.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(formData.email)) {
    errors.push('Invalid email format (e.g. name@example.com)');
  }

  if (!formData.password) errors.push('Password is required');

  errors.push(...validatePassword(formData.password));

  if (formData.password !== formData.confirmPassword) errors.push('Passwords do not match');
  if (!formData.agreeToTerms) errors.push('You must agree to the terms and conditions');

  return errors;
};

export const validatePublisherForm = (formData) => {
  const errors = [];

  const requiredFields = {
    companyName:     'Company name',
    industry:        'Industry',
    contactName:     'Contact name',
    jobTitle:        'Job title',
    password:        'Password',
    publicationType: 'Publication type',
    audienceType:    'Audience type',
  };

  Object.entries(requiredFields).forEach(([field, label]) => {
    if (!formData[field]?.trim()) errors.push(`${label} is required`);
  });

  // ── FIX: validate email format, not just presence ──
  if (!formData.email?.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(formData.email)) {
    errors.push('Invalid email format (e.g. name@example.com)');
  }

  errors.push(...validatePassword(formData.password));

  if (formData.password !== formData.confirmPassword) errors.push('Passwords do not match');
  if (!formData.agreeToTerms) errors.push('You must agree to the terms and conditions');

  return errors;
};

// ─── User Management Helpers ──────────────────────────────────────────────────
export const isUserSignedIn = () => {
  if (typeof window !== 'undefined') return !!localStorage.getItem('user');
  return false;
};

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

export const handleSignOut = async (router) => {
  console.log('👋 Signing out user...');

  try {
    await signOut(auth);
    console.log('✅ Firebase Auth sign-out successful');
  } catch (error) {
    console.error('❌ Firebase sign-out error:', error);
  }

  if (typeof window !== 'undefined') {
    ['user', 'currentUser', 'userRole', 'keepSignedIn', 'currentPublisherId'].forEach(
      (k) => localStorage.removeItem(k)
    );
  }

  if (router) router.push('/signin');
};