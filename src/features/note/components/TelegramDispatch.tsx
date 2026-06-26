import React from 'react';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import { TelegramSettings } from '../../../types';

interface TelegramDispatchProps {
  settings: TelegramSettings;
  selectedChannelId: string;
  setSelectedChannelId: (val: string) => void;
  isSending: boolean;
  isEditing: boolean;
  onSend: () => void;
  fixedBotToken: string;
}

export function TelegramDispatch({
  settings,
  selectedChannelId,
  setSelectedChannelId,
  isSending,
  isEditing,
  onSend,
  fixedBotToken,
}: TelegramDispatchProps) {
  const hasBotToken = !!fixedBotToken;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-2xl p-5 border border-indigo-100/50 mt-4">
      <h4 className="text-sm font-bold text-indigo-950 mb-1 flex items-center gap-1.5">
        <Send className="w-4 h-4 text-indigo-600" />Send Directly to Telegram Channel
      </h4>
      <p className="text-[11px] text-indigo-900/60 leading-normal mb-4">
        Send this beautiful formatted layout instantly. Select from your preset channels as declared in your settings.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <select 
            value={selectedChannelId} onChange={(e) => setSelectedChannelId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-200/60 bg-white text-xs font-semibold text-slate-800 outline-none"
            disabled={!settings.channels || settings.channels.length === 0}
          >
            {settings.channels && settings.channels.length > 0 ? (
              settings.channels.map((chan) => (
                <option key={chan.id} value={chan.id}>📢 {chan.name} ({chan.id})</option>
              ))
            ) : (
              <option value="">No channels available</option>
            )}
          </select>
        </div>
        <button 
          onClick={onSend} disabled={isSending || isEditing || !selectedChannelId || !hasBotToken}
          className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-slate-900 text-white text-xs font-black rounded-xl transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSending ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Sending Now...</span></>
          ) : (
            <><Send className="w-3.5 h-3.5" /><span>Send Telegram</span></>
          )}
        </button>
      </div>
      {!hasBotToken && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-rose-600">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Bot Token is missing. Configure your Telegram Bot in your Account Settings!</span>
        </div>
      )}
    </div>
  );
}
