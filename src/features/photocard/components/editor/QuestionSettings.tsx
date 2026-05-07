import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { EditorProps } from './types';
import { generateOptions } from '../../services/aiService';

export const QuestionSettings: React.FC<EditorProps> = ({ data, onChange, handleChange }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAiGenerate = async () => {
    if (!data.question.trim()) return;
    
    setIsGenerating(true);
    try {
      const options = await generateOptions(data.question);
      onChange({
        ...data,
        options: {
          ...data.options,
          ...options
        }
      });
    } catch (error) {
      console.error("AI Generation failed:", error);
      alert("AI অপশন জেনারেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">প্রশ্ন</label>
        <button
          onClick={handleAiGenerate}
          disabled={isGenerating || !data.question.trim()}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-[10px] font-bold uppercase tracking-wider group"
          title="AI দিয়ে অপশন তৈরি করুন"
        >
          {isGenerating ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3 group-hover:scale-110 transition-transform" />
          )}
          {isGenerating ? 'জেনারেট হচ্ছে...' : 'AI অপশন জেনারেট'}
        </button>
      </div>
      <textarea 
        name="question"
        value={data.question}
        onChange={handleChange}
        onFocus={(e) => e.target.select()}
        rows={2}
        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
        placeholder="আপনার প্রশ্নটি এখানে লিখুন"
      />
    </div>
  );
};
