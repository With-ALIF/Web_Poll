import { supabase } from '../../../lib/supabase';

const TABLE_NAME = 'system_config';
const CONFIG_KEY = 'config';

export interface AppConfig {
  default_suffix: string;
  updated_at: any;
  updated_by: string;
}

export const fetchAppConfig = async (): Promise<AppConfig | null> => {
  try {
    const response = await fetch('/api/app-config');
    if (!response.ok) throw new Error("Failed to fetch app config");
    const data = await response.json();
    
    if (data) {
      const config: AppConfig = {
        updated_by: data.updated_by || 'System',
        default_suffix: data.default_suffix || '{{  join: https://t.me/SOT_Academy}}',
        updated_at: data.updated_at || new Date().toISOString()
      };
      localStorage.setItem('app_config', JSON.stringify(config));
      return config;
    }
    return null;
  } catch (error: any) {
    console.error("Error fetching app config:", error);
    const cached = localStorage.getItem('app_config');
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            if (!parsed.default_suffix || parsed.default_suffix.trim() === '') {
                parsed.default_suffix = '{{  join: https://t.me/SOT_Academy}}';
            }
            return parsed;
        } catch(e) {}
    }
    return {
        updated_by: 'System',
        default_suffix: '{{  join: https://t.me/SOT_Academy}}',
        updated_at: new Date().toISOString()
    };
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
