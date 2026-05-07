import React from 'react';
import { Plus } from 'lucide-react';

interface AddSuffixInputProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
}

export default function AddSuffixInput({ value, onChange, onAdd }: AddSuffixInputProps) {
  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
      <p className="text-[10px] font-bold text-slate-400 mb-3 uppercase">Add New Suffix</p>
      <div className="flex gap-2">
        <textarea
          placeholder="Suffix Content (e.g., Join Channel, Credit)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-purple-500 resize-none h-12"
        />
        <button 
          onClick={onAdd}
          disabled={!value.trim()}
          className="px-3 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 disabled:opacity-50 transition-colors self-end"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
