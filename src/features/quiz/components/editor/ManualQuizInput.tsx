import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { QuizQuestion } from '../../../../types';

interface ManualQuizInputProps {
  onAdd: (question: Omit<QuizQuestion, 'id' | 'status'>) => void;
}

export default function ManualQuizInput({ onAdd }: ManualQuizInputProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || options.some(o => !o.trim())) return;
    
    onAdd({
      question,
      options,
      correctOptionIndex: correctIndex,
      explanation,
      topic
    });
    
    setQuestion('');
    setOptions(['', '', '', '']);
    setCorrectIndex(0);
    setExplanation('');
    setTopic('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Question text..."
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
        rows={3}
      />
      <div className="space-y-2">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              checked={correctIndex === i}
              onChange={() => setCorrectIndex(i)}
            />
            <input
              value={opt}
              onChange={(e) => {
                const newOpts = [...options];
                newOpts[i] = e.target.value;
                setOptions(newOpts);
              }}
              placeholder={`Option ${i + 1}`}
              className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            />
          </div>
        ))}
      </div>
      <input
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
        placeholder="Explanation (optional)"
        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
      />
      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Topic (optional)"
        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
      />
      <button
        type="submit"
        className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Question
      </button>
    </form>
  );
}
