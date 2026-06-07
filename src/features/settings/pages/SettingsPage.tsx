import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TelegramSettings } from '../../../types';
import { useAuth } from '../../auth/hooks/useAuth';
import { useChannelManager } from '../hooks/useChannelManager';
import FormattingSettings from '../components/formatting/FormattingSettings';
import ChannelManager from '../components/channel/ChannelManager';
import SettingsFooter from '../components/shared/SettingsFooter';

interface SettingsPageProps {
  settings: TelegramSettings;
  setSettings: (settings: TelegramSettings) => void;
  saveSettings: (settings: TelegramSettings) => void;
  botToken: string;
  canEditSuffix?: boolean;
}

export default function SettingsPage({
  settings,
  setSettings,
  saveSettings,
  botToken,
  canEditSuffix = true
}: SettingsPageProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const {
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
  } = useChannelManager(settings, saveSettings, botToken);

  const handleSave = () => {
    saveSettings(settings);
    // Removed navigate('/') to keep user on the settings page
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-slate-800">Telegram Configuration</h1>
          <p className="text-slate-500 mt-2">Configure your bot to send quizzes.</p>
        </div>
        
        <div className="p-6 sm:p-8 space-y-8">
          <ChannelManager 
            settings={settings}
            user={user}
            newChatId={newChatId}
            setNewChatId={setNewChatId}
            chatInfo={chatInfo}
            chatError={chatError}
            isCheckingChat={isCheckingChat}
            confirmRemoveId={confirmRemoveId}
            setConfirmRemoveId={setConfirmRemoveId}
            onAdd={handleAddChannel}
            onRemove={removeChannel}
            onToggle={toggleChannelSelection}
          />

          <FormattingSettings settings={settings} setSettings={saveSettings} canEditSuffix={canEditSuffix} />
        </div>

        <SettingsFooter onSave={handleSave} onLogout={logout} />
      </div>
    </div>
  );
}
