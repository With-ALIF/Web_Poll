import React from 'react';
import { Edit2, FileDown, Loader2, Check, Trash2 } from 'lucide-react';
import { Note } from '../../../types';

interface PreviewHeaderProps {
  activeNote: Note;
  isEditing: boolean;
  isDownloadingPdf: boolean;
  onStartEditing: () => void;
  onDownloadPDF: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
}

export function PreviewHeader({
  activeNote,
  isEditing,
  isDownloadingPdf,
  onStartEditing,
  onDownloadPDF,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: PreviewHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
      <div className="min-w-0">
        <span className="p-1 px-2.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider">Active Note Preview</span>
        <h3 className="text-xl font-bold text-slate-900 mt-1 truncate">{activeNote.title}</h3>
      </div>

      <div className="flex items-center gap-2">
        {!isEditing ? (
          <>
            <button onClick={onStartEditing} className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-xl font-bold text-xs transition-all cursor-pointer">
              <Edit2 className="w-3.5 h-3.5" /><span>Edit Note</span>
            </button>
            <button onClick={onDownloadPDF} disabled={isDownloadingPdf} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs transition-all cursor-pointer disabled:opacity-50">
              {isDownloadingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
              <span>{isDownloadingPdf ? 'Formatting...' : 'Download PDF'}</span>
            </button>
          </>
        ) : (
          <div className="flex items-center gap-1.5">
            <button onClick={onSaveEdit} className="flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all cursor-pointer">
              <Check className="w-3.5 h-3.5" /><span>Save Changes</span>
            </button>
            <button onClick={onCancelEdit} className="px-3 py-2 bg-slate-150 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-all cursor-pointer">
              Cancel
            </button>
          </div>
        )}
        <button onClick={() => onDelete(activeNote.id)} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all hover:scale-105" title="Delete Note">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
