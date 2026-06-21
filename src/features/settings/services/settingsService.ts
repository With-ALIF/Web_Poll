import { supabase } from '../../../lib/supabase';
import { TelegramSettings } from '../../../types';

const TABLE_NAME = 'settings';

export const fetchSettings = async (userId: string) => {
  try {
    console.log("Fetching settings for:", userId);
    // Try with 'user_id' first
    let { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId)
      .single();

    // If 'user_id' column doesn't exist, try 'id'
    if (error && error.message?.includes('user_id')) {
      const fallback = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('id', userId)
        .single();
      data = fallback.data;
      error = fallback.error;
    }

    if (error && error.code !== 'PGRST116') throw error;
    
    if (data) {
      // Use consistent key seen in useSettings
      localStorage.setItem('telegramQuizSettings', JSON.stringify(data));
      return data as TelegramSettings;
    }
    return null;
  } catch (error: any) {
    console.error("Error in fetchSettings:", error);
    const cached = localStorage.getItem('telegramQuizSettings');
    if (cached) return JSON.parse(cached);
    return null;
  }
};

export const saveSettings = async (userId: string, settings: TelegramSettings) => {
  try {
    console.log("Saving settings for:", userId);
    
    // Explicitly pick fields that belong to the table schema to avoid failures due to extra JS-only fields
    const {
      botToken,
      chatId,
      channels,
      activeChannelId,
      selectedChannelIds,
      questionPrefix,
      explanationSuffix,
      prefixes,
      suffixes,
      activePrefixId,
      activeSuffixId
    } = settings;

    const baseData = {
      botToken,
      chatId,
      channels: channels || [],
      activeChannelId,
      selectedChannelIds: selectedChannelIds || [],
      questionPrefix,
      explanationSuffix,
      prefixes: prefixes || [],
      suffixes: suffixes || [],
      activePrefixId,
      activeSuffixId,
      updated_at: new Date().toISOString()
    };
    
    // Try saving with user_id
    let { error } = await supabase
      .from(TABLE_NAME)
      .upsert({ ...baseData, user_id: userId }, { onConflict: 'user_id' });

    // If 'user_id' doesn't exist, fallback to 'id'
    if (error && error.message?.includes('user_id')) {
      const fallback = await supabase
        .from(TABLE_NAME)
        .upsert({ ...baseData, id: userId }, { onConflict: 'id' });
      error = fallback.error;
    }

    if (error) throw error;
    console.log("Settings saved successfully to database");
  } catch (error) {
    console.error("Error in saveSettings backend call:", error);
  }
};
