import React from 'react';
import { TelegramSettings } from '../../../../types';
import { LayoutTemplate } from 'lucide-react';
import ChannelCard from './ChannelCard';
import UnusedFormats from '../formatting/UnusedFormats';

interface Props {
  settings: TelegramSettings;
}

export default function ChannelFormattingOverview({ settings }: Props) {
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-indigo-100 p-3 rounded-2xl shadow-sm">
          <LayoutTemplate className="w-7 h-7 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Channel Formats</h1>
          <p className="text-sm text-slate-500 mt-1">Overview of prefixes and suffixes configured for all channels</p>
        </div>
      </div>

      {settings.channels && settings.channels.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {settings.channels.map(channel => (
            <ChannelCard key={channel.id} channel={channel} settings={settings} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="bg-slate-50 p-4 rounded-full">
              <LayoutTemplate className="w-12 h-12 text-slate-300" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-700">No channels configured yet</p>
              <p className="text-sm text-slate-500 mt-1">Add channels in Settings to see their formatting overview here.</p>
            </div>
          </div>
        </div>
      )}

      <UnusedFormats settings={settings} />
    </div>
  );
}
