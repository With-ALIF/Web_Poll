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
  preserveBoardInfo?: boolean;
  setPreserveBoardInfo?: (val: boolean) => void;
}

export default function AIQuizInput({
  inputText,
  setInputText,
  questionCount,
  setQuestionCount,
  isGenerating,
  handleGenerate,
  handleGenerateMore,
  canGenerate,
  preserveBoardInfo = true,
  setPreserveBoardInfo
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

      <div className="mb-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-base select-none shrink-0 text-indigo-600">✨</span>
            <span className="text-xs font-extrabold text-indigo-950 uppercase tracking-wide">বোর্ড ও ভার্সিটি নাম সংরক্ষণ</span>
          </div>
          <button
            type="button"
            onClick={() => setPreserveBoardInfo?.(!preserveBoardInfo)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              preserveBoardInfo ? 'bg-[#2C4B9B]' : 'bg-slate-200'
            }`}
            aria-label="Preserve board info toggle"
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                preserveBoardInfo ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <p className="text-xs text-indigo-900/80 leading-relaxed font-semibold">
          প্রশ্নের শেষে থাকা বোর্ড/ভার্সিটির নাম বা সাল (যেমন: <code className="bg-indigo-100/50 px-1 py-0.5 rounded font-mono text-indigo-700 text-[10px]">[দিনাজপুর বোর্ড ২০২৩]</code> বা <code className="bg-indigo-100/50 px-1 py-0.5 rounded font-mono text-indigo-700 text-[10px]">Ac.QBদিনাজপুর বোর্ড2023</code>) জেনারেশনের সময় অবিকল বজায় রাখতে চান কি? {preserveBoardInfo ? <span className="text-indigo-700 font-extrabold">হ্যাঁ, যুক্ত হবে।</span> : <span className="text-slate-500 font-extrabold">না, স্বয়ংক্রিয়ভাবে মুছে যাবে।</span>}
        </p>
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
