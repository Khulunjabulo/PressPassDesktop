// lib/authLogic.js
import { getAuth, signInWithCustomToken, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../Firebase/firebase';
import { signInWithGoogle, setAuthPersistence } from '../Firebase/auth';

const auth = getAuth(app);
const db = getFirestore();

// Initialize Google Sign-In
export const initializeGoogleSignIn = (callback) => {
  console.log('🔧 useEffect: Checking Google script load...');
  if (!document.getElementById('google-client-script')) {
    console.log(' Adding Google script to page...');
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.id = 'google-client-script';
    script.onload = () => {
      console.log('Google script loaded successfully');
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
      console.error('Failed to load Google script');
    };
    document.body.appendChild(script);
  } else {
    console.log(' Google script already exists');
  }
};

// Handle Google Sign-Up
export const handleGoogleSignUp = async (response, formData, profilePicPreview, router, setIsLoading) => {
  console.log(' Google callback triggered');
  console.log(' Raw Google response:', response);

  setIsLoading(true);
  try {
    console.log(' Processing Google sign-in...');

    const res = await fetch('/api/google-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credential: response.credential,
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
        profilePicture: profilePicPreview,
      }),
    });

    console.log(' Request sent to /api/google-signup, status:', res.status);

    const result = await res.json().catch((error) => {
      console.error(' Failed to parse response as JSON:', error);
      return null;
    });

    if (!result || !res.ok) {
      console.error(' Google sign-up failed:', result?.error || 'Unknown error');
      alert(result?.error || 'Google sign-up failed');
      return;
    }

    console.log(' Google sign-up API success:', result);

    // Sign in with Firebase using custom token
    if (result.customToken) {
      console.log(' Signing in with Firebase custom token...');
      await signInWithCustomToken(auth, result.customToken);
      console.log(' Signed in with custom token');
    }

    // Redirect based on role
    console.log(' Redirecting user based on role:', formData.role);
    if (formData.role === 'reader') {
      console.log(' Navigating to /news-reader');
      router.push('/news-reader');
    } else {
      console.log(' Navigating to /print-media/overview');
      router.push('/print-media/overview');
    }
  } catch (error) {
    console.error(' Google callback error:', error);
    alert('Google sign-up failed. Please try again.');
  } finally {
    setIsLoading(false);
    console.log(' Google sign-in process ended, isLoading set to false');
  }
};

// Handle Google Sign-Up Button Click
export const handleGoogleSignUpClick = (formData) => {
  console.log(' Google Sign-Up button clicked');
  if (!formData.agreeToTerms) {
    console.warn(' Cannot proceed: User has not agreed to terms');
    alert('Please agree to the terms and conditions first.');
    return;
  }

  if (typeof window !== 'undefined' && window.google) {
    console.log(' Launching Google prompt...');
    window.google.accounts.id.prompt();
  } else {
    console.error(' Google Sign-In not available: window.google is undefined');
    alert('Google Sign-In is not available. Please refresh the page.');
  }
};

// Handle Reader Registration
export const handleReaderRegistration = async (formData, profilePicPreview, router, setIsLoading) => {
  console.log(' Reader form submission started');
  setIsLoading(true);
  console.log(' isLoading set to true');

  try {
    // Validation
    console.log(' Validating reader form...');
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      console.warn(' Missing required fields');
      alert('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      console.warn(' Passwords do not match');
      alert('Passwords do not match');
      return;
    }

    if (!formData.agreeToTerms) {
      console.warn(' Terms not agreed');
      alert('Please agree to the terms and conditions');
      return;
    }

    console.log(' Validation passed. Creating user with Firebase...');

    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
    const user = userCredential.user;
    console.log(' Firebase user created:', user.uid, user.email);

    // Save additional data to Firestore via API
    console.log(' Sending user data to /api/signup');
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.uid,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: 'reader',
        profilePicture: profilePicPreview,
      }),
    });

    console.log(' API response status:', res.status);
    const result = await res.json();
    
    if (result.success) {
      console.log(' Reader registration successful:', result);
      router.push('/news-reader');
    } else {
      console.error(' Failed to save user data:', result.error);
      alert('Registration failed. Please try again.');
    }

  } catch (error) {
    console.error(' Reader Sign-Up Error:', error);
    if (error.code === 'auth/email-already-in-use') {
      console.warn(' Email already in use');
      alert('This email is already registered. Please use a different email or sign in.');
    } else {
      alert('Registration failed. Please try again.');
    }
  } finally {
    setIsLoading(false);
    console.log(' Reader submission ended, isLoading set to false');
  }
};

