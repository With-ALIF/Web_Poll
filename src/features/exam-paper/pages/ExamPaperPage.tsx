/* src/features/exam-paper/pages/ExamPaperPage.tsx */
import React from 'react';
import { motion } from 'motion/react';
import { FileText, AlertCircle, Lock } from 'lucide-react';
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3"><FileText className="text-[#2C4B9B]" /> ExamPaper Generator</h1>
        <p className="text-slate-500 mt-2">Generate professional 2-column printable MCQ exam papers from any text.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6 no-print">
          {paper && settings.type === 'MCQ' && (
            <QuestionManager paper={paper} selectedIdx={logic.selectedIdx} setSelectedIdx={logic.setSelectedIdx} editQuestion={logic.editQuestion} setEditQuestion={logic.setEditQuestion} onUpdate={handleUpdate} onDelete={handleDelete} />
          )}
          <ConfigPanel settings={settings} setSettings={setSettings} onClear={() => { setPaper(null); setOriginalQuestions([]); }} hasPaper={!!paper} onSetChange={handleSetChange} />
          <InputPanel inputText={logic.inputText} setInputText={logic.setInputText} onGenerate={logic.handleGenerate} isGenerating={logic.isGenerating} />
          {logic.error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 text-sm border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> <p>{logic.error}</p>
            </motion.div>
          )}
        </div>
        <div className="lg:col-span-7">
          {paper ? (
            <ExamPaperRenderer paper={paper} includeExplanation={settings.includeExplanation} questionsPerPage={settings.questionsPerPage} showTime={settings.showTime} showMarks={settings.showMarks} watermark={settings.watermark} />
          ) : (
            <div className="h-full min-h-[400px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 p-12 text-center no-print">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm"><FileText size={40} className="text-slate-300" /></div>
              <h3 className="text-xl font-bold text-slate-600 mb-2">No Paper Generated</h3>
              <p className="max-w-xs">Fill in the configurations and paste your content to generate a printable exam paper.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
