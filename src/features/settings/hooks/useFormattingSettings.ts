import { useState } from 'react';
import { TelegramSettings, SavedText } from '../../../types';

export function useFormattingSettings(settings: TelegramSettings, setSettings: (settings: TelegramSettings) => void) {
  const [newPrefix, setNewPrefix] = useState('');
  const [newSuffix, setNewSuffix] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedChannelIdForFormatting, setSelectedChannelIdForFormatting] = useState<string>('global');

  const addPrefix = () => {
    if (!newPrefix.trim()) return;
    const item: SavedText = {
      id: crypto.randomUUID(),
      content: newPrefix.trim()
    };
    
    const updatedSettings = {
      ...settings,
      prefixes: [...(settings.prefixes || []), item],
    };

    if (selectedChannelIdForFormatting === 'global') {
      updatedSettings.questionPrefix = item.content;
      updatedSettings.activePrefixId = item.id;
    } else {
      updatedSettings.channels = (settings.channels || []).map(c => 
        c.id === selectedChannelIdForFormatting ? { ...c, activePrefixId: item.id } : c
      );
    }

    setSettings(updatedSettings);
    setNewPrefix('');
  };

  const addSuffix = () => {
    if (!newSuffix.trim()) return;
    const item: SavedText = {
      id: crypto.randomUUID(),
      content: newSuffix.trim()
    };
    
    const updatedSettings = {
      ...settings,
      suffixes: [...(settings.suffixes || []), item],
    };

    if (selectedChannelIdForFormatting === 'global') {
      updatedSettings.explanationSuffix = item.content;
      updatedSettings.activeSuffixId = item.id;
    } else {
      updatedSettings.channels = (settings.channels || []).map(c => 
        c.id === selectedChannelIdForFormatting ? { ...c, activeSuffixId: item.id } : c
      );
    }

    setSettings(updatedSettings);
    setNewSuffix('');
  };

  const removePrefix = (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
      return;
    }
    const updated = (settings.prefixes || []).filter(p => p.id !== id);
    
    const updatedSettings = {
      ...settings,
      prefixes: updated,
      activePrefixId: settings.activePrefixId === id ? undefined : settings.activePrefixId,
      questionPrefix: settings.activePrefixId === id ? '' : settings.questionPrefix,
      channels: (settings.channels || []).map(c => 
        c.activePrefixId === id ? { ...c, activePrefixId: undefined } : c
      )
    };
    
    setSettings(updatedSettings);
    setConfirmDeleteId(null);
  };

  const removeSuffix = (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
      return;
    }
    const updated = (settings.suffixes || []).filter(s => s.id !== id);
    
    const updatedSettings = {
      ...settings,
      suffixes: updated,
      activeSuffixId: settings.activeSuffixId === id ? undefined : settings.activeSuffixId,
      explanationSuffix: settings.activeSuffixId === id ? '' : settings.explanationSuffix,
      channels: (settings.channels || []).map(c => 
        c.activeSuffixId === id ? { ...c, activeSuffixId: undefined } : c
      )
    };
    
    setSettings(updatedSettings);
    setConfirmDeleteId(null);
  };

  const selectPrefix = (item: SavedText | null | undefined) => {
    if (selectedChannelIdForFormatting === 'global') {
      setSettings({
        ...settings,
        questionPrefix: item ? item.content : '',
        activePrefixId: item ? item.id : undefined
      });
    } else {
      setSettings({
        ...settings,
        channels: (settings.channels || []).map(c => 
          c.id === selectedChannelIdForFormatting ? { ...c, activePrefixId: item === undefined ? undefined : (item ? item.id : 'none') } : c
        )
      });
    }
  };

  const selectSuffix = (item: SavedText | null | undefined) => {
    if (selectedChannelIdForFormatting === 'global') {
      setSettings({
        ...settings,
        explanationSuffix: item ? item.content : '',
        activeSuffixId: item ? item.id : undefined
      });
    } else {
      setSettings({
        ...settings,
        channels: (settings.channels || []).map(c => 
          c.id === selectedChannelIdForFormatting ? { ...c, activeSuffixId: item === undefined ? undefined : (item ? item.id : 'none') } : c
        )
      });
    }
  };

  return {
    newPrefix,
    setNewPrefix,
    newSuffix,
    setNewSuffix,
    confirmDeleteId,
    setConfirmDeleteId,
    selectedChannelIdForFormatting,
    setSelectedChannelIdForFormatting,
    addPrefix,
    addSuffix,
    removePrefix,
    removeSuffix,
    selectPrefix,
    selectSuffix
  };
}
