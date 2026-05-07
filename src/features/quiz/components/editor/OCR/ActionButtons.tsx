import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface ActionButtonsProps {
  onGenerate: () => void;
  isGenerating: boolean;
  disabled: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onGenerate, isGenerating, disabled }) => {
  return (
    <div className="space-y-3">
      <button
        onClick={onGenerate}
        disabled={disabled || isGenerating}
        className="w-full bg-[#2C4B9B] hover:bg-[#1a2e5f] disabled:bg-slate-300 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-blue-900/10 active:scale-[0.98]"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Scanning & Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Scan with AI OCR
          </>
        )}
      </button>
      
      <p className="text-[10px] text-center text-slate-400 font-medium px-4">
        Tip: Ensure the photo is clear and well-lit for better text extraction.
      </p>
    </div>
  );
};
