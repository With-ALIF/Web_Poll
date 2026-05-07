import React from 'react';
import { Trash2 } from 'lucide-react';

interface ClearButtonProps {
  onClick: () => void;
  className?: string;
}

export default function ClearButton({ onClick, className = "" }: ClearButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-600 hover:text-red-600 rounded-xl text-sm font-semibold transition-all duration-200 ${className}`}
      title="Clear text"
    >
      <Trash2 className="w-4 h-4" />
      Clear
    </button>
  );
}
