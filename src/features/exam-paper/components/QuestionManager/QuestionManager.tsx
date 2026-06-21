/* src/features/exam-paper/components/QuestionManager/QuestionManager.tsx */
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit3, X } from 'lucide-react';
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] no-print">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white text-slate-800 w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200"
        >
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <Edit3 size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Question Editor</h2>
                  <p className="text-xs text-slate-500 font-medium">Modify generated questions manually</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase ml-2">Question:</span>
                  <select
                    value={selectedIdx}
                    onChange={(e) => handleSelect(parseInt(e.target.value))}
                    className="bg-white text-slate-900 text-xs font-bold border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-w-[90px]"
                  >
                    <option value="-1">Select...</option>
                    {paper.questions.map((q, idx) => (
                      <option key={idx} value={idx}>#{q.number}</option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={() => { setSelectedIdx(-1); setEditQuestion(null); }}
                  className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-100 transition-all hover:scale-105 active:scale-95"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {editQuestion ? (
                <QuestionEditor
                  editQuestion={editQuestion}
                  setEditQuestion={setEditQuestion}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onCancel={() => { setSelectedIdx(-1); setEditQuestion(null); }}
                />
              ) : (
                <div className="text-center py-20 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200 text-slate-500">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                    <Edit3 size={24} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-medium">Select a question to start editing</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-slate-50/80 p-5 border-t border-slate-100 flex justify-end gap-3">
            <button 
              onClick={() => { setSelectedIdx(-1); setEditQuestion(null); }}
              className="px-8 py-3 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-2xl text-sm font-bold transition-all active:scale-95"
            >
              Cancel
            </button>
            <button 
              onClick={() => { setSelectedIdx(-1); setEditQuestion(null); }}
              className="px-8 py-3 bg-[#2C4B9B] hover:bg-[#1e3675] text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-900/10 transition-all active:scale-95"
            >
              Done Editing
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
