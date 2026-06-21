import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { createUserProfile, signInWithEmail, signUpWithEmail, resetPassword } from '../features/auth/services/authService';
import { ADMIN_EMAILS } from '../features/auth/constants';
import { getUserPermissionsConfig } from '../features/admin/services/permissionHelper';

interface AuthContextType {
  user: any | null;
  profile: any | null;
  appConfig: any | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<User | null>;
  signUpWithEmailAuth: (email: string, password: string) => Promise<User | null>;
  resetPasswordAuth: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [appConfig, setAppConfig] = useState<any>(() => {
    const cached = localStorage.getItem('app_config');
    try {
      return cached ? JSON.parse(cached) : { maintenanceMode: false, registrationEnabled: true };
    } catch (e) {
      return { maintenanceMode: false, registrationEnabled: true };
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch App Config (Real-time listener for system_config)
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('system_config')
          .select('*')
          .eq('key', 'config')
          .single();
        
        if (error) throw error;
        
        if (data && data.value) {
          localStorage.setItem('app_config', JSON.stringify(data.value));
          setAppConfig(data.value);
        }
      } catch (err) {
        console.warn("Could not load app configuration from Supabase.", err);
      }
    };

    fetchConfig();

    let configSubscription: any = null;
    try {
      configSubscription = supabase
        .channel('system_config_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'system_config', filter: 'key=eq.config' }, payload => {
          const newData = (payload.new as any);
          if (newData && newData.value) {
            const newValue = newData.value;
            localStorage.setItem('app_config', JSON.stringify(newValue));
            setAppConfig(newValue);
          }
        })
        .subscribe();
    } catch (err) {
      console.warn("Could not subscribe to configuration changes.", err);
    }

    console.log("Setting up global Supabase auth listener...");

    let authListener: any = null;
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        const currentUser = session?.user || null;
        console.log("Global Auth state changed:", event, currentUser ? `User: ${currentUser.id}` : "No user");
        setUser(currentUser);
        
        if (currentUser) {
          try {
            // Ensure profile exists
            await createUserProfile(currentUser);
            
            // Fetch profile
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .single();
            
            if (profileError) throw profileError;
            
            if (profileData) {
              const userPerms = profileData.permissions || await getUserPermissionsConfig(currentUser.id) || [];
              const enrichedProfile = { ...profileData, permissions: userPerms };
              localStorage.setItem(`profile_${currentUser.id}`, JSON.stringify(enrichedProfile));
              setProfile(enrichedProfile);
            }
          } catch (profileErr) {
            console.error("Error setting up session profile:", profileErr);
            // Fallback load from cache
            const cached = localStorage.getItem(`profile_${currentUser.id}`);
            if (cached) setProfile(JSON.parse(cached));
          }

          // Subscribe to profile changes
          let profileSubscription: any = null;
          try {
            profileSubscription = supabase
              .channel(`profile_${currentUser.id}`)
              .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${currentUser.id}` }, async payload => {
                if (payload.new) {
                  const userPerms = payload.new.permissions || await getUserPermissionsConfig(currentUser.id) || [];
                  setProfile({ ...payload.new, permissions: userPerms });
                }
              })
              .subscribe();
          } catch (subErr) {
            console.warn("Could not subscribe to live profile changes:", subErr);
          }

          setLoading(false);
          return () => {
            if (profileSubscription) {
              profileSubscription.unsubscribe();
            }
          };
        } else {
          setProfile(null);
          setLoading(false);
        }
      });
      authListener = subscription;
    } catch (authErr) {
      console.error("Critical error setting up auth state listener:", authErr);
      setLoading(false);
    }

    return () => {
      if (configSubscription) {
        configSubscription.unsubscribe();
      }
      if (authListener) {
        authListener.unsubscribe();
      }
    };
  }, []);

  const isAdmin = profile?.role === 'admin' || (user?.email && ADMIN_EMAILS.map(e => e.toLowerCase()).includes(user.email.toLowerCase()));
  
  const mergedUser = useMemo(() => {
    if (!user) return null;
    return {
      uid: user.id, // Keep uid for compatibility
      id: user.id,
      email: user.email,
      ...user,
      ...profile,
    };
  }, [user?.id, profile]);

  const loginWithEmail = async (email: string, password: string) => {
    return await signInWithEmail(email, password);
  };

  const signUpWithEmailAuth = async (email: string, password: string) => {
    return await signUpWithEmail(email, password);
  };

  const resetPasswordAuth = async (email: string) => {
    return await resetPassword(email);
  };

  const logout = async () => {
    try {
      localStorage.clear();
      await supabase.auth.signOut();
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
    resetPasswordAuth,
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
