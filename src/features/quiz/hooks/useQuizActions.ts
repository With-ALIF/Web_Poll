import React from 'react';
import { QuizQuestion } from '../../../types';
import { saveQuiz, deleteQuiz, updateUserStats } from '../services/quizService';

export function useQuizActions(
  user: any,
  setQuestions: React.Dispatch<React.SetStateAction<QuizQuestion[]>>,
  setStats: React.Dispatch<React.SetStateAction<{ generated: number; sent: number }>>
) {
  const addManualQuestion = async (question: Omit<QuizQuestion, 'id' | 'status'>) => {
    const newQuestion: QuizQuestion = {
      ...question,
      id: Math.random().toString(36).substring(7),
      status: 'pending'
    };
    
    setQuestions(prev => [newQuestion, ...prev]);
    
    if (user) {
      await saveQuiz(user.uid, newQuestion);
    }
    
    setStats(prev => {
      const newStats = { ...prev, generated: prev.generated + 1 };
      if (user) {
        updateUserStats(user.uid, newStats);
      } else {
        localStorage.setItem('quizStats', JSON.stringify(newStats));
      }
      return newStats;
    });
  };

  const removeQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    if (user) {
      deleteQuiz(id);
    }
  };

  const removeQuestions = (ids: string[]) => {
    setQuestions(prev => prev.filter(q => !ids.includes(q.id)));
    if (user) {
      ids.forEach(id => deleteQuiz(id));
    }
  };

  // Custom setQuestions that also syncs to firestore if needed
  const updateQuestions = (newQuestionsOrUpdater: QuizQuestion[] | ((prev: QuizQuestion[]) => QuizQuestion[])) => {
    setQuestions(prev => {
      const updated = typeof newQuestionsOrUpdater === 'function' ? newQuestionsOrUpdater(prev) : newQuestionsOrUpdater;
      
      if (user) {
        // Find changed questions and update them
        // This is a simplified approach. For a robust app, you'd want more granular updates.
        updated.forEach(q => {
          const oldQ = prev.find(p => p.id === q.id);
          if (!oldQ || JSON.stringify(oldQ) !== JSON.stringify(q)) {
             saveQuiz(user.uid, q);
          }
        });
      }
      
      return updated;
    });
  };

  return {
    addManualQuestion,
    removeQuestion,
    removeQuestions,
    updateQuestions
  };
}
