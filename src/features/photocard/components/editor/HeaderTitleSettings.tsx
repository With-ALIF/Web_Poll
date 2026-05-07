import React from 'react';
import { Type } from 'lucide-react';
import { EditorProps } from './types';

export const HeaderTitleSettings: React.FC<EditorProps> = ({ data, handleChange }) => {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1.5 px-1">
        <Type size={10} className="text-blue-500" />
        হেডার টাইটেল
      </label>
      <input 
        name="headerTitle"
        value={data.headerTitle || ""}
        onChange={handleChange}
        onFocus={(e) => e.target.select()}
        className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
        placeholder="প্রিমিয়াম কোর্স এ ভর্তি চলছে.."
      />
    </div>
  );
};
