import React from 'react';
import { TelegramSettings } from '../../../../types';
import { useAuth } from '../../../auth/hooks/useAuth';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFormattingSettings } from '../../hooks/useFormattingSettings';
import PrefixSection from '../suffixprefix/PrefixSection';
import SuffixSection from '../suffixprefix/SuffixSection';

interface FormattingSettingsProps {
  settings: TelegramSettings;
  setSettings: (settings: TelegramSettings) => void;
  canEditSuffix?: boolean;
}

export default function FormattingSettings({ settings, setSettings, canEditSuffix = true }: FormattingSettingsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const {
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
  } = useFormattingSettings(settings, setSettings);

  const selectedChannel = (settings.channels || []).find(c => c.id === selectedChannelIdForFormatting);
  const activePrefixId = selectedChannelIdForFormatting === 'global' ? settings.activePrefixId : selectedChannel?.activePrefixId;
  const activeSuffixId = selectedChannelIdForFormatting === 'global' ? settings.activeSuffixId : selectedChannel?.activeSuffixId;

  return (
    <div className="space-y-8 pt-6 border-t border-slate-100">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">Message Formatting</h3>
        {!user && (
          <button 
            onClick={() => navigate('/auth')}
            className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline"
          >
            <Lock className="w-3 h-3" /> SIGN IN FOR FORMATTING
          </button>
        )}
      </div>

      {user && (settings.channels || []).length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Configure Formatting For:</label>
          <select
            value={selectedChannelIdForFormatting}
            onChange={(e) => setSelectedChannelIdForFormatting(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
          >
            <option value="global">Global Default (Used if channel has no specific formatting)</option>
            {settings.channels?.map(channel => (
              <option key={channel.id} value={channel.id}>
                {channel.name} ({channel.type})
              </option>
            ))}
          </select>
        </div>
      )}
      
      <PrefixSection 
        settings={settings}
        user={user}
        newPrefix={newPrefix}
        setNewPrefix={setNewPrefix}
        addPrefix={addPrefix}
        removePrefix={removePrefix}
        selectPrefix={selectPrefix}
        confirmDeleteId={confirmDeleteId}
        setConfirmDeleteId={setConfirmDeleteId}
        activePrefixId={activePrefixId}
        isGlobalMode={selectedChannelIdForFormatting === 'global'}
      />

      <SuffixSection 
        settings={settings}
        user={user}
        newSuffix={newSuffix}
        setNewSuffix={setNewSuffix}
        addSuffix={addSuffix}
        removeSuffix={removeSuffix}
        selectSuffix={selectSuffix}
        confirmDeleteId={confirmDeleteId}
        setConfirmDeleteId={setConfirmDeleteId}
        activeSuffixId={activeSuffixId}
        isGlobalMode={selectedChannelIdForFormatting === 'global'}
        canEditSuffix={canEditSuffix}
      />
    </div>
  );
}
