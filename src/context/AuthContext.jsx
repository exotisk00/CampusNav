import { createContext, useContext, useState, useEffect } from 'react';
import {
  signUpUser,
  loginUser,
  loginDemoUser,
  logoutUser,
  updateUserProfile,
  subscribeToAuthState,
  isFirebaseConfigured,
} from '../firebase';
import { currentUser as fallbackUser } from '../data/users';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Immediate hydration from local cache if present
    try {
      const cached = localStorage.getItem('campusnav_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let unsubscribe = () => {};

    if (isFirebaseConfigured) {
      // Listen to real-time Firebase Auth state
      unsubscribe = subscribeToAuthState((fbUser) => {
        if (fbUser) {
          setUser(fbUser);
          localStorage.setItem('campusnav_auth', 'true');
          localStorage.setItem('campusnav_user', JSON.stringify(fbUser));
        } else {
          // If logged out
          const wasLoggedIn = localStorage.getItem('campusnav_auth') === 'true';
          if (!wasLoggedIn) {
            setUser(null);
            localStorage.removeItem('campusnav_user');
          }
        }
        setLoading(false);
      });
    } else {
      // Fallback local mode
      const isLoggedIn = localStorage.getItem('campusnav_auth');
      if (isLoggedIn) {
        try {
          const stored = localStorage.getItem('campusnav_user');
          setUser(stored ? JSON.parse(stored) : fallbackUser);
        } catch {
          setUser(fallbackUser);
        }
      }
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    if (!isFirebaseConfigured) {
      // Demo / offline mode
      const nextUser = {
        ...fallbackUser,
        email: email || fallbackUser.email,
      };
      localStorage.setItem('campusnav_auth', 'true');
      localStorage.setItem('campusnav_user', JSON.stringify(nextUser));
      setUser(nextUser);
      return { success: true, user: nextUser };
    }

    const res = await loginUser(email, password);
    if (res.user) {
      setUser(res.user);
      localStorage.setItem('campusnav_auth', 'true');
      localStorage.setItem('campusnav_user', JSON.stringify(res.user));
    }
    return res;
  };

  const loginDemo = async () => {
    setAuthError(null);
    const res = await loginDemoUser();
    if (res.user) {
      setUser(res.user);
      localStorage.setItem('campusnav_auth', 'true');
      localStorage.setItem('campusnav_user', JSON.stringify(res.user));
    }
    return res;
  };

  const signup = async (userDataOrEmail, optionalPassword, optionalData) => {
    setAuthError(null);
    let email;
    let password;
    let profileData;

    if (typeof userDataOrEmail === 'object') {
      email = userDataOrEmail.email;
      password = userDataOrEmail.password || 'CampusNavPass123!';
      profileData = userDataOrEmail;
    } else {
      email = userDataOrEmail;
      password = optionalPassword;
      profileData = optionalData || {};
    }

    if (!isFirebaseConfigured) {
      const nextUser = {
        ...fallbackUser,
        ...profileData,
        email,
        id: `usr_${Date.now()}`,
      };
      localStorage.setItem('campusnav_auth', 'true');
      localStorage.setItem('campusnav_user', JSON.stringify(nextUser));
      setUser(nextUser);
      return { success: true, user: nextUser };
    }

    const res = await signUpUser(email, password, profileData);
    if (res.user) {
      setUser(res.user);
      localStorage.setItem('campusnav_auth', 'true');
      localStorage.setItem('campusnav_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = async () => {
    await logoutUser();
    localStorage.removeItem('campusnav_auth');
    localStorage.removeItem('campusnav_user');
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const uid = user?.uid || user?.id;
    if (uid) {
      await updateUserProfile(uid, updates);
    }
    setUser((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('campusnav_user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error: authError,
        login,
        loginDemo,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
