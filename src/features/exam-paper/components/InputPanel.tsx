/* src/features/exam-paper/components/InputPanel.tsx */
import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface InputPanelProps {
  inputText: string;
  setInputText: (text: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({ inputText, setInputText, onGenerate, isGenerating }) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Content Text / Source</label>
        <textarea 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste text, notes, or article content here..."
          className="w-full h-64 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2C4B9B]/20 transition-all resize-none font-medium leading-relaxed"
        />
      </div>

      <button
        onClick={onGenerate}
        disabled={isGenerating || !inputText}
        className="w-full py-4 bg-[#2C4B9B] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#1e3675] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-blue-500/10 active:scale-[0.98]"
      >
        {isGenerating ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Generating Exam Paper...</>
        ) : (
          <><Sparkles className="w-5 h-5" /> Generate Exam Paper</>
        )}
      </button>
    </div>
  );
};
