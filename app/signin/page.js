"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Newspaper, FilePen, Check, BarChart3, Smartphone } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { handleSignIn, initializeGoogleSignIn } from "../../lib/authLogic"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [keepSignedIn, setKeepSignedIn] = useState(false)
  // Changed default to reader to show News Reader first
  const [role, setRole] = useState("reader")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Initialize Google Sign-In when component mounts
  useEffect(() => {
    console.log('🔧 Initializing Google Sign-In in SignIn component...');
    initializeGoogleSignIn(handleGoogleSignInCallback);
  }, []);

  // Handle Google Sign-In callback
  const handleGoogleSignInCallback = async (response) => {
    console.log('🔐 Google sign-in callback triggered');
    setLoading(true);
    setError('');

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
        const { signInWithCustomToken, getAuth } = await import('firebase/auth');
        const { app } = await import('../../Firebase/firebase');
        const auth = getAuth(app);
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

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    await handleSignIn(email, password, role, keepSignedIn, router, setError, setLoading)
  }

  const handleGoogleSignInClick = async () => {
    console.log('🔘 Google Sign-In button clicked');
    setError('');
    
    if (!window.google) {
      setError('Google Sign-In is not available. Please refresh the page.');
      return;
    }

    // Trigger Google Sign-In prompt
    console.log('🚀 Launching Google Sign-In prompt...');
    try {
      window.google.accounts.id.prompt();
    } catch (error) {
      console.error('❌ Error launching Google prompt:', error);
      setError('Failed to launch Google Sign-In. Please try again.');
    }
  }

  const RoleIcon = () => {
    return role === "reader" ? (
      <Newspaper className="inline-block w-5 h-5" />
    ) : (
      <FilePen className="inline-block w-5 h-5" />
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/5 bg-gradient-to-br bg-[#329ae1] text-white p-8 flex flex-col justify-center">
            <div className="text-center mb-8">
              <div className="bg-white/20 p-4 rounded-full inline-block mb-4">
                <Image src="/Presspass.png" alt="News Icon" className="w-12 h-12" width={48} height={48} />
              </div>
              <h1 className="text-3xl font-bold mb-2">MediaHub</h1>
              <p className="text-blue-100">Publishing Platform</p>
            </div>
            <div className="space-y-6">
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
          <div className="md:w-3/5 p-8">
            <div className="flex mb-8 bg-blue-100 rounded-lg p-1">
              <button
                onClick={() => setRole("reader")}
                className={`flex-1 py-2 px-4 rounded-md text-center font-medium transition ${
                  role === "reader" ? "bg-[#329ae1] text-white" : "text-black-600"
                }`}
              >
                News Reader Sign In
              </button>
              <button
                onClick={() => setRole("publisher")}
                className={`flex-1 py-2 px-4 rounded-md text-center font-medium transition ${
                  role === "publisher" ? "bg-[#329ae1] text-white" : "text-black-600"
                }`}
              >
                Print Media Sign In
              </button>
            </div>

            <div className="space-y-6 bg-blue-50 p-6 rounded-xl">
              <h2 className="text-2xl font-bold text-gray-800 text-center flex items-center justify-center gap-2">
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
                  disabled={loading}
                  className="w-full bg-white text-gray-700 font-semibold py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition duration-300 flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
                  {loading ? "Signing in..." : "Sign in with Google"}
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
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                />

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
                  className="w-full bg-gradient-to-r bg-[#329ae1] text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
  )
}