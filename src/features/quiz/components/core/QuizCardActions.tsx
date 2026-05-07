import React from 'react';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';
import { QuizQuestion } from '../../../../types';

interface QuizCardActionsProps {
  question: QuizQuestion;
  handleSendToTelegram: (id: string) => void;
}

export default function QuizCardActions({ question, handleSendToTelegram }: QuizCardActionsProps) {
  return (
    <div className="flex items-center justify-end border-t border-slate-100 pt-5 mt-2">
      {question.status === 'sent' ? (
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-green-600 text-sm font-semibold bg-green-50 px-5 py-2.5 rounded-xl">
            <CheckCircle2 className="w-4 h-4" /> Sent to Telegram
          </span>
          <button
            onClick={() => handleSendToTelegram(question.id)}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <Send className="w-4 h-4" />
            Resend
          </button>
        </div>
      ) : question.status === 'sending' ? (
        <span className="flex items-center gap-2 text-blue-600 text-sm font-semibold bg-blue-50 px-5 py-2.5 rounded-xl">
          <Loader2 className="w-4 h-4 animate-spin" /> Sending...
        </span>
      ) : question.status === 'error' ? (
        <div className="flex items-center gap-3">
          <span className="text-red-500 text-sm font-medium px-2">Failed to send</span>
          <button
            onClick={() => handleSendToTelegram(question.id)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <Send className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : (
        <button
          onClick={() => handleSendToTelegram(question.id)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <Send className="w-4 h-4" />
          Send to Channel
        </button>
      )}
    </div>
  );
}
