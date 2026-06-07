import React from 'react';
import { Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { QuizQuestion } from '../../../../types';
import QuizCardActions from './QuizCardActions';

interface QuizCardProps {
  question: QuizQuestion;
  isSelected: boolean;
  toggleSelection: (id: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  handleSendToTelegram: (id: string) => void;
}

export default function QuizCard({
  question,
  isSelected,
  toggleSelection,
  onEdit,
  onDelete,
  handleSendToTelegram
}: QuizCardProps) {
  const [isConfirming, setIsConfirming] = React.useState(false);

  const handleDelete = () => {
    if (!isConfirming) {
      setIsConfirming(true);
      setTimeout(() => setIsConfirming(false), 3000);
      return;
    }
    onDelete();
  };

  return (
    <>
      <div className="absolute top-4 right-4 flex gap-2 transition-opacity duration-200">
        <button
          onClick={onEdit}
          className="text-slate-400 hover:text-blue-600 p-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/60 transition-colors"
          title="Edit Question"
        >
          <Pencil className="w-4 h-4" />
        </button>
        {isConfirming ? (
          <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/60 p-1">
            <button
              onClick={() => setIsConfirming(false)}
              className="text-[10px] font-bold text-slate-500 hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors"
            >
              No
            </button>
            <button
              onClick={onDelete}
              className="text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg transition-colors"
            >
              Yes
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsConfirming(true)}
            className="text-red-400 hover:text-red-600 p-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/60 transition-colors"
            title="Delete Question"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div className="flex items-start gap-3 pr-20 mb-5">
        <div className="pt-1">
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={() => toggleSelection(question.id)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
        </div>
        <div className="flex-1">
          {question.topic && (
            <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-semibold px-2.5 py-1 rounded-md mb-2 border border-indigo-100">
              {question.topic}
            </span>
          )}
          {question.type === 'header' && (
            <span className="inline-block bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mb-2 border border-emerald-100 ml-2">
              Header Post
            </span>
          )}
          <h3 className="font-semibold text-lg text-slate-800 leading-snug mb-3">{question.question}</h3>
          {question.image && (
            <div className="mb-4">
              <img 
                src={question.image} 
                alt="Header visual" 
                className={`rounded-xl border border-slate-200 object-contain ${question.type === 'header' ? 'w-full max-h-72' : 'max-h-48'}`}
              />
            </div>
          )}
        </div>
      </div>
      
      {question.type !== 'header' && (
        <>
          <div className="space-y-2.5 mb-5">
            {question.options.map((opt, idx) => (
              <div 
                key={idx}
                className={`p-3.5 rounded-2xl text-sm border transition-colors ${
                  idx === question.correctOptionIndex 
                    ? 'bg-green-50/50 border-green-200 text-green-800 font-medium' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt}
                {idx === question.correctOptionIndex && (
                  <CheckCircle2 className="w-4 h-4 inline-block ml-2 text-green-600" />
                )}
              </div>
            ))}
          </div>
          
          <div className="bg-indigo-50/50 border border-indigo-100/50 text-indigo-900 p-4 rounded-2xl text-sm mb-5 leading-relaxed">
            <strong className="text-indigo-700">Explanation:</strong> {question.explanation}
          </div>
        </>
      )}

      <QuizCardActions 
        question={question} 
        handleSendToTelegram={handleSendToTelegram} 
      />
    </>
  );
}
