import React from 'react';
import { LayoutTemplate, Type, MessageSquare } from 'lucide-react';
import { TelegramSettings } from '../../../../types';
import { useFormatUtils } from '../../hooks/useFormatUtils';

interface UnusedFormatsProps {
  settings: TelegramSettings;
}

export default function UnusedFormats({ settings }: UnusedFormatsProps) {
  const { unusedPrefixes, unusedSuffixes } = useFormatUtils(settings);

  if (unusedPrefixes.length === 0 && unusedSuffixes.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <LayoutTemplate className="w-5 h-5 text-slate-400" />
        Unused Formats
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Unused Prefixes */}
        {unusedPrefixes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center gap-2">
              <Type className="w-4 h-4 text-blue-500" />
              <h3 className="font-bold text-slate-700">Unused Prefixes</h3>
              <span className="ml-auto bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">
                {unusedPrefixes.length}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {unusedPrefixes.map(prefix => (
                <div key={prefix.id} className="p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">ID: {prefix.id}</p>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-600 whitespace-pre-wrap">
                    {prefix.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unused Suffixes */}
        {unusedSuffixes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-500" />
              <h3 className="font-bold text-slate-700">Unused Suffixes</h3>
              <span className="ml-auto bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">
                {unusedSuffixes.length}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {unusedSuffixes.map(suffix => (
                <div key={suffix.id} className="p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">ID: {suffix.id}</p>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-600 whitespace-pre-wrap">
                    {suffix.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
