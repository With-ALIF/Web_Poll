import React from 'react';
import { Type, MessageSquare } from 'lucide-react';
import { TelegramSettings } from '../../../../types';
import FormatDisplay from '../formatting/FormatDisplay';

interface ChannelCardProps {
  key?: string;
  channel: any;
  settings: TelegramSettings;
}

export default function ChannelCard({ channel, settings }: ChannelCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-md">
      {/* Left side: Channel Info */}
      <div className="p-5 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50 flex flex-col justify-center">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-bold text-slate-800 text-lg leading-snug">{channel.name}</h3>
          <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-md uppercase font-bold tracking-wider shrink-0 mt-1">
            {channel.type}
          </span>
        </div>
        <div className="inline-flex items-center">
          <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-mono text-xs text-slate-500 shadow-sm">
            {channel.id}
          </span>
        </div>
      </div>

      {/* Right side: Prefix & Suffix */}
      <div className="p-5 md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-5">
        
        {/* Prefix Box */}
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="bg-blue-50 p-1.5 rounded-lg">
              <Type className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prefix</span>
          </div>
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 flex-1 text-sm shadow-inner">
            <FormatDisplay type="prefix" channelFormatId={channel.activePrefixId} settings={settings} />
          </div>
        </div>

        {/* Suffix Box */}
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="bg-purple-50 p-1.5 rounded-lg">
              <MessageSquare className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Suffix</span>
          </div>
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 flex-1 text-sm shadow-inner">
            <FormatDisplay type="suffix" channelFormatId={channel.activeSuffixId} settings={settings} />
          </div>
        </div>

      </div>
    </div>
  );
}
