import { useState, useEffect, useMemo } from 'react';
import { TelegramSettings } from '../../../types';
import { useAuth } from '../../auth/hooks/useAuth';
import { fetchSettings, saveSettings as saveSettingsToBackend } from '../services/settingsService';
import { fetchAppConfig } from '../../admin/services/adminSettingsService';
import { DEFAULT_SUFFIX } from '../constants';

export function useSettings() {
  const { user, isAdmin, appConfig } = useAuth();
  const [globalDefaultSuffix, setGlobalDefaultSuffix] = useState(DEFAULT_SUFFIX);
  const [settings, setSettings] = useState<TelegramSettings>({ 
    botToken: '', 
    channels: [],
    activeChannelId: '',
    questionPrefix: '',
    explanationSuffix: DEFAULT_SUFFIX,
    prefixes: [],
    suffixes: []
  });

  const canEditSuffix = isAdmin || user?.permissions?.includes('suffix-edit');

  useEffect(() => {
    const currentDefault = appConfig?.defaultSuffix || DEFAULT_SUFFIX;
    setGlobalDefaultSuffix(currentDefault);

    const loadSettings = async () => {
      if (user) {
        // Load from Firestore
        try {
          const data = await fetchSettings(user.uid);
          if (data) {
            // Apply default suffix if missing or if user cannot edit
            const finalizedData = {
              ...data,
              explanationSuffix: (canEditSuffix && data.explanationSuffix) ? data.explanationSuffix : currentDefault
            };
            setSettings(finalizedData);
          } else {
            // If no settings in Firestore, check local storage and migrate
            loadFromLocalAndMigrate(currentDefault);
          }
        } catch (error) {
          console.error("Error loading settings from Firestore", error);
          loadFromLocalAndMigrate(currentDefault);
        }
      } else {
        // Load from Local Storage
        loadFromLocalAndMigrate(currentDefault);
      }
    };

    const loadFromLocalAndMigrate = (defSuffixValue: string) => {
      const savedSettings = localStorage.getItem('telegramQuizSettings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          
          // Migration from legacy chatId to channels
          if (parsed.chatId && (!parsed.channels || parsed.channels.length === 0)) {
            parsed.channels = [{ id: parsed.chatId, name: parsed.chatId, type: 'channel' }];
            parsed.activeChannelId = parsed.chatId;
            delete parsed.chatId;
          }
          
          if (!parsed.channels) parsed.channels = [];
          if (!parsed.activeChannelId && parsed.channels.length > 0) {
            parsed.activeChannelId = parsed.channels[0].id;
          }
          
          // Ensure default suffix if missing
          if (!parsed.explanationSuffix) {
            parsed.explanationSuffix = defSuffixValue;
          }
          
          setSettings(parsed);
          
          // If user is logged in but didn't have Firestore settings, save them now
          if (user) {
             saveSettingsToBackend(user.uid, parsed);
          }
        } catch (e) {
          console.error("Failed to parse settings", e);
        }
      } else {
        // Initial state with dynamic default
        setSettings(prev => ({ ...prev, explanationSuffix: defSuffixValue }));
      }
    };

    loadSettings();
  }, [user?.uid, appConfig, canEditSuffix]);

  const effectiveSettings = useMemo(() => {
    if (canEditSuffix) return settings;
    return {
      ...settings,
      explanationSuffix: globalDefaultSuffix
    };
  }, [settings, canEditSuffix, globalDefaultSuffix]);

  const saveSettings = (newSettings: TelegramSettings) => {
    // If restricted, preserve the default suffix regardless of what was attempted to be saved
    const settingsToSave = canEditSuffix ? newSettings : { ...newSettings, explanationSuffix: globalDefaultSuffix };
    
    setSettings(settingsToSave);
    localStorage.setItem('telegramQuizSettings', JSON.stringify(settingsToSave));
    if (user) {
      saveSettingsToBackend(user.uid, settingsToSave);
    }
  };

  return useMemo(() => ({
    settings: effectiveSettings,
    setSettings,
    saveSettings,
    canEditSuffix
  }), [effectiveSettings, canEditSuffix]);
}