// Handle Publisher Registration
export const handlePublisherRegistration = async (formData, router, setIsLoading) => {
  console.log(' Publisher form submission started');
  setIsLoading(true);
  console.log(' isLoading set to true');

  try {
    // Validation
    console.log(' Validating publisher form...');
    const requiredFields = [
      'companyName',
      'industry',
      'contactName',
      'jobTitle',
      'email',
      'password',
      'publicationType',
      'audienceType'
    ];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      console.warn(' Missing fields:', missingFields);
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      console.warn(' Passwords do not match');
      alert('Passwords do not match');
      return;
    }

    if (!formData.agreeToTerms) {
      console.warn(' Terms not agreed');
      alert('Please agree to the terms and conditions');
      return;
    }

    console.log(' Validation passed. Creating publisher account...');

    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
    const user = userCredential.user;
    console.log(' Firebase user created:', user.uid, user.email);

    // Save additional data to Firestore via API
    console.log(' Sending publisher data to /api/signup');
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
      }),
    });

    console.log(' API response status:', res.status);
    const result = await res.json();
    
    if (result.success) {
      console.log(' Publisher registration successful:', result);
      router.push('/print-media');
    } else {
      console.error(' Failed to save publisher data:', result.error);
      alert('Registration failed. Please try again.');
    }

  } catch (error) {
    console.error(' Publisher Sign-Up Error:', error);
    if (error.code === 'auth/email-already-in-use') {
      console.warn(' Email already in use');
      alert('This email is already registered. Please use a different email or sign in.');
    } else {
      alert('Registration failed. Please try again.');
    }
  } finally {
    setIsLoading(false);
    console.log(' Publisher submission ended, isLoading set to false');
  }
};

// Handle Sign-In
export const handleSignIn = async (email, password, role, keepSignedIn, router, setError, setLoading) => {
  setLoading(true);
  setError('');
  try {
    await setAuthPersistence(keepSignedIn);

    // Call the sign-in API endpoint
    const response = await fetch('/api/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        password,
        role,
      }),
    });

    const data = await response.json();
    if (!data.success) {
      setError(data.error || 'Failed to sign in.');
      return;
    }

    console.log(' Sign-in successful:', data.user);

    // Store user data in localStorage or session storage for the app to use
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(data.user));
    }

    redirectToRoleHome(data.user.role, router);
  } catch (err) {
    console.error(' Sign-in error:', err);
    setError(err.message || 'Failed to sign in. Please try again.');
  } finally {
    setLoading(false);
  }
};

// Handle Google Sign-In
export const handleGoogleSignIn = async (role, keepSignedIn, router, setError, setLoading) => {
  setLoading(true);
  setError('');
  try {
    await setAuthPersistence(keepSignedIn);
    const result = await signInWithGoogle();
    const firebaseUser = result.user;
    // Generate role-specific UID to check user data
    const roleSpecificUid = `${role}_${firebaseUser.uid}`;
    const collectionName = role === 'reader' ? 'readers' : 'publishers';

    // Check if user exists in the role-specific collection
    const userDocRef = doc(db, collectionName, roleSpecificUid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      setError(
        `No ${role} account found with this Google account. Please sign up first or check your role selection.`
      );
      return;
    }

    const userData = userDocSnap.data();

    // Check if account is active
    if (!userData.isActive) {
      setError('Your account is currently inactive. Please contact support.');
      return;
    }

    console.log(' Google sign-in successful:', userData);

    // Store user data in localStorage for the app to use
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(userData));
    }

    redirectToRoleHome(userData.role, router);
  } catch (err) {
    console.error(' Google sign-in error:', err);
    setError(err.message || 'Google sign-in failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

// Redirect to role-specific home
const redirectToRoleHome = (userRole, router) => {
  if (userRole === 'reader') {
    router.push('/news-reader');
  } else if (userRole === 'publisher') {
    router.push('/print-media/overview');
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