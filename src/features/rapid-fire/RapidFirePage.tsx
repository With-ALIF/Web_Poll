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
  Timer,
  BookmarkPlus, 
  ChevronDown, 
  ChevronUp, 
  Save, 
  BookOpen, 
  Tag, 
  Database,
  Square
} from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { generateQuizFromText } from '../quiz/services/geminiService';
import { sendQuestionTextToTelegram } from '../quiz/services/telegramService';
import { QuizQuestion } from '../../types';
import { generateUUID } from '../../lib/uuid';
import { batchSaveRapidQuestions, saveRapidQuestion } from './services/rapidFireDbService';

interface RapidFireBatch {
  id: string;
  timestamp: number;
  snippet: string;
  topic?: string;
  subject?: string;
  questions: Omit<QuizQuestion, 'id' | 'status'>[];
}

const STORAGE_KEYS = {
  ACTIVE_QUESTIONS: 'rapid_fire_active_questions',
  INPUT_TEXT: 'rapid_fire_input_text',
  DELAY_SECONDS: 'rapid_fire_delay_seconds',
  QUESTION_COUNT: 'rapid_fire_question_count',
  TOPIC: 'rapid_fire_topic',
  SUBJECT: 'rapid_fire_subject',
  HISTORY: 'rapid_fire_saved_batches'
};

const COMMON_SUBJECTS = [
  'বাংলা',
  'বাংলা ১ম পত্র',
  'বাংলা ২য় পত্র',
  'ইংরেজি',
  'সাধারণ জ্ঞান',
  'পদার্থ বিজ্ঞান ১ম পত্র',
  'পদার্থ বিজ্ঞান ২য় পত্র',
  'রসায়ন ১ম পত্র',
  'রসায়ন ২য় পত্র',
  'জীব বিজ্ঞান ১ম পত্র',
  'জীব বিজ্ঞান ২য় পত্র',
  'উচ্চতর গণিত ১ম পত্র',
  'উচ্চতর গণিত ২য় পত্র',
  'অন্যান্য'
];

