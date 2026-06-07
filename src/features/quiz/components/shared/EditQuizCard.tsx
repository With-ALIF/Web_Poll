import React from 'react';
import { X, Save } from 'lucide-react';

interface EditQuizCardProps {
  children: React.ReactNode;
  onCancel: () => void;
  onSave: () => void;
}

export default function EditQuizCard({ children, onCancel, onSave }: EditQuizCardProps) {
  return (
    <div className="space-y-4">
      {children}
      
      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-1"
        >
          <X className="w-4 h-4" /> Cancel
        </button>
        <button
          onClick={onSave}
          className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center gap-1"
        >
          <Save className="w-4 h-4" /> Save
        </button>
      </div>
    </div>
  );
}
