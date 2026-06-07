import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Note } from '../../../types';

interface PreviewContentProps {
  activeNote: Note;
  isEditing: boolean;
  editedContent: string;
  setEditedContent: (val: string) => void;
  userDisplayName: string;
}

export function PreviewContent({
  activeNote,
  isEditing,
  editedContent,
  setEditedContent,
  userDisplayName,
}: PreviewContentProps) {
  if (isEditing) {
    return (
      <div className="space-y-2">
        <label className="block text-[11px] font-black text-indigo-600 uppercase tracking-wider">Edit Note Content (Markdown Format)</label>
        <textarea 
          rows={16} value={editedContent} onChange={(e) => setEditedContent(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border-2 border-indigo-100 outline-none font-mono text-xs text-slate-800"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5 flex flex-col gap-1.5 shadow-sm">
        <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider">Note Title</span>
        <h4 className="text-lg font-black text-slate-900 tracking-tight leading-tight">{activeNote.title}</h4>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 pt-3 border-t border-slate-200/50 text-[10px] text-slate-400 font-bold font-mono">
          <div><span>CREATED BY:</span> <span className="text-slate-600 uppercase">{userDisplayName}</span></div>
          <div><span>DATE:</span> <span className="text-slate-600">{new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
          <div className="ml-auto text-indigo-500 font-extrabold"><span>Power by TELEQUIZ</span></div>
        </div>
      </div>

      <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 text-slate-800 text-sm markdown-body overflow-x-auto">
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
          {activeNote.formattedContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}
