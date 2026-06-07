/* src/features/exam-paper/components/QuestionManager/QuestionManager.tsx */
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit3 } from 'lucide-react';
import { ExamPaper, ExamQuestion } from '../../types';
import { QuestionEditor } from './QuestionEditor';

interface QuestionManagerProps {
  paper: ExamPaper;
  selectedIdx: number;
  setSelectedIdx: (idx: number) => void;
  editQuestion: ExamQuestion | null;
  setEditQuestion: (q: ExamQuestion | null) => void;
  onUpdate: () => void;
  onDelete: () => void;
}

export const QuestionManager: React.FC<QuestionManagerProps> = ({
  paper, selectedIdx, setSelectedIdx, editQuestion, setEditQuestion, onUpdate, onDelete
}) => {
  if (!paper.questions) return null;

  const handleSelect = (idx: number) => {
    setSelectedIdx(idx);
    if (idx >= 0) {
      setEditQuestion(JSON.parse(JSON.stringify(paper.questions![idx])));
    } else {
      setEditQuestion(null);
    }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-slate-800 text-white p-6 rounded-3xl shadow-xl space-y-4 mb-6 border border-slate-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-700 pb-3">
          <div className="flex items-center gap-2 font-bold text-slate-100 uppercase tracking-wider text-xs whitespace-nowrap">
            <Edit3 size={14} className="text-blue-400" /> Manage Questions
          </div>
          <select
            value={selectedIdx}
            onChange={(e) => handleSelect(parseInt(e.target.value))}
            className="w-full sm:w-auto sm:max-w-[200px] bg-slate-900 text-white text-xs font-bold border border-slate-600 rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 truncate"
          >
            <option value="-1">Select Question...</option>
            {paper.questions.map((q, idx) => (
              <option key={idx} value={idx}>Q{q.number}: {q.question.substring(0, 30)}...</option>
            ))}
          </select>
        </div>

        {editQuestion ? (
          <QuestionEditor
            editQuestion={editQuestion}
            setEditQuestion={setEditQuestion}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onCancel={() => { setSelectedIdx(-1); setEditQuestion(null); }}
          />
        ) : (
          <div className="text-center py-4 bg-slate-900/50 rounded-2xl border border-dashed border-slate-700 text-slate-500 text-xs font-medium">
            Select a question number from the dropdown to edit or remove it.
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
