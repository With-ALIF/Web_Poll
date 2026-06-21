/* src/features/exam-paper/components/QuestionManager/QuestionMetaFields.tsx */
import React from 'react';
import { ExamQuestion } from '../../types';

interface Props {
  editQuestion: ExamQuestion;
  setEditQuestion: (q: ExamQuestion) => void;
}

export const QuestionMetaFields: React.FC<Props> = ({ editQuestion, setEditQuestion }) => {
  const update = (key: keyof ExamQuestion, val: any) => setEditQuestion({ ...editQuestion, [key]: val });

  return (
    <>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="flex-1 space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Correct Answer</label>
          <select value={editQuestion.correct_answer} onChange={(e) => update('correct_answer', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-medium">
            {editQuestion.options.map(opt => <option key={opt.label} value={opt.label}>Option {opt.label}</option>)}
          </select>
        </div>
        <div className="flex-1 space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Column</label>
          <select value={editQuestion.column} onChange={(e) => update('column', e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-medium">
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase">Explanation (Optional)</label>
        <textarea value={editQuestion.explanation || ''} onChange={(e) => update('explanation', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none min-h-[60px] transition-all" />
      </div>
    </>
  );
};
