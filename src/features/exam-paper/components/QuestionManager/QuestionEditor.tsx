/* src/features/exam-paper/components/QuestionManager/QuestionEditor.tsx */
import React from 'react';
import { ExamQuestion } from '../../types';
import { Check, Trash2, X as CloseIcon } from 'lucide-react';
import { QuestionFields } from './QuestionFields';
import { QuestionMetaFields } from './QuestionMetaFields';

interface Props {
  editQuestion: ExamQuestion;
  setEditQuestion: (q: ExamQuestion) => void;
  onUpdate: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export const QuestionEditor: React.FC<Props> = ({ editQuestion, setEditQuestion, onUpdate, onDelete, onCancel }) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <QuestionFields editQuestion={editQuestion} setEditQuestion={setEditQuestion} />
      <QuestionMetaFields editQuestion={editQuestion} setEditQuestion={setEditQuestion} />
      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
        <button onClick={onUpdate} className="flex-1 bg-[#2C4B9B] hover:bg-[#1e3675] text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/10 active:scale-95">
          <Check size={18} /> Update Question
        </button>
        <button onClick={onDelete} className="w-14 h-12 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl flex items-center justify-center transition-all active:scale-95 border border-red-100" title="Delete Question">
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};
