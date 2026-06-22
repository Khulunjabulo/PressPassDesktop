'use client';
/**
 * AdminImpersonationBannerWrapper
 *
 * Place in: components/AdminImpersonationBannerWrapper.jsx (client repo)
 *
 * Wraps the entire app in layout.js OUTSIDE AuthProvider.
 * Signs in via signInWithCustomToken BEFORE children render so no
 * auth guard ever sees a null user.
 */

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { signInWithCustomToken, signOut } from 'firebase/auth';
import { auth } from '@/Firebase/firebase'; // ← uses your existing singleton, no getAuth(app)
import { Shield, X, ArrowLeft, AlertTriangle } from 'lucide-react';

const ADMIN_SESSION_KEY = 'adminImpersonationSession';

// ─── Inner component (uses useSearchParams — must be inside Suspense) ─────────
function AdminImpersonationCore({ children }) {
  const [session,       setSession]       = useState(null);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [ready,         setReady]         = useState(false);

  const router       = useRouter();
  const searchParams = useSearchParams();
  const pathname     = usePathname();

  // ── Sign in via custom token ───────────────────────────────────────────────
  const bootstrapAdminSession = useCallback(async (payload) => {
    setBootstrapping(true);
    try {
      console.log('🔑 AdminImpersonation: calling signInWithCustomToken...');

      // Uses the auth singleton from @/Firebase/firebase — already has correct API key
      await signInWithCustomToken(auth, payload.customToken);

      console.log('✅ AdminImpersonation: Firebase sign-in successful');

      const user = { ...payload.user };

      // Store in localStorage — same shape as normal sign-in
      localStorage.setItem('user',        JSON.stringify(user));
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('userRole',    user.role);

      if (user.role === 'publisher') {
        localStorage.setItem('currentPublisherId', user.uid);
      }

      // Persist banner session in sessionStorage (clears when tab closes)
      const bannerSession = {
        user,
        impersonatedBy: user.impersonatedBy || 'super_admin',
        startedAt:      new Date().toISOString(),
      };
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(bannerSession));
      setSession(bannerSession);

      console.log('🔑 Admin impersonation session started for:', user.email);
    } catch (err) {
      console.error('❌ AdminImpersonation: signInWithCustomToken failed', err);
      setSession(false);
    } finally {
      setBootstrapping(false);
      setReady(true);
    }
  }, []);

  // ── On mount: check query param or sessionStorage ──────────────────────────
  useEffect(() => {
    const encoded = searchParams.get('adminSession');

    if (encoded) {
      // Strip the param from the URL immediately
      const params = new URLSearchParams(searchParams.toString());
      params.delete('adminSession');
      const newUrl = params.toString() ? `${pathname}?${params}` : pathname;
      router.replace(newUrl);

      try {
        const payload = JSON.parse(decodeURIComponent(encoded));
        if (payload.adminImpersonation && payload.customToken && payload.user) {
          // Sign in BEFORE setting ready — children won't render until done
          bootstrapAdminSession(payload);
          return;
        }
      } catch (err) {
        console.error('AdminImpersonation: failed to parse adminSession param', err);
      }

      // Malformed param — continue normally
      setSession(false);
      setReady(true);
      return;
    }

    // No query param — check sessionStorage for a resumed session
    try {
      const stored = sessionStorage.getItem(ADMIN_SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSession(parsed);
        console.log('🔑 AdminImpersonation: resumed session for', parsed.user?.email);
      } else {
        setSession(false);
      }
    } catch {
      setSession(false);
    }

    setReady(true);
  }, []); // run once on mount

  // ── End session ────────────────────────────────────────────────────────────
  const handleEndSession = async () => {
    try { await signOut(auth); } catch { /* ignore */ }

    ['user', 'currentUser', 'userRole', 'keepSignedIn', 'currentPublisherId']
      .forEach(k => localStorage.removeItem(k));
    sessionStorage.removeItem(ADMIN_SESSION_KEY);

    setSession(false);
    window.close();
    router.push('/');
  };

  // ── Back to admin dashboard ────────────────────────────────────────────────
  const handleGoBack = () => {
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_SITE_URL || 'http://localhost:3000';
    window.open(adminUrl, '_blank');
  };

  // ── While signing in: show full-screen loader instead of children ──────────
  // This prevents any auth guard from firing before sign-in completes
  if (bootstrapping || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            {bootstrapping ? 'Starting admin session…' : 'Loading…'}
          </p>
        </div>
      </div>
    );
  }

  // ── Active session display name ────────────────────────────────────────────
  const activeSession = session && session !== false ? session : null;

  const displayName = activeSession
    ? (activeSession.user.role === 'publisher'
        ? (activeSession.user.companyName  ||
           activeSession.user.contactName  ||
           activeSession.user.email)
        : (activeSession.user.fullName ||
           `${activeSession.user.firstName || ''} ${activeSession.user.lastName || ''}`.trim() ||
           activeSession.user.email))
    : '';

  return (
    <>
      {/* ── Red admin banner — only shown during impersonation ── */}
      {activeSession && (
        <>
          <div
            className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white shadow-lg"
            role="alert"
            aria-live="polite"
          >
            <div className="max-w-screen-xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">

              {/* Left: session info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm min-w-0">
                  <span className="font-bold uppercase tracking-wide text-red-100 text-xs">
                    Admin Mode
                  </span>
                  <span className="text-white font-medium truncate">
                    Signed in as <strong>{displayName}</strong>
                  </span>
                  <span className="text-red-200 text-xs hidden sm:inline">
                    via <strong>{activeSession.impersonatedBy}</strong>
                  </span>
                  <span className="flex items-center gap-1 bg-red-700 px-2 py-0.5 rounded-full text-xs text-red-100">
                    <AlertTriangle className="w-3 h-3" />
                    Impersonated session
                  </span>
                </div>
              </div>

              {/* Right: action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleGoBack}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Admin
                </button>
                <button
                  onClick={handleEndSession}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition"
                >
                  <X className="w-3.5 h-3.5" />
                  End Session
                </button>
              </div>
            </div>
          </div>

          {/* Spacer so page content is not hidden under the banner */}
          <div className="h-11" aria-hidden="true" />
        </>
      )}

      {/* ── Page content ── */}
      {children}
    </>
  );
}

// ─── Public export: wraps core in Suspense (required for useSearchParams) ─────
export default function AdminImpersonationBannerWrapper({ children }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      }
    >
      <AdminImpersonationCore>
        {children}
      </AdminImpersonationCore>
    </Suspense>
  );
}