import React, { useState } from 'react';
import { AlertCircle, PlayCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QuizQuestion } from '../../../../types';
import ManualQuizInput from './ManualQuizInput';
import AIQuizInput from './AIQuizInput';
import TopicHeaderInput from './TopicHeaderInput';

interface QuizInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  questionCount: number;
  setQuestionCount: (count: number) => void;
  isGenerating: boolean;
  error: string | null;
  handleGenerate: () => void;
  handleGenerateMore: () => void;
  handleGenerateFromImage: (imageBase64: string, mimeType: string) => Promise<boolean>;
  lastInputText: string;
  addManualQuestion: (question: Omit<QuizQuestion, 'id' | 'status'>) => void;
  preserveBoardInfo?: boolean;
  setPreserveBoardInfo?: (val: boolean) => void;
}

export default function QuizInput({ 
  inputText, 
  setInputText, 
  questionCount,
  setQuestionCount,
  isGenerating, 
  error, 
  handleGenerate,
  handleGenerateMore,
  lastInputText,
  addManualQuestion,
  preserveBoardInfo,
  setPreserveBoardInfo,
  className = ""
}: QuizInputProps & { className?: string }) {
  const [mode, setMode] = useState<'ai' | 'manual' | 'header'>('ai');
  const [showTutorial, setShowTutorial] = useState(false);
  const canGenerate = isGenerating || (!(inputText.trim() || lastInputText.trim()) || questionCount < 1);
  
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="p-4 sm:p-8 border border-slate-200 rounded-2xl sm:rounded-3xl lg:sticky lg:top-24">
        
        <div className="mb-6">
          <div className="flex bg-slate-50 p-1 rounded-full border border-slate-200 overflow-x-auto no-scrollbar min-w-0">
            <button
              onClick={() => setMode('ai')}
              className={`flex-1 sm:px-8 py-1.5 sm:py-2 px-3 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${mode === 'ai' ? 'bg-[#2C4B9B] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              AI
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 sm:px-8 py-1.5 sm:py-2 px-3 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${mode === 'manual' ? 'bg-[#2C4B9B] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Manual
            </button>
            <button
              onClick={() => setMode('header')}
              className={`flex-1 sm:px-8 py-1.5 sm:py-2 px-3 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${mode === 'header' ? 'bg-[#2C4B9B] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Header
            </button>
          </div>
          <div className="flex justify-center mt-3">
            <button 
              onClick={() => setShowTutorial(true)}
              className="flex items-center gap-2 px-4 py-1.5 bg-red-50/50 hover:bg-red-50 text-red-600 border border-red-100 rounded-full font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95"
            >
              <PlayCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Watch Tutorial
            </button>
          </div>
        </div>

        {mode === 'ai' ? (
          <AIQuizInput
            inputText={inputText}
            setInputText={setInputText}
            questionCount={questionCount}
            setQuestionCount={setQuestionCount}
            isGenerating={isGenerating}
            handleGenerate={handleGenerate}
            handleGenerateMore={handleGenerateMore}
            canGenerate={canGenerate}
            preserveBoardInfo={preserveBoardInfo}
            setPreserveBoardInfo={setPreserveBoardInfo}
          />
        ) : mode === 'manual' ? (
          <ManualQuizInput onAdd={addManualQuestion} />
        ) : (
          <TopicHeaderInput onAdd={addManualQuestion} />
        )}
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 text-sm border border-red-100"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </motion.div>
      )}

      <AnimatePresence>
        {showTutorial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-red-600" />
                  <h3 className="font-bold text-slate-800">How to use TeleQuiz</h3>
                </div>
                <button 
                  onClick={() => setShowTutorial(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="relative pt-[56.25%] w-full bg-slate-900">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/Z2sfKiw2ESA?autoplay=1"
                  title="TeleQuiz Tutorial"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
