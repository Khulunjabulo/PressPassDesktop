"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Newspaper, FilePen, Check, BarChart3, Smartphone, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { handleSignIn, initializeGoogleSignIn, handleGoogleSignInCallback, completeGoogleSignIn } from "../../lib/authLogic"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [keepSignedIn, setKeepSignedIn] = useState(false)
  const [role, setRole] = useState("reader")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isGoogleSignInActive, setIsGoogleSignInActive] = useState(false)
  const [googleInitialized, setGoogleInitialized] = useState(false) // NEW: Track initialization
  
  // Role selector states for Google Sign-In
  const [showRoleSelector, setShowRoleSelector] = useState(false)
  const [availableRoles, setAvailableRoles] = useState([])
  const [pendingGoogleCredential, setPendingGoogleCredential] = useState(null)
  
  const router = useRouter()

  // Initialize Google Sign-In when component mounts
  useEffect(() => {
    console.log('🔧 Initializing Google Sign-In in SignIn component...');
    let mounted = true;
    
    const callback = (response) => {
      if (mounted) {
        handleGoogleSignInCallback(
          response, 
          router, 
          setError, 
          setLoading,
          setShowRoleSelector,
          setAvailableRoles,
          setPendingGoogleCredential
        );
      }
    };
    
    // Initialize with a delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (mounted) {
        initializeGoogleSignIn(callback);
        setGoogleInitialized(true);
      }
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [router]);

  // Enforce reader-only on mobile screens
  useEffect(() => {
    const enforceMobileRole = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setRole('reader');
      }
    };
    enforceMobileRole();
    window.addEventListener('resize', enforceMobileRole);
    return () => window.removeEventListener('resize', enforceMobileRole);
  }, []);

  // Handle autofill detection
  useEffect(() => {
    const handleAutofill = () => {
      const passwordInput = document.getElementById('password-input');
      if (passwordInput && passwordInput.matches(':-webkit-autofill')) {
        setShowPassword(false);
      }
    };
    
    // Check after a delay to ensure autofill is complete
    const timer = setTimeout(handleAutofill, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    await handleSignIn(email, password, role, keepSignedIn, router, setError, setLoading)
  }

  const handleGoogleSignInClick = async () => {
    // Prevent multiple simultaneous sign-in attempts
    if (isGoogleSignInActive) {
      console.log('⚠️ Google Sign-In already in progress');
      return;
    }

    // Check if Google is initialized
    if (!googleInitialized || !window.google) {
      console.error('❌ Google Sign-In not initialized');
      setError('Google Sign-In is still loading. Please wait a moment and try again.');
      return;
    }

    console.log('🔘 Google Sign-In button clicked');
    setError('');
    setIsGoogleSignInActive(true);

    try {
      console.log('🚀 Launching Google Sign-In prompt...');
      
      // Use a more reliable approach with error handling
      window.google.accounts.id.prompt((notification) => {
        console.log('📢 Notification:', notification);
        
        if (notification.isNotDisplayed()) {
          console.log('⚠️ Google prompt was not displayed');
          setError('Google Sign-In popup was blocked. Please enable popups for this site.');
          setIsGoogleSignInActive(false);
        } else if (notification.isSkippedMoment()) {
          console.log('⚠️ Google prompt was skipped');
          setIsGoogleSignInActive(false);
        } else {
          // Reset flag after a delay if prompt was shown
          setTimeout(() => {
            setIsGoogleSignInActive(false);
          }, 1000);
        }
      });
    } catch (error) {
      console.error('❌ Error launching Google Sign-In:', error);
      setError('Failed to launch Google Sign-In. Please try again.');
      setIsGoogleSignInActive(false);
    }
  }

  const handleRoleSelection = async (selectedRole) => {
    console.log('👤 User selected role:', selectedRole);
    setShowRoleSelector(false);
    setIsGoogleSignInActive(false);
    await completeGoogleSignIn(pendingGoogleCredential, selectedRole, router, setError, setLoading);
  }

  const RoleIcon = () => {
    return role === "reader" ? (
      <Newspaper className="inline-block w-5 h-5" />
    ) : (
      <FilePen className="inline-block w-5 h-5" />
    )
  }

  return (
    <> 
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/5 bg-gradient-to-br bg-[#329ae1] text-white p-6 md:p-8 flex flex-col justify-center">
            <div className="text-center mb-8">
              <div className="bg-white/20 p-4 rounded-full inline-block mb-4">
                <Image src="/Presspass.png" alt="News Icon" className="w-12 h-12" width={48} height={48} />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">MediaHub</h1>
              <p className="text-blue-100">Publishing Platform</p>
            </div>
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-start">
                <div className="bg-white/20 p-2 rounded-lg mr-4">
                  <Check className="text-xl w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Reach Millions</h3>
                  <p className="text-blue-100 text-sm">Access our global audience of readers</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-white/20 p-2 rounded-lg mr-4">
                  <BarChart3 className="text-xl w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Analytics Dashboard</h3>
                  <p className="text-blue-100 text-sm">Track your publication performance</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-white/20 p-2 rounded-lg mr-4">
                  <Smartphone className="text-xl w-5 h-5" />
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
                onClick={() => setRole("reader")}
                className={`flex-1 py-2 px-4 rounded-md text-center font-medium transition text-sm md:text-base ${
                  role === "reader" ? "bg-[#329ae1] text-white" : "text-black-600"
                }`}
              >
                News Reader Sign In
              </button>
              <button
                onClick={() => setRole("publisher")}
                className={`hidden md:block flex-1 py-2 px-4 rounded-md text-center font-medium transition text-sm md:text-base ${
                  role === "publisher" ? "bg-[#329ae1] text-white" : "text-black-600"
                }`}
              >
                Print Media Sign In
              </button>
            </div>

            <div className="space-y-4 md:space-y-6 bg-blue-50 p-4 md:p-6 rounded-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center flex items-center justify-center gap-2">
                Sign In <RoleIcon />
              </h2>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Google Sign In Button */}
              <div className="mb-6">
                <button
                  onClick={handleGoogleSignInClick}
                  disabled={loading || isGoogleSignInActive || !googleInitialized}
                  className="w-full bg-white text-gray-700 font-semibold py-2.5 md:py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition duration-300 flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {!googleInitialized ? "Loading..." : (loading || isGoogleSignInActive ? "Signing in..." : "Sign in with Google")}
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-blue-50 text-gray-500">or sign in with email</span>
                </div>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                />
                <div className="relative">
                  <input
                    id="password-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
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

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-gray-700">
                    <input
                      type="checkbox"
                      checked={keepSignedIn}
                      onChange={(e) => setKeepSignedIn(e.target.checked)}
                      className="rounded"
                    />
                    Keep me signed in
                  </label>
                  <Link href="/ForgotPassword" className="text-black-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r bg-[#329ae1] text-white font-semibold py-2.5 md:py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </div>

            <div className="mt-6 text-center text-sm text-black-700">
              <p>
                {"Don't have an account?"}{" "}
                <Link href="/signup" className="text-pressblue font-medium hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Role Selector Modal */}
    {showRoleSelector && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Select Your Role</h2>
          <p className="text-gray-600 mb-6">
            We found multiple accounts associated with your Google account. Please select which account you'd like to sign in to:
          </p>
          <div className="space-y-3">
            {availableRoles.includes('reader') && (
              <button
                onClick={() => handleRoleSelection('reader')}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Newspaper className="w-5 h-5" />
                Sign in as News Reader
              </button>
            )}
            {availableRoles.includes('publisher') && (
              <button
                onClick={() => handleRoleSelection('publisher')}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FilePen className="w-5 h-5" />
                Sign in as Print Media Publisher
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setShowRoleSelector(false);
              setPendingGoogleCredential(null);
              setLoading(false);
              setIsGoogleSignInActive(false);
            }}
            className="w-full mt-4 text-gray-600 hover:text-gray-800 font-medium py-2"
          >
            Cancel
          </button>
        </div>
      </div>
    )}
    
    <div className="absolute top-4 left-4">
      <Link href="/" className="bg-[#3ba6e7] text-white px-4 py-2 rounded-md shadow-sm hover:bg-[#2a7ab8] transition-colors duration-200 mb-8 flex items-center text-sm">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Home
      </Link>
    </div>
     </>
  )
}