import React from 'react';
import { Wand2, Loader2, Hash } from 'lucide-react';
import ClearButton from './Clear';

interface AIQuizInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  questionCount: number;
  setQuestionCount: (count: number) => void;
  isGenerating: boolean;
  handleGenerate: () => void;
  handleGenerateMore: () => void;
  canGenerate: boolean;
}

export default function AIQuizInput({
  inputText,
  setInputText,
  questionCount,
  setQuestionCount,
  isGenerating,
  handleGenerate,
  handleGenerateMore,
  canGenerate
}: AIQuizInputProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight whitespace-nowrap">Input Text</h2>
        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full px-4 py-2 w-fit">
          <Hash className="w-4 h-4 text-slate-500" />
          <input 
            type="number"
            min="1"
            max="50"
            value={questionCount || ''} 
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setQuestionCount(isNaN(val) ? 0 : val);
            }}
            className="w-10 bg-transparent text-sm font-bold text-slate-900 outline-none text-center p-0 border-none"
          />
          <span className="text-xs font-semibold text-slate-600">Questions</span>
        </div>
      </div>
      
      <div className="relative">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your text, notes, or article here..."
          className="w-full h-72 lg:h-[calc(100vh-380px)] min-h-[280px] p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-all text-slate-800 leading-relaxed text-sm"
        />
        {inputText && (
          <div className="mt-2 flex justify-end">
            <ClearButton onClick={() => setInputText('')} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 mt-6">
        <button
          onClick={handleGenerate}
          disabled={canGenerate}
          className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 shadow-sm"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Generate
            </>
          )}
        </button>
        <button
          onClick={handleGenerateMore}
          disabled={canGenerate}
          className="w-full bg-white border border-slate-200 hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-400 text-slate-700 font-semibold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200"
        >
          <Wand2 className="w-5 h-5" />
          More
        </button>
      </div>
    </>
  );
}
