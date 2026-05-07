import { useState, useMemo } from 'react';
import { QuizQuestion } from '../../../types';

export function useQuizFilter(questions: QuizQuestion[]) {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (selectedTopic === 'all') return true;
      if (selectedTopic === 'uncategorized') return !q.topic;
      return q.topic === selectedTopic;
    });
  }, [questions, selectedTopic]);

  return {
    selectedTopic,
    setSelectedTopic,
    filteredQuestions
  };
}
