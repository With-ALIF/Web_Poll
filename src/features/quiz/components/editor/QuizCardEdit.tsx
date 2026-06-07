import React from 'react';
import { QuizQuestion } from '../../../../types';
import QuestionEditForm from './QuestionEditForm';
import QuizEditor from './QuizEditor';
import EditQuizCard from '../shared/EditQuizCard';

interface QuizCardEditProps {
  question: QuizQuestion;
  editingQuestion: QuizQuestion;
  setEditingQuestion: (q: QuizQuestion) => void;
  onCancel: () => void;
  onSave: () => void;
}

export default function QuizCardEdit({
  question,
  editingQuestion,
  setEditingQuestion,
  onCancel,
  onSave
}: QuizCardEditProps) {
  return (
    <EditQuizCard onCancel={onCancel} onSave={onSave}>
      <QuestionEditForm 
        editingQuestion={editingQuestion} 
        setEditingQuestion={setEditingQuestion} 
      />
      <QuizEditor 
        questionId={question.id}
        editingQuestion={editingQuestion}
        setEditingQuestion={setEditingQuestion}
      />
    </EditQuizCard>
  );
}
