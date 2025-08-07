// lib/authHelpers.js
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../Firebase/firebase';

const auth = getAuth(app);

// Check if user is authenticated and redirect if not
export const requireAuth = (callback) => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Clean up listener
      
      if (user) {
        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (userData.uid) {
          resolve({ authenticated: true, user: userData });
        } else {
          resolve({ authenticated: false, redirectTo: '/signin' });
        }
      } else {
        resolve({ authenticated: false, redirectTo: '/signin' });
      }
    });
  });
};

// Protected route HOC
export const withAuth = (WrappedComponent) => {
  return function ProtectedRoute(props) {
    const [authState, setAuthState] = useState({ loading: true, authenticated: false, user: null });
    const router = useRouter();

    useEffect(() => {
      requireAuth().then((result) => {
        if (result.authenticated) {
          setAuthState({
            loading: false,
            authenticated: true,
            user: result.user
          });
        } else {
          router.push(result.redirectTo);
        }
      });
    }, [router]);

    if (authState.loading) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!authState.authenticated) {
      return null; // Router will handle redirect
    }

    return <WrappedComponent {...props} user={authState.user} />;
  };
};

// Check authentication status without redirect
export const useAuthStatus = () => {
  const [authState, setAuthState] = useState({ 
    loading: true, 
    authenticated: false, 
    user: null 
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        setAuthState({
          loading: false,
          authenticated: !!userData.uid,
          user: userData.uid ? userData : null
        });
      } else {
        setAuthState({
          loading: false,
          authenticated: false,
          user: null
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return authState;
};