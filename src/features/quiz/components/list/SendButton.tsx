import React from 'react';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';

interface SendButtonProps {
  isSending: boolean;
  sendableCount: number;
  allSent: boolean;
  handleSendAll: () => void;
}

export default function SendButton({ isSending, sendableCount, allSent, handleSendAll }: SendButtonProps) {
  if (isSending) {
    return (
      <button
        disabled
        className="w-full text-sm font-medium text-white bg-blue-600 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl shadow-sm opacity-90 cursor-not-allowed"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Sending...
      </button>
    );
  }

  if (sendableCount === 0) {
    return (
      <button
        disabled
        className="w-full text-sm font-medium text-slate-500 bg-slate-100 border border-slate-200 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl shadow-sm cursor-not-allowed"
      >
        <CheckCircle2 className="w-4 h-4" />
        Nothing to Send
      </button>
    );
  }

  return (
    <button
      onClick={handleSendAll}
      className="w-full text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
    >
      <Send className="w-4 h-4" />
      {allSent ? `Resend All (${sendableCount})` : `Send All (${sendableCount})`}
    </button>
  );
}
