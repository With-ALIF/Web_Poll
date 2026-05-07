import React from 'react';
import { motion } from 'motion/react';
import { QuizQuestion } from '../../../../types';
import QuizCardEdit from '../editor/QuizCardEdit';
import QuizCard from '../core/QuizCard';

interface QuizListItemsProps {
  questions: QuizQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<QuizQuestion[]>>;
  selectedIds: string[];
  toggleSelection: (id: string) => void;
  removeQuestion: (id: string) => void;
  handleSendToTelegram: (id: string) => void;
  editingQuestionId: string | null;
  setEditingQuestionId: (id: string | null) => void;
  editingQuestion: QuizQuestion | null;
  setEditingQuestion: (q: QuizQuestion | null) => void;
}

export default function QuizListItems({
  questions,
  setQuestions,
  selectedIds,
  toggleSelection,
  removeQuestion,
  handleSendToTelegram,
  editingQuestionId,
  setEditingQuestionId,
  editingQuestion,
  setEditingQuestion
}: QuizListItemsProps) {
  return (
    <>
      {questions.map((q) => (
        <motion.div
          key={q.id}
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 relative group"
        >
          {editingQuestionId === q.id && editingQuestion ? (
            <QuizCardEdit 
              question={q}
              editingQuestion={editingQuestion}
              setEditingQuestion={setEditingQuestion}
              onCancel={() => {
                setEditingQuestionId(null);
                setEditingQuestion(null);
              }}
              onSave={() => {
                setQuestions(prev => prev.map(item => item.id === q.id ? editingQuestion : item));
                setEditingQuestionId(null);
                setEditingQuestion(null);
              }}
            />
          ) : (
            <QuizCard 
              question={q}
              isSelected={selectedIds.includes(q.id)}
              toggleSelection={toggleSelection}
              onEdit={() => {
                setEditingQuestionId(q.id);
                setEditingQuestion({ ...q });
              }}
              onDelete={() => removeQuestion(q.id)}
              handleSendToTelegram={handleSendToTelegram}
            />
          )}
        </motion.div>
      ))}
    </>
  );
}
