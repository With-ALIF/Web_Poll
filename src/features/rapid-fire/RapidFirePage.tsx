/* src/features/rapid-fire/RapidFirePage.tsx */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Send, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Hash, 
  FileText,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  History,
  Clock,
  BookmarkPlus,
  ChevronDown,
  ChevronUp,
  Save
} from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { generateQuizFromText } from '../quiz/services/geminiService';
import { sendQuestionTextToTelegram } from '../quiz/services/telegramService';
import { QuizQuestion } from '../../types';
import { generateUUID } from '../../lib/uuid';

interface RapidFireBatch {
  id: string;
  timestamp: number;
  snippet: string;
  questions: Omit<QuizQuestion, 'id' | 'status'>[];
}

const STORAGE_KEYS = {
  ACTIVE_QUESTIONS: 'rapid_fire_active_questions',
  INPUT_TEXT: 'rapid_fire_input_text',
  DELAY_SECONDS: 'rapid_fire_delay_seconds',
  QUESTION_COUNT: 'rapid_fire_question_count',
  HISTORY: 'rapid_fire_saved_batches'
};

export default function RapidFirePage() {
  const { loading: authLoading } = useAuthContext();
  const appState = useApp();
  
  // Persistent initial values from localStorage
  const [inputText, setInputText] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.INPUT_TEXT) || '';
  });
  const [questionCount, setQuestionCount] = useState<number | ''>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUESTION_COUNT);
    return saved ? parseInt(saved, 10) || 10 : 10;
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Omit<QuizQuestion, 'id' | 'status'>[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_QUESTIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  // History batches
  const [historyBatches, setHistoryBatches] = useState<RapidFireBatch[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [showHistory, setShowHistory] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);
  const [exportedSuccess, setExportedSuccess] = useState(false);
  
  // Telegram states
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [customChannelId, setCustomChannelId] = useState('');
  const [delaySeconds, setDelaySeconds] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DELAY_SECONDS);
    return saved ? parseInt(saved, 10) || 30 : 30;
  });
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [sendingProgress, setSendingProgress] = useState<number | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INPUT_TEXT, inputText);
  }, [inputText]);

  useEffect(() => {
    if (typeof questionCount === 'number') {
      localStorage.setItem(STORAGE_KEYS.QUESTION_COUNT, questionCount.toString());
    }
  }, [questionCount]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_QUESTIONS, JSON.stringify(generatedQuestions));
  }, [generatedQuestions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DELAY_SECONDS, delaySeconds.toString());
  }, [delaySeconds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(historyBatches));
  }, [historyBatches]);

  // Get active channel from settings
  const channels = appState?.settings?.settings?.channels || [];
  const defaultChannelId = appState?.settings?.settings?.activeChannelId || (channels[0]?.id || '');
  const activeChannelId = (selectedChannelId || customChannelId || defaultChannelId).trim();

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError('অনুগ্রহ করে আগে আপনার টেক্সট, নোট বা আর্টিকেলটি পেস্ট করুন।');
      return;
    }
    
    setError(null);
    setIsGenerating(true);
    setSendResult(null);
    setSendingProgress(null);
    setExportedSuccess(false);
    
    try {
      const finalCount = typeof questionCount === 'number' && questionCount > 0 ? Math.min(30, questionCount) : 10;
      const response = await generateQuizFromText(inputText.trim(), finalCount, true);
      if (!response || response.length === 0) {
        throw new Error('কোনো প্রশ্ন তৈরি করা সম্ভব হয়নি। অনুগ্রহ করে অন্য টেক্সট ট্রাই করুন।');
      }
      
      // Update active questions
      setGeneratedQuestions(response);

      // Save to local history automatically
      const newBatch: RapidFireBatch = {
        id: `batch-${Date.now()}`,
        timestamp: Date.now(),
        snippet: inputText.trim().slice(0, 100) + (inputText.trim().length > 100 ? '...' : ''),
        questions: response
      };
      setHistoryBatches(prev => [newBatch, ...prev.slice(0, 29)]); // keep up to 30 batches
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'প্রশ্ন তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearCurrent = () => {
    if (generatedQuestions.length > 0 && !window.confirm('আপনি কি বর্তমান প্রশ্নগুলো স্ক্রিন থেকে ক্লিয়ার করতে চান? (পূর্ববর্তী প্রশ্ন হিস্ট্রিতে সংরক্ষিত থাকবে)')) {
      return;
    }
    setGeneratedQuestions([]);
    setInputText('');
    setSendResult(null);
    setError(null);
  };

  const handleRestoreBatch = (batch: RapidFireBatch) => {
    setGeneratedQuestions(batch.questions);
    setInputText(batch.snippet);
    setSendResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteBatch = (batchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistoryBatches(prev => prev.filter(b => b.id !== batchId));
  };

  const handleClearAllHistory = () => {
    if (window.confirm('আপনি কি সমস্ত লোকাল হিস্ট্রি মুছে ফেলতে চান?')) {
      setHistoryBatches([]);
    }
  };

  const handleCopySingle = (text: string, id: string | number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAllQuestions = (questionsToCopy: Omit<QuizQuestion, 'id' | 'status'>[], idKey: string) => {
    const fullText = questionsToCopy.map((q, idx) => `${idx + 1}. ${q.question}`).join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopiedId(idKey);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteSingleQuestion = (indexToDelete: number) => {
    setGeneratedQuestions(prev => prev.filter((_, idx) => idx !== indexToDelete));
  };

  const handleSaveToMainQuizBank = () => {
    if (generatedQuestions.length === 0) return;
    
    const formatted: QuizQuestion[] = generatedQuestions.map((q) => ({
      id: generateUUID(),
      question: q.question,
      options: q.options || [],
      correctOptionIndex: q.correctOptionIndex ?? 0,
      explanation: q.explanation || '',
      status: 'pending',
      topic: 'Rapid Fire'
    }));

    if (appState?.quiz?.setQuestions) {
      appState.quiz.setQuestions(prev => [...formatted, ...prev]);
      setExportedSuccess(true);
      setTimeout(() => setExportedSuccess(false), 3000);
    }
  };

  const handleSendToTelegram = async () => {
    if (generatedQuestions.length === 0) return;
    
    if (!activeChannelId) {
      setError('❌ কোনো টেলিগ্রাম চ্যানেল সেটআপ করা নেই! নিচে আপনার Channel ID টাইপ করুন অথবা Settings এ গিয়ে সেট করুন।');
      return;
    }

    setIsSending(true);
    setSendResult(null);
    setError(null);
    
    let successCount = 0;
    
    try {
      for (let i = 0; i < generatedQuestions.length; i++) {
        setSendingProgress(i + 1);
        const q = generatedQuestions[i];
        
        // Convert to app's standard QuizQuestion shape
        const questionPayload: QuizQuestion = {
          id: generateUUID(),
          question: q.question,
          options: q.options || [],
          correctOptionIndex: q.correctOptionIndex ?? 0,
          explanation: q.explanation || '',
          status: 'pending',
          topic: 'Rapid Fire Generation'
        };

        const success = await sendQuestionTextToTelegram(
          questionPayload, 
          appState?.settings?.settings || {}, 
          activeChannelId
        );
        
        if (success) {
          successCount++;
        }
        
        // Anti-rate-limit delay based on user setting
        if (i < generatedQuestions.length - 1) {
          const waitTime = Math.max(1, typeof delaySeconds === 'number' ? delaySeconds : 30) * 1000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
      
      setSendResult(`✅ সফলভাবে ${successCount} টি প্রশ্ন আপনার টেলিগ্রাম চ্যানেলে পাঠানো হয়েছে!`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'টেলিগ্রামে পাঠানোর সময় ত্রুটি ঘটেছে। অনুগ্রহ করে আপনার বটের পারমিশন চেক করুন।');
    } finally {
      setIsSending(false);
      setSendingProgress(null);
    }
  };

  if (authLoading) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Rapid Fire Generator</h1>
            <p className="text-slate-500 text-xs">আপনার টেক্সট থেকে দ্রুত প্রশ্ন তৈরি করে লোকালি সংরক্ষণ ও সরাসরি টেলিগ্রামে শেয়ার করুন।</p>
          </div>
        </div>

        {/* Action badges: History & Reset */}
        <div className="flex items-center gap-2">
          {historyBatches.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                showHistory 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>সংরক্ষিত হিস্ট্রি ({historyBatches.length})</span>
              {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}

          {(generatedQuestions.length > 0 || inputText) && (
            <button
              onClick={handleClearCurrent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
              title="নতুন সেশন শুরু করুন"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ক্লিয়ার</span>
            </button>
          )}
        </div>
      </div>

      {/* History Drawer / Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-black tracking-wide text-slate-100">লোকালি সংরক্ষিত পূর্ববর্তী প্রশ্ন ব্যাচ (Saved History)</h3>
                </div>
                <button
                  onClick={handleClearAllHistory}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>সব হিস্ট্রি মুছুন</span>
                </button>
              </div>

              {historyBatches.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">কোনো সংরক্ষিত হিস্ট্রি পাওয়া যায়নি।</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {historyBatches.map((batch) => {
                    const dateStr = new Date(batch.timestamp).toLocaleDateString('bn-BD', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    const isCopied = copiedId === batch.id;

                    return (
                      <div 
                        key={batch.id}
                        onClick={() => handleRestoreBatch(batch)}
                        className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer transition-all group hover:border-indigo-500/50"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {dateStr}
                            </span>
                            <span className="bg-indigo-900/60 text-indigo-300 font-bold px-2 py-0.5 rounded-md border border-indigo-700/50 text-[10px]">
                              {batch.questions.length} টি প্রশ্ন
                            </span>
                          </div>
                          <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                            {batch.snippet || 'টেক্সট থেকে তৈরি'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-700/50">
                          <span className="text-[11px] font-bold text-indigo-400 group-hover:text-indigo-300">
                            লোড ও এডিট করুন →
                          </span>
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleCopyAllQuestions(batch.questions, batch.id)}
                              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-all"
                              title="সব প্রশ্ন কপি করুন"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteBatch(batch.id, e)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700 transition-all"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xl space-y-6">
        
        {/* Row: Input Text & N Questions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-400" />
            <h2 className="text-base font-extrabold text-slate-800">Input Text</h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Presets */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {[5, 10, 15, 20, 30].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuestionCount(num)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    questionCount === num
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Custom Number Input */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shrink-0">
              <Hash className="w-4 h-4 text-slate-500" />
              <label className="text-xs font-bold text-slate-600">Custom:</label>
              <input 
                type="number" 
                min={1} 
                max={30} 
                placeholder="10"
                value={questionCount === '' ? '' : questionCount}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === '') {
                    setQuestionCount('');
                  } else {
                    const parsed = parseInt(raw, 10);
                    if (!isNaN(parsed)) {
                      setQuestionCount(Math.min(30, Math.max(0, parsed)));
                    }
                  }
                }}
                onBlur={() => {
                  if (questionCount === '' || questionCount < 1) {
                    setQuestionCount(10);
                  }
                }}
                className="w-12 bg-white border border-slate-200 rounded-lg py-0.5 text-slate-800 font-extrabold text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-2.5 text-xs border border-red-100 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Text Area */}
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isGenerating}
            placeholder="Paste your text, notes, or article here..."
            className="w-full h-64 px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm leading-relaxed text-slate-700 placeholder-slate-400"
          />
          {inputText && (
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                {inputText.length} chars
              </span>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-sm tracking-wide transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating Questions...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-yellow-400 fill-current animate-pulse" />
              <span> Generate</span>
            </>
          )}
        </button>

        {/* Display Generated Questions */}
        <AnimatePresence>
          {generatedQuestions.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t border-slate-100 pt-6 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100/80">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Generated Questions ({generatedQuestions.length})
                  </h3>
                  <span className="text-[11px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                    💾 লোকালি সংরক্ষিত
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyAllQuestions(generatedQuestions, 'all-active')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                  >
                    {copiedId === 'all-active' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">কপি হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>সব কপি করুন</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveToMainQuizBank}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm"
                    title="মূল কুইজ ব্যাংকে যোগ করুন"
                  >
                    {exportedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>ব্যাংকে যোগ হয়েছে!</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        <span>কুইজ ব্যাংকে রাখুন</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Numbered Questions List */}
              <div className="space-y-3">
                {generatedQuestions.map((q, idx) => {
                  const isCopied = copiedId === `item-${idx}`;
                  return (
                    <div key={idx} className="bg-slate-50/70 hover:bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-start justify-between gap-3 group transition-all">
                      <div className="flex items-start gap-3">
                        <span className="bg-indigo-600 text-white text-xs font-black w-6 h-6 flex items-center justify-center rounded-lg shrink-0 shadow-sm mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-slate-800 text-sm font-semibold leading-relaxed pt-0.5">
                          {q.question}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopySingle(q.question, `item-${idx}`)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white transition-all"
                          title="প্রশ্ন কপি করুন"
                        >
                          {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSingleQuestion(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-all"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Target Channel Selector & ID input */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700">Target Telegram Channel:</span>
                  {channels.length > 0 ? (
                    <select
                      value={selectedChannelId || (customChannelId ? '__custom__' : defaultChannelId)}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setSelectedChannelId('');
                        } else {
                          setSelectedChannelId(e.target.value);
                          setCustomChannelId('');
                        }
                      }}
                      className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs w-full sm:w-64 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-800"
                    >
                      {channels.map((chan) => (
                        <option key={chan.id} value={chan.id}>📢 {chan.name} ({chan.id})</option>
                      ))}
                      <option value="__custom__">✍️ Custom Chat ID...</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={customChannelId}
                      onChange={(e) => setCustomChannelId(e.target.value)}
                      placeholder={defaultChannelId || "@your_channel_id"}
                      className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs w-full sm:w-64 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                    />
                  )}
                </div>
                {(!selectedChannelId && (channels.length === 0 || customChannelId)) && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                    <span className="text-[11px] font-medium text-slate-500">Custom Chat ID:</span>
                    <input
                      type="text"
                      value={customChannelId}
                      onChange={(e) => setCustomChannelId(e.target.value)}
                      placeholder="@your_channel_id or -100xxxxxxxxxx"
                      className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs w-full sm:w-64 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                    />
                  </div>
                )}
                <p className="text-[10px] text-slate-400">
                  * বটটি অবশ্যই আপনার চ্যানেলে Administrator হিসেবে থাকতে হবে।
                </p>

                {/* Delay between questions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                  <span className="text-xs font-bold text-slate-700">প্রতি প্রশ্নের মাঝে বিরতি (সেকেন্ড):</span>
                  <div className="flex items-center gap-1.5">
                    {[30, 45, 60, 120].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setDelaySeconds(sec)}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                          delaySeconds === sec
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {sec >= 60 ? `${sec / 60}m` : `${sec}s`}
                      </button>
                    ))}
                    <input 
                      type="number" 
                      min={1} 
                      max={300} 
                      value={delaySeconds}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          setDelaySeconds(Math.max(1, Math.min(300, val)));
                        }
                      }}
                      className="w-16 bg-white border border-slate-200 rounded-lg py-1 text-slate-800 font-extrabold text-xs text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sending status */}
              {isSending && (
                <div className="bg-indigo-50 text-indigo-800 p-4 rounded-xl flex items-center justify-between text-xs border border-indigo-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span>টেলিগ্রাম চ্যানেলে পাঠানো হচ্ছে... ({sendingProgress}/{generatedQuestions.length})</span>
                  </div>
                  <span className="font-bold">{Math.round((sendingProgress! / generatedQuestions.length) * 100)}%</span>
                </div>
              )}

              {sendResult && (
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl flex items-center gap-2.5 text-xs border border-emerald-100 animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{sendResult}</span>
                </div>
              )}

              {/* Send Button */}
              <button
                onClick={handleSendToTelegram}
                disabled={isSending}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-sm tracking-wider transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Sending to Telegram...' : 'Send to Telegram Channel'}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
