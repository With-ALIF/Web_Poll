import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../backend/firebase';
import { createUserProfile, signInWithEmail, signUpWithEmail } from '../features/auth/services/authService';
import { fetchAppConfig } from '../features/admin/services/adminSettingsService';
import { doc, onSnapshot } from 'firebase/firestore';
import { ADMIN_EMAILS } from '../features/auth/constants';

interface AuthContextType {
  user: any | null;
  profile: any | null;
  appConfig: any | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<User>;
  signUpWithEmailAuth: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [appConfig, setAppConfig] = useState<any>(() => {
    const cached = localStorage.getItem('app_config');
    try {
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Real-time App Config Listener
    const configDocRef = doc(db, 'system/config');
    const unsubscribeConfig = onSnapshot(configDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        localStorage.setItem('app_config', JSON.stringify(data));
        setAppConfig(data);
      }
    }, (error: any) => {
      const errorMsg = error?.message || String(error);
      if (errorMsg.includes('Quota') || errorMsg.includes('quota')) {
        console.warn("Config snapshot: Quota exceeded, using cache.");
      } else {
        console.error("Error in global config snapshot listener:", error);
      }
      // Try to load from cache on error
      const cached = localStorage.getItem('app_config');
      if (cached) setAppConfig(JSON.parse(cached));
    });

    console.log("Setting up global onAuthStateChanged listener...");
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      try {
        console.log("Global Auth state changed:", currentUser ? `User: ${currentUser.uid}` : "No user");
        setUser(currentUser);
        
        if (currentUser) {
          // Check if profile exists, create if not
          await createUserProfile(currentUser);
          
          // Listen for real-time profile updates (ONLY ONE LISTENER GLOBALLY)
          if (unsubscribeProfile) unsubscribeProfile();
          unsubscribeProfile = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              localStorage.setItem(`profile_${currentUser.uid}`, JSON.stringify(data));
              setProfile(data);
            }
            setLoading(false);
          }, (error: any) => {
            const errorMsg = error?.message || String(error);
            if (errorMsg.includes('Quota') || errorMsg.includes('quota')) {
              console.warn("Profile snapshot: Quota exceeded, using cache.");
            } else {
              console.error("Error in global profile snapshot listener:", error);
            }
            // Try to load from cache on error
            const cached = localStorage.getItem(`profile_${currentUser.uid}`);
            if (cached) setProfile(JSON.parse(cached));
            setLoading(false);
          });
        } else {
          setProfile(null);
          if (unsubscribeProfile) {
            unsubscribeProfile();
            unsubscribeProfile = null;
          }
          setLoading(false);
        }
      } catch (error: any) {
        if (error.message?.includes('Quota') || error.message?.includes('quota')) {
          console.warn("Global Auth state changed: Quota exceeded, using cached profile if available.");
          const cached = localStorage.getItem(`profile_${currentUser?.uid}`);
          if (cached) setProfile(JSON.parse(cached));
        } else {
          console.error("Error in global onAuthStateChanged:", error);
        }
        setLoading(false);
      }
    });

    return () => {
      unsubscribeConfig();
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const isAdmin = profile?.role === 'admin' || (user?.email && ADMIN_EMAILS.includes(user.email));
  
  const mergedUser = useMemo(() => {
    if (!user) return null;
    return {
      ...user,
      ...profile,
      uid: user.uid,
      email: user.email
    };
  }, [user?.uid, profile]);

  const loginWithEmail = async (email: string, password: string) => {
    return await signInWithEmail(email, password);
  };

  const signUpWithEmailAuth = async (email: string, password: string) => {
    return await signUpWithEmail(email, password);
  };

  const logout = async () => {
    try {
      localStorage.clear();
      await signOut(auth);
      window.location.reload();
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const value = useMemo(() => ({
    user: mergedUser,
    profile,
    appConfig,
    isAdmin,
    loading,
    loginWithEmail,
    signUpWithEmailAuth,
    logout
  }), [mergedUser, profile, appConfig, isAdmin, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
