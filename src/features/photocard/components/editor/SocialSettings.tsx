import React from 'react';
import { Send, Facebook } from 'lucide-react';
import { EditorProps } from './types';

export const SocialSettings: React.FC<EditorProps> = ({ data, onChange, handleChange }) => {
  const tgPresets = ["STUDY ON TELEGRAM", "SOT ACADEMY", "Telegram", ""];
  const fbPresets = ["ADMISSION NEWS BY SOT", "Facebook", ""];
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-100">
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1.5 px-1">
          <Send size={10} className="text-blue-500" />
          টেলিগ্রাম নাম
        </label>
        <select
          value={tgPresets.includes(data.telegramName || "") ? data.telegramName || "" : "other"}
          onChange={(e) => onChange({ ...data, telegramName: e.target.value === 'other' ? 'Custom Channel' : e.target.value })}
          className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none mb-1 transition-all"
        >
          <option value="STUDY ON TELEGRAM">STUDY ON TELEGRAM</option>
          <option value="SOT ACADEMY">SOT ACADEMY</option>
          <option value="Telegram">Telegram Option</option>
          <option value="">(None)</option>
          <option value="other">Other (Custom)...</option>
        </select>
        {!tgPresets.includes(data.telegramName || "") && (
          <input name="telegramName" value={data.telegramName || ""} onChange={handleChange} onFocus={(e) => e.target.select()} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none mt-1 animate-in slide-in-from-top-1" placeholder="Enter Telegram Name" />
        )}
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1.5 px-1">
          <Facebook size={10} className="text-blue-600" />
          ফেসবুক নাম
        </label>
        <select
          value={fbPresets.includes(data.facebookName || "") ? data.facebookName || "" : "other"}
          onChange={(e) => onChange({ ...data, facebookName: e.target.value === 'other' ? 'Custom Page' : e.target.value })}
          className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none mb-1 transition-all"
        >
          <option value="ADMISSION NEWS BY SOT">ADMISSION NEWS BY SOT</option>
          <option value="Facebook">Facebook Option</option>
          <option value="">(None)</option>
          <option value="other">Other (Custom)...</option>
        </select>
        {!fbPresets.includes(data.facebookName || "") && (
          <input name="facebookName" value={data.facebookName || ""} onChange={handleChange} onFocus={(e) => e.target.select()} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none mt-1 animate-in slide-in-from-top-1" placeholder="Enter Facebook Name" />
        )}
      </div>
    </div>
  );
};
