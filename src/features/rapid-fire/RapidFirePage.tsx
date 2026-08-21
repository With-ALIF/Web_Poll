/* src/features/rapid-fire/RapidFirePage.tsx */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Send, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  Hash,
  FileText
} from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { generateQuizFromText } from '../quiz/services/geminiService';
import { sendQuizToTelegram } from '../quiz/services/telegramPollService';
import { QuizQuestion } from '../../types';

export default function RapidFirePage() {
  const { loading: authLoading } = useAuthContext();
  const appState = useApp();
  
  const [inputText, setInputText] = useState('');
  const [questionCount, setQuestionCount] = useState<number | ''>(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Omit<QuizQuestion, 'id' | 'status'>[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Telegram states
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [customChannelId, setCustomChannelId] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [sendingProgress, setSendingProgress] = useState<number | null>(null);

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
    
    try {
      const finalCount = typeof questionCount === 'number' && questionCount > 0 ? Math.min(30, questionCount) : 10;
      const response = await generateQuizFromText(inputText.trim(), finalCount, true);
      if (!response || response.length === 0) {
        throw new Error('কোনো প্রশ্ন তৈরি করা সম্ভব হয়নি। অনুগ্রহ করে অন্য টেক্সট ট্রাই করুন।');
      }
      setGeneratedQuestions(response);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'প্রশ্ন তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsGenerating(false);
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
          id: `rapid-${Date.now()}-${i}`,
          question: q.question,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex,
          explanation: q.explanation,
          status: 'pending',
          topic: 'Rapid Fire Generation'
        };

        const success = await sendQuizToTelegram(
          questionPayload, 
          appState?.settings?.settings || {}, 
          activeChannelId
        );
        
        if (success) {
          successCount++;
        }
        
        // Anti-rate-limit delay
        await new Promise(resolve => setTimeout(resolve, 1500));
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Title Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
          <Zap className="w-5 h-5 fill-current" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Rapid Fire Generator</h1>
          <p className="text-slate-500 text-xs">আপনার টেক্সট থেকে দ্রুত MCQ কুইজ তৈরি করে সরাসরি টেলিগ্রামে শেয়ার করুন।</p>
        </div>
      </div>

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
            <span className="absolute bottom-3 right-3 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
              {inputText.length} chars
            </span>
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
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Generated Quiz Questions</h3>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-black px-2.5 py-1 rounded-full border border-indigo-100">
                  Total: {generatedQuestions.length}
                </span>
              </div>

              {/* Numbered Questions List */}
              <div className="space-y-3">
                {generatedQuestions.map((q, idx) => (
                  <div key={idx} className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 flex items-start gap-3">
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-slate-800 text-sm font-medium pt-0.5 leading-relaxed">
                      {q.question}
                    </p>
                  </div>
                ))}
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