export default function RapidFirePage() {
  const { user, loading: authLoading } = useAuthContext();
  const appState = useApp();
  
  // Persistent initial values from localStorage
  const [inputText, setInputText] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.INPUT_TEXT) || '';
  });
  const [questionCount, setQuestionCount] = useState<number | ''>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUESTION_COUNT);
    return saved ? parseInt(saved, 10) || 10 : 10;
  });
  const [subject, setSubject] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.SUBJECT) || 'সাধারণ জ্ঞান';
  });
  const [customSubject, setCustomSubject] = useState<string>('');
  const [topic, setTopic] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.TOPIC) || '';
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
  const [savedDbNotice, setSavedDbNotice] = useState<string | null>(null);
  const [isSavingDb, setIsSavingDb] = useState(false);
  
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
  const [totalToSend, setTotalToSend] = useState<number>(0);
  const [currentSendStatus, setCurrentSendStatus] = useState<'sending' | 'sent' | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const [sendingSingleIdx, setSendingSingleIdx] = useState<number | null>(null);
  const [sentSingleIdx, setSentSingleIdx] = useState<number | null>(null);
  const cancelSendingRef = React.useRef(false);

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
    localStorage.setItem(STORAGE_KEYS.SUBJECT, subject);
  }, [subject]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TOPIC, topic);
  }, [topic]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_QUESTIONS, JSON.stringify(generatedQuestions));
  }, [generatedQuestions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DELAY_SECONDS, delaySeconds.toString());
  }, [delaySeconds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(historyBatches));
  }, [historyBatches]);

  // Effective Subject
  const effectiveSubject = subject === 'custom' ? customSubject.trim() || 'অন্যান্য' : subject;
  const effectiveTopic = topic.trim() || 'Rapid Fire';

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
    setSavedDbNotice(null);
    
    try {
      const finalCount = typeof questionCount === 'number' && questionCount > 0 ? Math.min(30, questionCount) : 10;
      const rawResponse = await generateQuizFromText(inputText.trim(), finalCount, false);
      if (!rawResponse || rawResponse.length === 0) {
        throw new Error('কোনো প্রশ্ন তৈরি করা সম্ভব হয়নি। অনুগ্রহ করে অন্য টেক্সট ট্রাই করুন।');
      }
      
      // Clean any bracket tags ([...]) completely for rapid fire
      const response = rawResponse.map(q => ({
        ...q,
        question: q.question ? q.question.replace(/\s*\[[^\]]*\]\s*$/g, '').trim() : ''
      }));
      
      // Update active questions
      setGeneratedQuestions(response);

      // Save to local history automatically
      const newBatch: RapidFireBatch = {
        id: `batch-${Date.now()}`,
        timestamp: Date.now(),
        snippet: inputText.trim().slice(0, 100) + (inputText.trim().length > 100 ? '...' : ''),
        subject: effectiveSubject,
        topic: effectiveTopic,
        questions: response
      };
      setHistoryBatches(prev => [newBatch, ...prev.slice(0, 29)]); // keep up to 30 batches

      // Automatically store in poll_rapid table if user is logged in
      if (user?.id) {
        const questionsPayload = response.map(q => ({
          question: q.question,
          topic: effectiveTopic,
          subject: effectiveSubject
        }));
        batchSaveRapidQuestions(user.id, questionsPayload, effectiveTopic, effectiveSubject).catch(() => {});
      }
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
    setSavedDbNotice(null);
  };

  const handleRestoreBatch = (batch: RapidFireBatch) => {
    setGeneratedQuestions(batch.questions);
    setInputText(batch.snippet);
    if (batch.subject) {
      if (COMMON_SUBJECTS.includes(batch.subject)) {
        setSubject(batch.subject);
      } else {
        setSubject('custom');
        setCustomSubject(batch.subject);
      }
    }
    if (batch.topic) {
      setTopic(batch.topic);
    }
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

  const handleSaveToPollRapidTable = async () => {
    if (generatedQuestions.length === 0) return;
    
    setIsSavingDb(true);
    setSavedDbNotice(null);

    const questionsPayload = generatedQuestions.map(q => ({
      question: q.question,
      topic: effectiveTopic,
      subject: effectiveSubject
    }));

    const userId = user?.id || 'anonymous';
    const count = await batchSaveRapidQuestions(userId, questionsPayload, effectiveTopic, effectiveSubject);

    setIsSavingDb(false);
    if (count > 0) {
      setSavedDbNotice(`✅ ${count} টি প্রশ্ন 'poll_rapid' ব্যাংকে সংরক্ষিত হয়েছে!`);
    } else {
      setSavedDbNotice(`💾 প্রশ্নগুলো লোকাল মেমোরিতে নিরাপদে সংরক্ষিত আছে।`);
    }
    setTimeout(() => setSavedDbNotice(null), 4000);
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
    setCountdownSeconds(null);
    cancelSendingRef.current = false;
    
    const queue = [...generatedQuestions];
    const initialTotal = queue.length;
    setTotalToSend(initialTotal);
    let successCount = 0;
    
    try {
      for (let i = 0; i < queue.length; i++) {
        if (cancelSendingRef.current) break;

        const q = queue[i];
        setSendingProgress(i + 1);
        setCurrentSendStatus('sending');
        setCountdownSeconds(null);

        // Convert to app's standard QuizQuestion shape
        const questionPayload: QuizQuestion = {
          id: generateUUID(),
          question: q.question,
          options: q.options || [],
          correctOptionIndex: q.correctOptionIndex ?? 0,
          explanation: q.explanation || '',
          status: 'pending',
          topic: `${effectiveSubject} - ${effectiveTopic}`
        };

        const success = await sendQuestionTextToTelegram(
          questionPayload, 
          appState?.settings?.settings || {}, 
          activeChannelId
        );
        
        if (success) {
          successCount++;
          setCurrentSendStatus('sent');

          // Auto-save to poll_rapid table in database
          const userId = user?.id || 'anonymous';
          saveRapidQuestion(userId, q.question, effectiveTopic, effectiveSubject).catch(err => {
            console.warn('[poll_rapid] auto-save error:', err);
          });
        }

        // Anti-rate-limit delay with real-time countdown before next question
        if (i < queue.length - 1 && !cancelSendingRef.current) {
          const totalWait = Math.max(1, typeof delaySeconds === 'number' ? delaySeconds : 30);
          for (let remaining = totalWait; remaining > 0; remaining--) {
            if (cancelSendingRef.current) break;
            setCountdownSeconds(remaining);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          setCountdownSeconds(null);
        } else {
          // Brief pause so user sees Sent confirmation before removing
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Remove the sent question from panel immediately after its slot finishes
        setGeneratedQuestions(prev => prev.filter((item, idx) => {
          // Remove the first item from the current view
          return idx > 0;
        }));
        setCurrentSendStatus(null);
      }
      
      if (cancelSendingRef.current) {
        setSendResult(`🛑 পাঠানো স্থগিত করা হয়েছে। (${successCount} টি প্রশ্ন 'poll_rapid' এ সেভ ও টেলিগ্রামে পাঠানো হয়েছে)`);
      } else {
        setSendResult(`✅ সফলভাবে ${successCount} টি প্রশ্ন টেলিগ্রামে পাঠানো হয়েছে এবং 'poll_rapid' ডেটাবেজে সংরক্ষিত হয়েছে!`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'টেলিগ্রামে পাঠানোর সময় ত্রুটি ঘটেছে। অনুগ্রহ করে আপনার বটের পারমিশন চেক করুন।');
    } finally {
      setIsSending(false);
      setSendingProgress(null);
      setCountdownSeconds(null);
      setCurrentSendStatus(null);
    }
  };

  const handleSendSingleQuestion = async (idx: number) => {
    if (isSending || sendingSingleIdx !== null) return;
    
    const activeChannelId = customChannelId.trim() || selectedChannelId || defaultChannelId;
    if (!activeChannelId) {
      setError('টেলিগ্রাম চ্যানেল সিলেক্ট করুন অথবা চ্যানেলের আইডি / ইউজারনেম দিন।');
      return;
    }

    const q = generatedQuestions[idx];
    if (!q) return;

    setSendingSingleIdx(idx);
    setError(null);
    setSendResult(null);

    try {
      const questionPayload: QuizQuestion = {
        id: generateUUID(),
        question: q.question,
        options: q.options || [],
        correctOptionIndex: q.correctOptionIndex ?? 0,
        explanation: q.explanation || '',
        status: 'pending',
        topic: `${effectiveSubject} - ${effectiveTopic}`
      };

      const success = await sendQuestionTextToTelegram(
        questionPayload, 
        appState?.settings?.settings || {}, 
        activeChannelId
      );

      if (success) {
        setSentSingleIdx(idx);
        
        // Auto-save to database (poll_rapid table)
        const userId = user?.id || 'anonymous';
        saveRapidQuestion(userId, q.question, effectiveTopic, effectiveSubject).catch(err => {
          console.warn('[poll_rapid] single auto-save error:', err);
        });

        // Brief delay so user sees Sent badge and checkmark
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Auto remove sent question from list
        setGeneratedQuestions(prev => prev.filter((_, i) => i !== idx));
        setSendResult(`✅ প্রশ্নটি সফলভাবে টেলিগ্রামে পাঠানো হয়েছে এবং 'poll_rapid' ডেটাবেজে সংরক্ষিত হয়েছে!`);
      } else {
        setError('প্রশ্নটি পাঠানো যায়নি। টেলিগ্রাম বট ও চ্যানেলের পারমিশন চেক করুন।');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'টেলিগ্রামে পাঠানোর সময় ত্রুটি ঘটেছে। অনুগ্রহ করে আপনার বটের পারমিশন চেক করুন।');
    } finally {
      setSendingSingleIdx(null);
      setSentSingleIdx(null);
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
            <p className="text-slate-500 text-xs">বিষয় ও টপিক সিলেক্ট করে দ্রুত প্রশ্ন তৈরি, লোকাল ও ডাটাবেজে (poll_rapid) সংরক্ষণ করুন।</p>
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
                          
                          {(batch.subject || batch.topic) && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {batch.subject && (
                                <span className="text-[10px] bg-slate-700 text-indigo-300 px-1.5 py-0.5 rounded font-medium">
                                  📚 {batch.subject}
                                </span>
                              )}
                              {batch.topic && (
                                <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-medium">
                                  🏷️ {batch.topic}
                                </span>
                              )}
                            </div>
                          )}

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
        
        {/* Subject & Topic Selection Controls */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>বিষয় ও টপিক নির্ধারণ (Subject & Topic)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Subject selector */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <span>বিষয় (Subject):</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {COMMON_SUBJECTS.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                  <option value="custom">✍️ কাস্টম বিষয় লিখুন...</option>
                </select>
                {subject === 'custom' && (
                  <input
                    type="text"
                    placeholder="বিষয়ের নাম লিখুন"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
              </div>
            </div>

            {/* Topic Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" />
                <span>টপিক / অধ্যায় (Topic / Chapter):</span>
              </label>
              <input
                type="text"
                placeholder="যেমন: প্রাচীন বাংলা, ত্রিকোণমিতি, ইত্যাদি..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

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
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Questions ({generatedQuestions.length})
                  </h3>
                  <span className="text-[11px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                    📚 {effectiveSubject} {effectiveTopic && `• ${effectiveTopic}`}
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
                    disabled={isSavingDb}
                    onClick={handleSaveToPollRapidTable}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-50"
                    title="poll_rapid টেবিলে সংরক্ষণ করুন"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>{isSavingDb ? 'সংরক্ষণ হচ্ছে...' : 'poll_rapid এ সেভ'}</span>
                  </button>
                </div>
              </div>

              {savedDbNotice && (
                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl flex items-center gap-2 text-xs border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{savedDbNotice}</span>
                </div>
              )}

              {/* Numbered Questions List */}
              <div className="space-y-3">
                {generatedQuestions.map((q, idx) => {
                  const isCopied = copiedId === `item-${idx}`;
                  const isFirst = idx === 0;
                  const isSentBulk = isSending && isFirst && currentSendStatus === 'sent';
                  const isCurrentlySendingBulk = isSending && isFirst && currentSendStatus === 'sending';
                  const isWaitingNextBulk = isSending && isFirst && currentSendStatus === 'sent' && countdownSeconds !== null;
                  const isPendingBulk = isSending && !isFirst;

                  const isSendingThisSingle = sendingSingleIdx === idx;
                  const isSentThisSingle = sentSingleIdx === idx;

                  const isAnySending = isSending || sendingSingleIdx !== null;

                  return (
                    <div 
                      key={idx} 
                      className={`rounded-2xl p-4 border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3 group ${
                        isCurrentlySendingBulk || isSendingThisSingle
                          ? 'bg-indigo-50/90 border-indigo-300 ring-2 ring-indigo-500/20 shadow-sm' 
                          : isWaitingNextBulk
                          ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/30 shadow-sm'
                          : isSentBulk || isSentThisSingle
                          ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/30 shadow-sm'
                          : 'bg-slate-50/70 hover:bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <span className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-lg shrink-0 shadow-sm mt-0.5 ${
                          isSentBulk || isWaitingNextBulk || isSentThisSingle
                            ? 'bg-emerald-600 text-white' 
                            : isCurrentlySendingBulk || isSendingThisSingle
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-slate-700 text-white'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="space-y-1.5 flex-1">
                          <p className="text-slate-800 text-sm font-semibold leading-relaxed pt-0.5">
                            {q.question}
                          </p>
                          {/* Status badges */}
                          {(isSending || isSendingThisSingle || isSentThisSingle) && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              {(isSentBulk || isWaitingNextBulk || isSentThisSingle) && (
                                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs animate-fade-in">
                                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                                  <span>Sent (poll_rapid এ সংরক্ষিত)</span>
                                </span>
                              )}
                              {(isCurrentlySendingBulk || isSendingThisSingle) && (
                                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md flex items-center gap-1.5 animate-pulse">
                                  <div className="w-2.5 h-2.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                  <span>টেলিগ্রামে পাঠানো হচ্ছে...</span>
                                </span>
                              )}
                              {isWaitingNextBulk && (
                                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md flex items-center gap-1.5 border border-amber-300">
                                  <Clock className="w-3 h-3 text-amber-600 animate-spin" style={{ animationDuration: '3s' }} />
                                  <span>পরবর্তী প্রশ্ন পাঠানো হবে:</span>
                                  <strong className="font-mono text-amber-950 font-black text-[11px] bg-white px-1.5 py-0.2 rounded border border-amber-300">
                                    {countdownSeconds}s
                                  </strong>
                                  <span>পর</span>
                                </span>
                              )}
                              {isPendingBulk && (
                                <span className="text-[10px] font-medium bg-slate-200/80 text-slate-500 px-2 py-0.5 rounded-md">
                                  অপেক্ষমান (Pending)
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                        {/* Send Single Question Button */}
                        <button
                          type="button"
                          disabled={isAnySending}
                          onClick={() => handleSendSingleQuestion(idx)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                            isSentThisSingle
                              ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                              : isSendingThisSingle
                              ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                              : 'bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-transparent active:scale-95'
                          } disabled:opacity-40 disabled:pointer-events-none`}
                          title="শুধুমাত্র এই প্রশ্নটি টেলিগ্রামে পাঠান"
                        >
                          {isSendingThisSingle ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>পাঠানো হচ্ছে...</span>
                            </>
                          ) : isSentThisSingle ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Sent</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>পাঠান</span>
                            </>
                          )}
                        </button>

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
                          disabled={isAnySending}
                          onClick={() => handleDeleteSingleQuestion(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-all disabled:opacity-30"
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

              {/* Sending status & Live Countdown */}
              {isSending && (
                <div className="space-y-2">
                  {countdownSeconds !== null ? (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-200/80 flex items-center justify-center text-amber-800 shrink-0">
                          <Timer className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">
                              প্রশ্ন {sendingProgress} / {totalToSend} পাঠানো ও poll_rapid এ সংরক্ষিত!
                            </span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold flex items-center gap-1 border border-emerald-300">
                              <Check className="w-3 h-3 text-emerald-600" /> Sent & Saved
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-800 font-medium">
                            কাউন্টডাউন শেষে এটি প্যানেল হতে রিমুভ হয়ে পরবর্তী প্রশ্ন পাঠানো হবে...
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 self-end sm:self-auto">
                        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-amber-300 shadow-sm">
                          <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                          <span className="text-base font-black font-mono text-amber-950">{countdownSeconds}s</span>
                          <span className="text-[10px] font-bold text-amber-700">বাকি</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { cancelSendingRef.current = true; }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-200 flex items-center gap-1 transition-all active:scale-95"
                          title="পাঠানো থামান"
                        >
                          <Square className="w-3 h-3 fill-current" />
                          <span>থামান</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-indigo-50 text-indigo-900 p-4 rounded-2xl flex items-center justify-between text-xs border border-indigo-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />
                        <span className="font-bold text-slate-900">
                          টেলিগ্রাম চ্যানেলে পাঠানো হচ্ছে... ({sendingProgress}/{totalToSend})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-indigo-200 text-indigo-700">
                          {Math.round(((sendingProgress || 1) / Math.max(1, totalToSend)) * 100)}%
                        </span>
                        <button
                          type="button"
                          onClick={() => { cancelSendingRef.current = true; }}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-200 flex items-center gap-1 transition-all"
                          title="পাঠানো থামান"
                        >
                          <Square className="w-2.5 h-2.5 fill-current" />
                          <span>থামান</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {sendResult && (
                <div className="bg-emerald-50 text-emerald-900 p-4 rounded-xl flex items-center gap-2.5 text-xs border border-emerald-200 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{sendResult}</span>
                </div>
              )}

              {/* Send Button */}
              <button
                onClick={handleSendToTelegram}
                disabled={isSending}
                className={`w-full text-white py-4 rounded-2xl font-black text-sm tracking-wider transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 ${
                  isSending
                    ? countdownSeconds !== null
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-indigo-500 opacity-90'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isSending ? (
                  countdownSeconds !== null ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
                      <span>পরবর্তী প্রশ্ন পাঠানো হবে {countdownSeconds}s পর...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>টেলিগ্রামে পাঠানো হচ্ছে ({sendingProgress}/{totalToSend})...</span>
                    </>
                  )
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send to Telegram Channel</span>
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

