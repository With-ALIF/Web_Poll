import React from 'react';
import { Plus } from 'lucide-react';

interface AddPrefixInputProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
}

export default function AddPrefixInput({ value, onChange, onAdd }: AddPrefixInputProps) {
  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
      <p className="text-[10px] font-bold text-slate-400 mb-3 uppercase">Add New Prefix</p>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Prefix Content (e.g., SOT, Daily Quiz)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          onClick={onAdd}
          disabled={!value.trim()}
          className="px-3 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 disabled:opacity-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
