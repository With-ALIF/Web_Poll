import React from 'react';
import { FileText } from 'lucide-react';

export function NoteHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 px-2.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-semibold uppercase tracking-wider">
            New Section
          </span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="w-8 h-8 text-indigo-600" />
          Smart Note Creator
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Paste raw text, school quizzes, JSON, or CSV. Let Gemini make a beautifully structured note and send it instantly to Telegram.
        </p>
      </div>
    </div>
  );
}
