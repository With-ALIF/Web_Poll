import React from 'react';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';

interface SendButtonProps {
  isSending: boolean;
  sendableCount: number;
  allSent: boolean;
  handleSendAll: () => void;
  compact?: boolean;
}

export default function SendButton({ isSending, sendableCount, allSent, handleSendAll, compact }: SendButtonProps) {
  const baseClasses = `w-full text-xs lg:text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all duration-200 shadow-sm ${compact ? 'py-2 px-3' : 'py-2.5 px-5'}`;

  if (isSending) {
    return (
      <button
        disabled
        className={`${baseClasses} text-white bg-blue-600 opacity-90 cursor-not-allowed`}
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        {compact ? '' : 'Sending...'}
      </button>
    );
  }

  if (sendableCount === 0) {
    return (
      <button
        disabled
        className={`${baseClasses} text-slate-500 bg-slate-100 border border-slate-200 cursor-not-allowed`}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        {compact ? 'Done' : 'Nothing to Send'}
      </button>
    );
  }

  return (
    <button
      onClick={handleSendAll}
      className={`${baseClasses} text-white bg-slate-800 hover:bg-slate-900 hover:shadow-md active:scale-95`}
    >
      <Send className="w-3.5 h-3.5" />
      {compact ? (allSent ? 'Resend' : 'Send All') : (allSent ? `Resend All (${sendableCount})` : `Send All (${sendableCount})`)}
    </button>
  );
}
