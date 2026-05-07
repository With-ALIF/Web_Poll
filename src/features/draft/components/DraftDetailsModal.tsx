import React from 'react';
import { X } from 'lucide-react';
import { QuizQuestion } from '../../../types';

interface DraftDetailsModalProps {
  draft: QuizQuestion;
  onClose: () => void;
}

export default function DraftDetailsModal({ draft, onClose }: DraftDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-slate-900">{draft.question}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="space-y-4">
          {draft.image && (
            <div className="mb-4">
              <img 
                src={draft.image} 
                alt="Header visual" 
                className="w-full rounded-xl border border-slate-200 object-contain max-h-72"
              />
            </div>
          )}
          {draft.type !== 'header' ? (
            <>
              <div>
                <h3 className="font-semibold text-slate-700 mb-2">Options:</h3>
                <ul className="space-y-2">
                  {draft.options.map((option, index) => (
                    <li 
                      key={index} 
                      className={`p-3 rounded-lg text-slate-700 ${
                        index === draft.correctOptionIndex ? 'bg-green-50 border border-green-200' : 'bg-slate-50'
                      }`}
                    >
                      {option} {index === draft.correctOptionIndex && <span className="text-green-600 font-bold">(Correct)</span>}
                    </li>
                  ))}
                </ul>
              </div>
              {draft.explanation && (
                <div>
                  <h3 className="font-semibold text-slate-700">Explanation:</h3>
                  <p className="text-slate-600 mt-1 bg-slate-50 p-3 rounded-lg">{draft.explanation}</p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <p className="text-emerald-800 text-sm font-medium">This is a Header Post. It will be sent as an image with the caption above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
