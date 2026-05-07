import React, { useEffect } from 'react';
import { QuizQuestion } from '../../../types';

export function useQuizLocalStorage(
  user: any,
  questions: QuizQuestion[],
  setStats: React.Dispatch<React.SetStateAction<{ generated: number; sent: number }>>
) {
  // Save questions to local storage (only if not logged in)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('savedQuizzes', JSON.stringify(questions));
    }
  }, [questions, user?.uid]);
}
