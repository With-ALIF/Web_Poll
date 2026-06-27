import { supabase } from '../../../lib/supabase';

export const fetchAllUsers = async () => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const response = await fetch('/api/admin/list-users', {
      headers: { 'authorization': token ? `Bearer ${token}` : '' }
    });
    
    let resData: any = {};
    const resText = await response.text();
    if (resText) {
      try {
        resData = JSON.parse(resText);
      } catch (e) {
        console.error("Non-JSON response from list-users API:", resText);
      }
    }
    
    const users = resData.users || [];
    localStorage.setItem('admin_user_list', JSON.stringify(users));
    return users;
  } catch (error: any) {
    const cached = localStorage.getItem('admin_user_list');
    if (cached) return JSON.parse(cached);
    console.error("Error in fetchAllUsers:", error);
    return [];
  }
};

export const loadAdminUsers = fetchAllUsers;

export const deleteUserByAdmin = async (userId: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    const response = await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ userId })
    });

    const resText = await response.text();
    let resData: any = {};
    try { resData = resText ? JSON.parse(resText) : {}; } catch(e) {}
    if (!response.ok) {
      throw new Error(resData.error || "Failed to delete user");
    }
    console.log("User profile and auth deleted successfully by admin via backend API");
  } catch (error) {
    console.error("Error in deleteUserByAdmin:", error);
    throw error;
  }
};

export const updateUserPermissions = async (userId: string, permissions: string[]) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    const response = await fetch('/api/admin/update-permissions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ userId, permissions })
    });

    const resText = await response.text();
    let resData: any = {};
    try { resData = resText ? JSON.parse(resText) : {}; } catch(e) {}
    if (!response.ok) {
      throw new Error(resData.error || "Failed to update permissions");
    }
  } catch (error) {
    console.error("Error in updateUserPermissions:", error);
    throw error;
  }
};

export const updateUser = async (userId: string, data: any) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId);
    
    if (error) throw error;
    console.log("User updated successfully");
  } catch (error) {
    console.error("Error in updateUser:", error);
    throw error;
  }
};

export const resetUserPassword = async (userId: string, newPassword: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    const response = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ userId, newPassword })
    });

    const resText = await response.text();
    let resData: any = {};
    try { resData = resText ? JSON.parse(resText) : {}; } catch(e) {}
    if (!response.ok) {
      throw new Error(resData.error || "Failed to reset password");
    }
  } catch (error) {
    console.error("Error in resetUserPassword:", error);
    throw error;
  }
};

export const createUserByAdmin = async (email: string, displayName: string, password?: string, permissions: string[] = []) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    const response = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ email, displayName, password, permissions })
    });

    const resText = await response.text();
    let resData: any = {};
    try { resData = resText ? JSON.parse(resText) : {}; } catch(e) {}
    if (!response.ok) {
      throw new Error(resData.error || "Failed to create user");
    }

    return resData.user || { email, password, displayName };
  } catch (error: any) {
    console.error("Error in createUserByAdmin:", error);
    throw error;
  }
};
