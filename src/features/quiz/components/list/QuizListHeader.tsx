import React from 'react';
import { Wand2, Send } from 'lucide-react';

interface QuizListHeaderProps {
  totalQuestions: number;
  stats: { generated: number; sent: number };
  title?: string;
  sentLabel?: string;
  sentValue?: number;
  showGeneratedStat?: boolean;
  children?: React.ReactNode;
}

export default function QuizListHeader({ 
  totalQuestions, 
  stats, 
  title = "Generated Quizzes",
  sentLabel = "Sent",
  sentValue,
  showGeneratedStat = true,
  children 
}: QuizListHeaderProps) {
  return (
    <div className="mb-6 space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
        {title}
        <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs py-1 px-2.5 rounded-full font-semibold shadow-sm">
          {totalQuestions}
        </span>
      </h2>
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-slate-500 font-medium">
          {showGeneratedStat && (
            <div className="flex items-center gap-2 border border-slate-200 px-2.5 py-1.5 rounded-xl bg-white shadow-sm flex-1 sm:flex-none min-w-[110px]">
              <div className="bg-indigo-50 p-1.5 rounded-lg">
                <Wand2 className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-indigo-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] lg:text-[11px] uppercase tracking-wider text-slate-400 font-bold leading-none mb-1">Generated</span>
                <span className="text-slate-700 font-bold text-xs lg:text-sm leading-none">{stats.generated}</span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 border border-slate-200 px-2.5 py-1.5 rounded-xl bg-white shadow-sm flex-1 sm:flex-none min-w-[110px]">
            <div className="bg-green-50 p-1.5 rounded-lg">
              <Send className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-green-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] lg:text-[11px] uppercase tracking-wider text-slate-400 font-bold leading-none mb-1">{sentLabel}</span>
              <span className="text-slate-700 font-bold text-xs lg:text-sm leading-none">{sentValue ?? stats.sent}</span>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-auto lg:min-w-[400px]">
          {children}
        </div>
      </div>
    </div>
  );
}
