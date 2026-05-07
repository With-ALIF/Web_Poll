import React from 'react';
import { ListChecks } from 'lucide-react';
import { EditorProps } from './types';

export const OptionsSettings: React.FC<EditorProps> = ({ data, handleChange }) => {
  return (
    <div className="space-y-4 pt-4 border-t border-gray-100">
      <div className="flex items-center gap-2 px-1">
        <div className="w-6 h-6 rounded-lg bg-gray-950 flex items-center justify-center text-white">
          <ListChecks size={14} />
        </div>
        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">অপশনসমূহ</label>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {Object.keys(data.options).map((key) => (
          <div key={key} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-950 flex items-center justify-center text-white text-sm font-black uppercase shadow-lg shadow-gray-200 shrink-0">
              {key}
            </div>
            <input 
              name={`opt-${key}`}
              value={(data.options as any)[key]}
              onChange={handleChange}
              onFocus={(e) => e.target.select()}
              className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
              placeholder={`অপশন ${key.toUpperCase()}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
