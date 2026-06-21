/* src/features/exam-paper/pages/ExamPaperPage.tsx */
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, AlertCircle, Edit3, Sparkles } from 'lucide-react';
import { useExamPaper } from '../hooks/useExamPaper';
import { shuffleArray } from '../utils/shuffle';
import ExamPaperRenderer from '../components/ExamPaperRenderer';
import { QuestionManager } from '../components/QuestionManager/QuestionManager';
import { ConfigPanel } from '../components/ConfigPanel/ConfigPanel';
import { InputPanel } from '../components/InputPanel';
import { useAuthContext } from '../../../context/AuthContext';

export default function ExamPaperPage() {
  const { loading } = useAuthContext();
  const logic = useExamPaper();
  const { paper, setPaper, settings, setSettings, originalQuestions, setOriginalQuestions } = logic;

  if (loading) return null;

  const handleSetChange = (newSet: string) => {
    setSettings(prev => ({ ...prev, set: newSet }));
    if (paper && originalQuestions.length > 0 && settings.type === 'MCQ') {
      const questionsToShuffle = newSet === 'A' ? originalQuestions : shuffleArray(originalQuestions);
      const updated = questionsToShuffle.map((q, idx) => ({
        ...q, number: idx + 1,
        column: (idx < Math.ceil(questionsToShuffle.length / 2) ? 'left' : 'right') as any
      }));
      setPaper({ ...paper, meta: { ...paper.meta, set: newSet }, questions: updated });
    }
  };

  const handleUpdate = () => {
    if (!paper?.questions || !logic.editQuestion || logic.selectedIdx === -1) return;
    const newQs = [...paper.questions];
    newQs[logic.selectedIdx] = logic.editQuestion;
    setPaper({ ...paper, questions: newQs });
    logic.setSelectedIdx(-1); logic.setEditQuestion(null);
  };

  const handleDelete = () => {
    if (!paper?.questions || logic.selectedIdx === -1) return;
    const newQs = paper.questions.filter((_, i) => i !== logic.selectedIdx).map((q, i) => ({ ...q, number: i + 1 }));
    setPaper({ ...paper, questions: newQs });
    logic.setSelectedIdx(-1); logic.setEditQuestion(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between no-print">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3"><FileText className="text-[#2C4B9B]" /> ExamPaper Generator</h1>
          <p className="text-slate-500 mt-2">Generate professional 2-column printable MCQ exam papers from any text.</p>
        </div>
        {paper && (
          <button 
            onClick={() => logic.setSelectedIdx(0)}
            className="px-6 py-3 bg-[#2C4B9B] hover:bg-[#1e3675] text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            <Edit3 size={18} /> Manage Questions
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6 no-print">
          <ConfigPanel settings={settings} setSettings={setSettings} onClear={() => { setPaper(null); setOriginalQuestions([]); }} hasPaper={!!paper} onSetChange={handleSetChange} />
          <InputPanel inputText={logic.inputText} setInputText={logic.setInputText} onGenerate={logic.handleGenerate} isGenerating={logic.isGenerating} />
          {logic.error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 text-sm border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> <p>{logic.error}</p>
            </motion.div>
          )}
        </div>
        
        <div className="lg:col-span-8">
          {paper ? (
            <ExamPaperRenderer paper={paper} includeExplanation={settings.includeExplanation} questionsPerPage={settings.questionsPerPage} showTime={settings.showTime} showMarks={settings.showMarks} watermark={settings.watermark} />
          ) : (
            <div className="h-full min-h-[400px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 p-12 text-center no-print">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm"><FileText size={40} className="text-slate-300" /></div>
              <h3 className="text-xl font-bold text-slate-600 mb-2">No Paper Generated</h3>
              <p className="max-w-xs text-sm">Fill in the configurations and paste your content to generate a printable exam paper.</p>
            </div>
          )}
        </div>
      </div>

      {/* Generation Overlay Modal */}
      <AnimatePresence>
        {logic.isGenerating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/60 backdrop-blur-md no-print">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center text-center max-w-sm"
            >
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles size={40} className="text-blue-600" />
                </div>
                <div className="absolute inset-0 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Creating Your Paper</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Our AI is analyzing your content and generating high-quality questions. This usually takes 10-15 seconds.
              </p>
              <div className="mt-8 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    className="w-2 h-2 bg-blue-600 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal - only show if a question is selected for editing */}
      {(logic.selectedIdx !== -1 || logic.editQuestion) && paper && (
        <QuestionManager 
          paper={paper} 
          selectedIdx={logic.selectedIdx} 
          setSelectedIdx={logic.setSelectedIdx} 
          editQuestion={logic.editQuestion} 
          setEditQuestion={logic.setEditQuestion} 
          onUpdate={handleUpdate} 
          onDelete={handleDelete} 
        />
      )}
    </div>
  );
}
