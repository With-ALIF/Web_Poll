import { supabase } from '../../../lib/supabase';

export const saveUserPermissionsConfig = async (userId: string, permissions: string[]): Promise<void> => {
  try {
    const { error } = await supabase
      .from('system_config')
      .upsert({
        key: `permissions_${userId}`,
        value: { permissions }
      }, { onConflict: 'key' });
    if (error) throw error;
  } catch (err) {
    console.error("Error saving user permissions config:", err);
    throw err;
  }
};

export const getUserPermissionsConfig = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', `permissions_${userId}`)
      .maybeSingle();

    if (error) throw error;
    if (data && data.value && typeof data.value === 'object') {
      const val = data.value as any;
      if (Array.isArray(val.permissions)) {
        return val.permissions;
      }
    }
    return [];
  } catch (err) {
    console.error("Error fetching user permissions config:", err);
    return [];
  }
};

export const getAllUserPermissionsConfigs = async (): Promise<Record<string, string[]>> => {
  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('key, value')
      .like('key', 'permissions_%');

    if (error) throw error;
    const result: Record<string, string[]> = {};
    if (data) {
      for (const item of data) {
        const userId = item.key.replace('permissions_', '');
        if (item.value && typeof item.value === 'object') {
          const val = item.value as any;
          if (Array.isArray(val.permissions)) {
            result[userId] = val.permissions;
          }
        }
      }
    }
    return result;
  } catch (err) {
    console.error("Error fetching all user permissions:", err);
    return {};
  }
};
