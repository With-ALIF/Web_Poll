import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface NoteFormProps {
  title: string;
  setTitle: (val: string) => void;
  rawInput: string;
  setRawInput: (val: string) => void;
  isGenerating: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function NoteCreatorForm({
  title,
  setTitle,
  rawInput,
  setRawInput,
  isGenerating,
  onSubmit,
}: NoteFormProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-indigo-600" />
        Generate Beautiful Note
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Note Title (Optional)</label>
          <input 
            type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. BCS Chemistry Chapter 3"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-slate-800 transition-all font-medium text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Raw Content (Any Text, JSON, or CSV)</label>
          <textarea 
            rows={10} value={rawInput} onChange={(e) => setRawInput(e.target.value)} required
            placeholder="Example Raw Inputs:\n- Random unformatted lecture text or transcripts\n- [ { &quot;q&quot;: &quot;Question&quot; } ]"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-slate-800 transition-all font-mono text-xs"
          />
        </div>
        <button 
          type="submit" disabled={isGenerating || !rawInput.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
        >
          {isGenerating ? (
            <><Loader2 className="w-5 h-5 animate-spin" /><span>Generating...</span></>
          ) : (
            <><Sparkles className="w-5 h-5" /><span>Generate by TeleQuiz</span></>
          )}
        </button>
      </form>
    </div>
  );
}
