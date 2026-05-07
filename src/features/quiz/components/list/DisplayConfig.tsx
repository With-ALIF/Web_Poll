import React from 'react';
import { Type, MessageSquare } from 'lucide-react';

interface DisplayConfigProps {
  displayPrefix: string;
  displaySuffix: string;
}

export default function DisplayConfig({ displayPrefix, displaySuffix }: DisplayConfigProps) {
  if (!displayPrefix && !displaySuffix) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {displayPrefix && (
        <div className="flex items-center gap-2 bg-white border border-slate-200/80 shadow-sm px-2.5 py-1.5 rounded-xl flex-1 min-w-0">
          <div className="bg-blue-50 p-1 rounded-lg shrink-0">
            <Type className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold leading-none mb-0.5">Prefix</span>
            <span className="text-slate-700 font-bold text-[10px] leading-tight truncate">{displayPrefix}</span>
          </div>
        </div>
      )}
      {displaySuffix && (
        <div className="flex items-center gap-2 bg-white border border-slate-200/80 shadow-sm px-2.5 py-1.5 rounded-xl flex-1 min-w-0">
          <div className="bg-purple-50 p-1 rounded-lg shrink-0">
            <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold leading-none mb-0.5">Suffix</span>
            <span className="text-slate-700 font-bold text-[10px] leading-tight truncate">{displaySuffix}</span>
          </div>
        </div>
      )}
    </div>
  );
}
