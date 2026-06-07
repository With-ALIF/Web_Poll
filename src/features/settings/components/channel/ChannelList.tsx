import React from 'react';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TelegramSettings } from '../../../../types';
import ChannelItem from './ChannelItem';

interface ChannelListProps {
  settings: TelegramSettings;
  user: any;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  confirmRemoveId: string | null;
  setConfirmRemoveId: (id: string | null) => void;
}

export default function ChannelList({
  settings,
  user,
  onToggle,
  onRemove,
  confirmRemoveId,
  setConfirmRemoveId
}: ChannelListProps) {
  const navigate = useNavigate();

  if (!settings.channels || settings.channels.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-slate-500">
          {user ? 'Select channels to send polls to:' : 'Your configured channels:'}
        </p>
        {!user && (
          <button 
            onClick={() => navigate('/auth')}
            className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline"
          >
            <Lock className="w-3 h-3" /> SIGN IN FOR MULTI-CHANNEL
          </button>
        )}
      </div>
      {settings.channels.map(channel => (
        <ChannelItem 
          key={channel.id}
          channel={channel}
          user={user}
          isSelected={(settings.selectedChannelIds || []).includes(channel.id)}
          onToggle={onToggle}
          onRemove={onRemove}
          confirmRemoveId={confirmRemoveId}
          setConfirmRemoveId={setConfirmRemoveId}
        />
      ))}
    </div>
  );
}
