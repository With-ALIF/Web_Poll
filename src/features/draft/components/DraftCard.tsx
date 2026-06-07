import React from 'react';
import { Send, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { QuizQuestion } from '../../../types';

interface DraftCardProps {
  draft: QuizQuestion;
  onSend: (draft: QuizQuestion) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onOpenDetails: (draft: QuizQuestion) => void;
}

const DraftCard: React.FC<DraftCardProps> = ({ draft, onSend, onDelete, isSelected, onToggleSelect, onOpenDetails }) => {
  return (
    <div 
      onClick={() => onOpenDetails(draft)}
      className={`bg-white p-4 rounded-xl border transition-all relative group cursor-pointer ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-500/10 shadow-md' : 'border-slate-200 shadow-sm hover:shadow-md'
      }`}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect(draft.id);
        }}
        className={`absolute top-3 right-3 p-1 rounded-full transition-all z-10 border ${
          isSelected 
            ? 'bg-blue-600 border-blue-600 text-white' 
            : 'bg-white border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-500'
        }`}
      >
        {isSelected ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
      </button>

      <div className="pr-8">
        {draft.topic && (
          <span className="inline-block bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mb-2 border border-indigo-100">
            {draft.topic}
          </span>
        )}
        {draft.type === 'header' && (
          <span className="inline-block bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mb-2 border border-emerald-100 ml-2">
            Header
          </span>
        )}
        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{draft.question}</h3>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
          {draft.type === 'header' ? 'Header Post' : `${draft.options.length} Options`}
        </span>
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onSend(draft);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Send to Telegram"
          >
            <Send className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              console.log('Delete button clicked for draft:', draft);
              if (!draft.id) {
                console.error('DraftCard: Draft has no ID', draft);
              }
              onDelete(draft.id);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Draft"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraftCard;
