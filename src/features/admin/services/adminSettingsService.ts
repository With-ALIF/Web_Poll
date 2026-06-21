import { supabase } from '../../../lib/supabase';

const TABLE_NAME = 'system_config';
const CONFIG_KEY = 'config';

export interface AppConfig {
  defaultSuffix: string;
  updatedAt: any;
  updatedBy: string;
}

export const fetchAppConfig = async (): Promise<AppConfig | null> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('value')
      .eq('key', CONFIG_KEY)
      .single();

    if (error) throw error;
    
    if (data && data.value) {
      localStorage.setItem('app_config', JSON.stringify(data.value));
      return data.value as AppConfig;
    }
    return null;
  } catch (error: any) {
    console.error("Error fetching app config:", error);
    const cached = localStorage.getItem('app_config');
    if (cached) return JSON.parse(cached);
    return null;
  }
};

export const saveAppConfig = async (config: AppConfig): Promise<boolean> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    const response = await fetch('/api/admin/save-config', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        key: CONFIG_KEY,
        value: config
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save config');
    }

    // Update local cache
    localStorage.setItem('app_config', JSON.stringify(config));
    
    return true;
  } catch (error) {
    console.error("Error saving app config:", error);
    return false;
  }
};
