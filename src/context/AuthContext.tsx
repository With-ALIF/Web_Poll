import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { createUserProfile, signInWithEmail, signUpWithEmail, resetPassword } from '../features/auth/services/authService';
import { ADMIN_EMAILS } from '../features/auth/constants';

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
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user || null;
      console.log("Global Auth state changed:", event, currentUser ? `User: ${currentUser.id}` : "No user");
      setUser(currentUser);
      
      if (!currentUser) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Separate effect for profile and its subscription
  useEffect(() => {
    if (!user) return;

    let profileSubscription: any = null;

    const setupProfile = async () => {
      try {
        setLoading(true);
        // Ensure profile exists
        await createUserProfile(user);
        
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*, profile_permissions(*)')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;
        
        if (profileData) {
          const perms = [];
          if (profileData.profile_permissions) {
            const p = Array.isArray(profileData.profile_permissions) ? profileData.profile_permissions[0] : profileData.profile_permissions;
            if (p) {
              if (p.polls) perms.push('polls');
              if (p.drafts) perms.push('drafts');
              if (p.formats) perms.push('formats');
              if (p.csv_modifier) perms.push('csv-modifier');
              if (p.ocr) perms.push('ocr');
              if (p.photocard) perms.push('photocard');
              if (p.exam_paper) perms.push('exam-paper');
              if (p.note) perms.push('note');
              if (p.suffix_edit) perms.push('suffix-edit');
              if (p.qbs) perms.push('qbs');
            }
          }
          const userPerms = perms;
          const enrichedProfile = { ...profileData, permissions: userPerms };
          localStorage.setItem(`profile_${user.id}`, JSON.stringify(enrichedProfile));
          setProfile(enrichedProfile);
        }
      } catch (profileErr) {
        console.error("Error setting up session profile:", profileErr);
        const cached = localStorage.getItem(`profile_${user.id}`);
        if (cached) setProfile(JSON.parse(cached));
      } finally {
        setLoading(false);
      }

      // Subscribe to profile changes
      try {
        profileSubscription = supabase
          .channel(`profile_and_perms_${user.id}`)
          .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'profiles', 
            filter: `id=eq.${user.id}` 
          }, payload => {
            if (payload.new) {
              setProfile((prev: any) => ({ ...prev, ...(payload.new as any) }));
            }
          })
          .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'profile_permissions', 
            filter: `id=eq.${user.id}` 
          }, payload => {
            if (payload.new) {
              const p = payload.new as any;
              const perms = [];
              if (p.polls) perms.push('polls');
              if (p.drafts) perms.push('drafts');
              if (p.formats) perms.push('formats');
              if (p.csv_modifier) perms.push('csv-modifier');
              if (p.ocr) perms.push('ocr');
              if (p.photocard) perms.push('photocard');
              if (p.exam_paper) perms.push('exam-paper');
              if (p.note) perms.push('note');
              if (p.suffix_edit) perms.push('suffix-edit');
              if (p.qbs) perms.push('qbs');
              
              setProfile((prev: any) => ({ ...prev, permissions: perms }));
            }
          })
          .subscribe();
      } catch (subErr) {
        console.warn("Could not subscribe to live profile changes:", subErr);
      }
    };

    setupProfile();

    return () => {
      if (profileSubscription) {
        supabase.removeChannel(profileSubscription);
      }
    };
  }, [user?.id]);

  useEffect(() => {
    // 1. Fetch App Config (Real-time listener for system_config)
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('system_config')
          .select('updated_by, default_suffix, updated_at')
          .eq('key', 'config')
          .single();
        
        if (error) throw error;
        
        if (data) {
          const config = {
            updated_by: data.updated_by,
            default_suffix: data.default_suffix,
            updated_at: data.updated_at
          };
          localStorage.setItem('app_config', JSON.stringify(config));
          setAppConfig(config);
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
          if (newData) {
            const newValue = {
              updated_by: newData.updated_by,
              default_suffix: newData.default_suffix,
              updated_at: newData.updated_at
            };
            localStorage.setItem('app_config', JSON.stringify(newValue));
            setAppConfig(newValue);
          }
        })
        .subscribe();
    } catch (err) {
      console.warn("Could not subscribe to configuration changes.", err);
    }

    return () => {
      if (configSubscription) {
        supabase.removeChannel(configSubscription);
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
