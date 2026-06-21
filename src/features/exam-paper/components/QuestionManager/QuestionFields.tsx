/* src/features/exam-paper/components/QuestionManager/QuestionFields.tsx */
import React from 'react';
import { ExamQuestion } from '../../types';

interface Props {
  editQuestion: ExamQuestion;
  setEditQuestion: (q: ExamQuestion) => void;
}

export const QuestionFields: React.FC<Props> = ({ editQuestion, setEditQuestion }) => {
  return (
    <>
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase">Question Text</label>
        <textarea
          value={editQuestion.question}
          onChange={(e) => setEditQuestion({ ...editQuestion, question: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none min-h-[80px] transition-all"
        />
      </div>
      <div className="grid grid-cols-1 gap-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase">Options</label>
        {editQuestion.options.map((opt, oIdx) => (
          <div key={opt.label} className="flex gap-2">
            <span className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-xs font-bold shrink-0 text-slate-600">{opt.label}</span>
            <input
              type="text" value={opt.text}
              onChange={(e) => {
                const newOpts = [...editQuestion.options];
                newOpts[oIdx] = { ...newOpts[oIdx], text: e.target.value };
                setEditQuestion({ ...editQuestion, options: newOpts });
              }}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all"
            />
          </div>
        ))}
      </div>
    </>
  );
};
