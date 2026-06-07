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
      <div className="flex items-center gap-2 pt-2">
        <button onClick={onUpdate} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all">
          <Check size={16} /> Update
        </button>
        <button onClick={onDelete} className="w-12 h-10 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl flex items-center justify-center">
          <Trash2 size={18} />
        </button>
        <button onClick={onCancel} className="w-12 h-10 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl flex items-center justify-center">
          <CloseIcon size={18} />
        </button>
      </div>
    </div>
  );
};
