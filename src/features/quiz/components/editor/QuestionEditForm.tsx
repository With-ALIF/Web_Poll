import React from 'react';
import { QuizQuestion } from '../../../../types';

interface QuestionEditFormProps {
  editingQuestion: QuizQuestion;
  setEditingQuestion: (q: QuizQuestion) => void;
}

export default function QuestionEditForm({ editingQuestion, setEditingQuestion }: QuestionEditFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Question</label>
        <input
          type="text"
          value={editingQuestion.question}
          onChange={(e) => setEditingQuestion({...editingQuestion, question: e.target.value})}
          className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Topic / Subject (Optional)</label>
        <input
          type="text"
          value={editingQuestion.topic || ''}
          onChange={(e) => setEditingQuestion({...editingQuestion, topic: e.target.value})}
          placeholder="e.g. History, Science, Chapter 1"
          className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Explanation</label>
        <textarea
          value={editingQuestion.explanation}
          onChange={(e) => setEditingQuestion({...editingQuestion, explanation: e.target.value})}
          className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-20"
        />
      </div>
    </div>
  );
}
