import React from 'react';
import { AlertCircle } from 'lucide-react';

interface NoteAlertProps {
  message: { type: 'success' | 'error'; text: string } | null;
  onClear: () => void;
}

export function NoteAlert({ message, onClear }: NoteAlertProps) {
  if (!message) return null;

  return (
    <div 
      className={`p-4 rounded-xl mb-6 flex items-start gap-3 border ${
        message.type === 'success' 
          ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
          : 'bg-rose-50 border-rose-100 text-rose-800'
      }`}
    >
      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1 text-sm font-medium">{message.text}</div>
      <button onClick={onClear} className="text-xs font-bold hover:underline">Dismiss</button>
    </div>
  );
}
