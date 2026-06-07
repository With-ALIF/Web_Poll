import React from 'react';
import { Trash2 } from 'lucide-react';
import { TelegramChannel } from '../../../../types';

interface ChannelItemProps {
  key?: string | number;
  channel: TelegramChannel;
  user: any;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  confirmRemoveId: string | null;
  setConfirmRemoveId: (id: string | null) => void;
}

export default function ChannelItem({
  channel,
  user,
  isSelected,
  onToggle,
  onRemove,
  confirmRemoveId,
  setConfirmRemoveId
}: ChannelItemProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
      {user && (
        <input 
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(channel.id)}
          className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      )}
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-800">{channel.name}</p>
        <p className="text-xs text-slate-500 font-mono mt-0.5">{channel.id}</p>
      </div>
      {confirmRemoveId === channel.id ? (
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg shadow-sm border border-slate-200">
          <button 
            onClick={() => setConfirmRemoveId(null)}
            className="text-[10px] font-bold text-slate-500 hover:bg-slate-100 px-2 py-1 rounded transition-colors"
          >
            No
          </button>
          <button 
            onClick={() => onRemove(channel.id)}
            className="text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded transition-colors"
          >
            Yes
          </button>
        </div>
      ) : (
        <button 
          onClick={() => onRemove(channel.id)} 
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
          title="Remove channel"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
