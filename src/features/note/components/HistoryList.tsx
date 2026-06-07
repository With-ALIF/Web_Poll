import React from 'react';
import { History, Loader2, FileCode } from 'lucide-react';
import { Note } from '../../../types';

interface HistoryListProps {
  loadingNotes: boolean;
  notes: Note[];
  activeNote: Note | null;
  onSelect: (note: Note) => void;
}

export function HistoryList({ loadingNotes, notes, activeNote, onSelect }: HistoryListProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 p-6 flex-1 min-h-[300px] flex flex-col">
      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <History className="w-5 h-5 text-slate-400" />
        Your Notes History
      </h2>

      {loadingNotes ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="text-xs font-medium">Loading history...</span>
        </div>
      ) : notes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-100 rounded-2xl text-center">
          <FileCode className="w-10 h-10 text-slate-300 mb-2" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No notes generated yet</p>
          <p className="text-[11px] text-slate-400 mt-1">Submit content above to save your first beautiful note.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2 max-h-[350px] pr-1">
          {notes.map((note) => (
            <button 
              key={note.id}
              onClick={() => onSelect(note)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                activeNote?.id === note.id 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-950 shadow-sm' 
                  : 'bg-white border-slate-100 hover:border-slate-200 text-slate-700'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate">{note.title}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate font-mono">
                  {note.rawInput.substring(0, 40)}...
                </p>
              </div>
              {note.status === 'sent' && (
                <span className="p-1 px-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-md uppercase tracking-wider scale-95 shrink-0">SENT</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
