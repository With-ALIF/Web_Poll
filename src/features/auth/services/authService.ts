import { supabase } from '../../../lib/supabase';
import { User } from '@supabase/supabase-js';
import { ADMIN_EMAILS } from '../constants';

const profileCheckCache = new Set<string>();

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    console.log("Password reset email sent to:", email);
  } catch (error) {
    console.error("Error in resetPassword:", error);
    throw error;
  }
};

export const createUserProfile = async (user: User) => {
  if (profileCheckCache.has(user.id)) {
    return;
  }
  try {
    console.log("Checking user profile for:", user.id);
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    profileCheckCache.add(user.id);
    
    if (!profile) {
      console.log("Creating new user profile...");
      const defaultRole = ADMIN_EMAILS.includes(user.email || '') ? 'admin' : 'user';
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          display_name: user.user_metadata?.full_name || '',
          photo_url: user.user_metadata?.avatar_url || '',
          role: defaultRole,
        });

      if (insertError) throw insertError;
      console.log("User profile created successfully with role:", defaultRole);
    } else {
      console.log("User profile already exists");
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(profile));
    }
  } catch (error: any) {
    console.error("Error in createUserProfile:", error);
  }
};

export const getUserProfile = async (uid: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();

    if (error) throw error;
    if (data) {
      localStorage.setItem(`profile_${uid}`, JSON.stringify(data));
      return data;
    }
    return null;
  } catch (error: any) {
    const cached = localStorage.getItem(`profile_${uid}`);
    if (cached) return JSON.parse(cached);
    console.error("Error in getUserProfile:", error);
    return null;
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    console.log("Attempting email sign-up for:", email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    if (data.user) {
      await createUserProfile(data.user);
    }
    console.log("Email sign-up successful");
    return data.user;
  } catch (error) {
    console.error("Error in signUpWithEmail:", error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log("Attempting email sign-in for:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    console.log("Email sign-in successful");
    return data.user;
  } catch (error) {
    console.error("Error in signInWithEmail:", error);
    throw error;
  }
};

export const deleteUserAccount = async () => {
  try {
    console.log("Attempting to delete user account...");
    // Supabase doesn't allow self-deletion via client SDK for security.
    // Usually handled via an edge function or a direct RPC if configured.
    // For now, we will sign out and inform the user.
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log("User signed out (account deletion needs admin/backend logic)");
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw error;
  }
};
