import React from 'react';
import { Trash2 } from 'lucide-react';
import { QuizQuestion } from '../../../../types';

interface QuizOptionsEditorProps {
  questionId: string;
  editingQuestion: QuizQuestion;
  setEditingQuestion: (q: QuizQuestion) => void;
}

export default function QuizOptionsEditor({ questionId, editingQuestion, setEditingQuestion }: QuizOptionsEditorProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">Options (Select radio for correct answer)</label>
      <div className="space-y-2">
        {editingQuestion.options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="radio"
              name={`correct-${questionId}`}
              checked={editingQuestion.correctOptionIndex === idx}
              onChange={() => setEditingQuestion({...editingQuestion, correctOptionIndex: idx})}
              className="w-4 h-4 text-blue-600"
            />
            <input
              type="text"
              value={opt}
              onChange={(e) => {
                const newOptions = [...editingQuestion.options];
                newOptions[idx] = e.target.value;
                setEditingQuestion({...editingQuestion, options: newOptions});
              }}
              className={`flex-1 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${editingQuestion.correctOptionIndex === idx ? 'border-green-300 bg-green-50' : 'border-slate-200'}`}
            />
            {editingQuestion.options.length > 2 && (
              <button
                onClick={() => {
                  const newOptions = editingQuestion.options.filter((_, i) => i !== idx);
                  let newCorrectIndex = editingQuestion.correctOptionIndex;
                  if (newCorrectIndex === idx) {
                    newCorrectIndex = 0;
                  } else if (newCorrectIndex > idx) {
                    newCorrectIndex -= 1;
                  }
                  setEditingQuestion({
                    ...editingQuestion,
                    options: newOptions,
                    correctOptionIndex: newCorrectIndex
                  });
                }}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove Option"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      {editingQuestion.options.length < 6 && (
        <button
          onClick={() => {
            setEditingQuestion({
              ...editingQuestion,
              options: [...editingQuestion.options, `Option ${editingQuestion.options.length + 1}`]
            });
          }}
          className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          + Add Option
        </button>
      )}
    </div>
  );
}
