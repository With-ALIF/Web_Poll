import { useState } from 'react';
import { TelegramSettings } from '../../../types';
import { getChatDetails } from '../../quiz/services/telegramChatService';

export function useChannelManager(
  settings: TelegramSettings,
  setSettings: (settings: TelegramSettings) => void,
  botToken: string
) {
  const [newChatId, setNewChatId] = useState('');
  const [chatInfo, setChatInfo] = useState<{ name: string; type: string } | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isCheckingChat, setIsCheckingChat] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const handleAddChannel = async () => {
    if (!newChatId.trim()) return;
    setIsCheckingChat(true);
    setChatError(null);
    setChatInfo(null);
    
    try {
      const details = await getChatDetails(newChatId, botToken);
      if (details) {
        const name = details.title || [details.first_name, details.last_name].filter(Boolean).join(' ') || 'Unknown';
        const newChannel = { id: newChatId.trim(), name, type: details.type };
        
        // Check if already exists
        const exists = (settings.channels || []).find(c => c.id === newChannel.id);
        if (exists) {
          setChatError('This channel/group is already added.');
          return;
        }

        const updatedChannels = [...(settings.channels || []), newChannel];
        const updatedSelected = [...(settings.selectedChannelIds || []), newChannel.id];
        setSettings({
          ...settings,
          channels: updatedChannels,
          activeChannelId: settings.activeChannelId || newChannel.id,
          selectedChannelIds: updatedSelected
        });
        setNewChatId('');
        setChatInfo({ name, type: details.type });
        setTimeout(() => setChatInfo(null), 3000);
      }
    } catch (err: any) {
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('forbidden') || msg.includes('not a member') || msg.includes('kicked')) {
        setChatError('আইডি সঠিক, কিন্তু বটটি এই চ্যানেল/গ্রুপে যুক্ত নেই! দয়া করে বটটিকে Admin হিসেবে যুক্ত করুন।');
      } else if (msg.includes('chat not found')) {
        setChatError('Chat ID টি সঠিক নয় অথবা বটটি এখনও স্টার্ট/যুক্ত করা হয়নি।');
      } else {
        setChatError(err.message || 'Could not find chat');
      }
    } finally {
      setIsCheckingChat(false);
    }
  };

  const removeChannel = (idToRemove: string) => {
    if (confirmRemoveId !== idToRemove) {
      setConfirmRemoveId(idToRemove);
      setTimeout(() => setConfirmRemoveId(null), 3000);
      return;
    }
    const updatedChannels = (settings.channels || []).filter(c => c.id !== idToRemove);
    const updatedSelected = (settings.selectedChannelIds || []).filter(id => id !== idToRemove);
    setSettings({
      ...settings,
      channels: updatedChannels,
      activeChannelId: settings.activeChannelId === idToRemove 
        ? (updatedChannels[0]?.id || '') 
        : settings.activeChannelId,
      selectedChannelIds: updatedSelected
    });
    setConfirmRemoveId(null);
  };

  const toggleChannelSelection = (id: string) => {
    const currentSelected = settings.selectedChannelIds || [];
    const updatedSelected = currentSelected.includes(id)
      ? currentSelected.filter(i => i !== id)
      : [...currentSelected, id];
    
    setSettings({
      ...settings,
      selectedChannelIds: updatedSelected
    });
  };

  return {
    newChatId,
    setNewChatId,
    chatInfo,
    chatError,
    isCheckingChat,
    confirmRemoveId,
    setConfirmRemoveId,
    handleAddChannel,
    removeChannel,
    toggleChannelSelection
  };
}
