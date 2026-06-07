import React from 'react';
import { Hash } from 'lucide-react';

interface OCRHeaderProps {
  questionCount: number;
  setQuestionCount: (count: number) => void;
}

export const OCRHeader: React.FC<OCRHeaderProps> = ({ questionCount, setQuestionCount }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight whitespace-nowrap">OCR Scan</h2>
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
  );
};
