import React from 'react';
import { TelegramSettings } from '../../../../types';

interface FormatDisplayProps {
  type: 'prefix' | 'suffix';
  channelFormatId?: string;
  settings: TelegramSettings;
}

export default function FormatDisplay({ type, channelFormatId, settings }: FormatDisplayProps) {
  if (channelFormatId === 'none') {
    return <span className="text-slate-400 italic font-medium">None</span>;
  }

  if (channelFormatId) {
    const format = type === 'prefix' 
      ? settings.prefixes?.find(p => p.id === channelFormatId)
      : settings.suffixes?.find(s => s.id === channelFormatId);
      
    return format ? (
      <span className={`font-medium whitespace-pre-wrap ${type === 'prefix' ? 'text-blue-700' : 'text-purple-700'}`}>
        {format.content}
      </span>
    ) : (
      <span className="text-red-400 italic">Not found</span>
    );
  }

  // Fallback to global
  const globalFormat = type === 'prefix' ? settings.questionPrefix : settings.explanationSuffix;
  
  return (
    <div className="flex flex-col gap-1 items-start">
      <span className="text-slate-700 whitespace-pre-wrap font-medium">
        {globalFormat ? globalFormat : <span className="text-slate-400 italic font-normal">None</span>}
      </span>
      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
        Global Default
      </span>
    </div>
  );
}
