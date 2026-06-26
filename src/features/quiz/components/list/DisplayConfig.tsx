import React from 'react';
import { Type, MessageSquare } from 'lucide-react';

interface DisplayConfigProps {
  displayPrefix: string;
  displaySuffix: string;
}

export default function DisplayConfig({ displayPrefix, displaySuffix }: DisplayConfigProps) {
  if (!displayPrefix && !displaySuffix) return null;

  return (
    <div className="flex flex-col gap-3 h-full">
      {displayPrefix && (
        <div className="flex items-center gap-2.5 bg-slate-50/50 border border-slate-200/60 px-3 py-2 rounded-xl flex-1 min-w-[120px]">
          <div className="bg-blue-100/50 p-1.5 rounded-lg shrink-0">
            <Type className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex flex-col min-w-0 overflow-hidden">
            <span className="text-[8px] lg:text-[10px] uppercase tracking-wider text-slate-400 font-bold leading-none mb-1">Prefix</span>
            <span className="text-slate-600 font-bold text-xs lg:text-sm leading-tight whitespace-pre-wrap break-all">{displayPrefix}</span>
          </div>
        </div>
      )}
      {displaySuffix && (
        <div className="flex items-center gap-2.5 bg-slate-50/50 border border-slate-200/60 px-3 py-2 rounded-xl flex-1 min-w-[120px]">
          <div className="bg-purple-100/50 p-1.5 rounded-lg shrink-0">
            <MessageSquare className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex flex-col min-w-0 overflow-hidden">
            <span className="text-[8px] lg:text-[10px] uppercase tracking-wider text-slate-400 font-bold leading-none mb-1">Suffix</span>
            <span className="text-slate-600 font-bold text-xs lg:text-sm leading-tight whitespace-pre-wrap break-all">{displaySuffix}</span>
          </div>
        </div>
      )}
    </div>
  );
}
