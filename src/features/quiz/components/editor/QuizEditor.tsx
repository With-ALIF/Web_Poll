import React from 'react';
import { QuizQuestion } from '../../../../types';
import QuizImageUploader from './QuizImageUploader';
import QuizOptionsEditor from './QuizOptionsEditor';

interface QuizEditorProps {
  questionId: string;
  editingQuestion: QuizQuestion;
  setEditingQuestion: (q: QuizQuestion) => void;
}

export default function QuizEditor({ questionId, editingQuestion, setEditingQuestion }: QuizEditorProps) {
  return (
    <div className="space-y-4">
      <QuizImageUploader 
        editingQuestion={editingQuestion} 
        setEditingQuestion={setEditingQuestion} 
      />
      
      <QuizOptionsEditor 
        questionId={questionId}
        editingQuestion={editingQuestion}
        setEditingQuestion={setEditingQuestion}
      />
    </div>
  );
}
