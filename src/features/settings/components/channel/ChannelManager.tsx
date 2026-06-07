import React from 'react';
import { Loader2, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { TelegramSettings } from '../../../../types';
import ChannelList from './ChannelList';

interface ChannelManagerProps {
  settings: TelegramSettings;
  user: any;
  newChatId: string;
  setNewChatId: (val: string) => void;
  chatInfo: { name: string; type: string } | null;
  chatError: string | null;
  isCheckingChat: boolean;
  confirmRemoveId: string | null;
  setConfirmRemoveId: (id: string | null) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
}

export default function ChannelManager({
  settings,
  user,
  newChatId,
  setNewChatId,
  chatInfo,
  chatError,
  isCheckingChat,
  confirmRemoveId,
  setConfirmRemoveId,
  onAdd,
  onRemove,
  onToggle
}: ChannelManagerProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">Manage Channels / Groups</label>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newChatId}
          onChange={(e) => setNewChatId(e.target.value)}
          placeholder="@yourchannel or -1001234567890"
          className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm transition-all"
        />
        <button
          onClick={onAdd}
          disabled={isCheckingChat || !newChatId.trim()}
          className="px-5 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isCheckingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add
        </button>
      </div>
      
      {chatInfo && (
        <p className="text-sm text-green-600 mb-4 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" /> Successfully added {chatInfo.type}: <strong>{chatInfo.name}</strong>
        </p>
      )}
      {chatError && (
        <p className="text-sm text-red-500 mb-4 flex items-start gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> 
          <span className="leading-snug">{chatError}</span>
        </p>
      )}

      <ChannelList 
        settings={settings}
        user={user}
        onToggle={onToggle}
        onRemove={onRemove}
        confirmRemoveId={confirmRemoveId}
        setConfirmRemoveId={setConfirmRemoveId}
      />
    </div>
  );
}
