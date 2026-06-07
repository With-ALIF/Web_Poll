import { useState, useMemo, useEffect } from 'react';
import { QuizQuestion } from '../../../types';
import { useAuth } from '../../auth/hooks/useAuth';
import { useQuizSync } from './useQuizSync';
import { useQuizGeneration } from './useQuizGeneration';
import { useQuizActions } from './useQuizActions';
import { useQuizLocalStorage } from './useQuizLocalStorage';

export function useQuiz() {
  const { user, loading } = useAuth();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [stats, setStats] = useState<{ generated: number; sent: number }>(() => {
    // Check if there is a cached uid
    const lastUid = localStorage.getItem('last_logged_in_uid');
    if (lastUid) {
      const cached = localStorage.getItem(`stats_${lastUid}`);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {}
      }
    }
    const generalStats = localStorage.getItem('quizStats');
    if (generalStats) {
      try {
        return JSON.parse(generalStats);
      } catch (e) {}
    }
    return { generated: 0, sent: 0 };
  });

  // Load stats from cache as soon as user is available
  useEffect(() => {
    if (user?.uid) {
      localStorage.setItem('last_logged_in_uid', user.uid);
      const cached = localStorage.getItem(`stats_${user.uid}`);
      if (cached) {
        try {
          setStats(JSON.parse(cached));
        } catch (e) {}
      }
    }
  }, [user?.uid]);

  // Edit states
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);

  // Real-time Sync Effect
  useQuizSync(user, loading, setQuestions, setStats);

  // Local Storage Sync
  useQuizLocalStorage(user, questions, setStats);

  const {
    inputText,
    setInputText,
    lastInputText,
    questionCount,
    setQuestionCount,
    isGenerating,
    error,
    setError,
    handleGenerate,
    handleGenerateMore,
    handleGenerateFromImage,
    preserveBoardInfo,
    setPreserveBoardInfo
  } = useQuizGeneration(user, setQuestions, setStats);

  const {
    addManualQuestion,
    removeQuestion,
    removeQuestions,
    updateQuestions
  } = useQuizActions(user, setQuestions, setStats);

  return useMemo(() => ({
    inputText,
    setInputText,
    lastInputText,
    questionCount,
    setQuestionCount,
    questions,
    setQuestions: updateQuestions,
    isGenerating,
    error,
    setError,
    stats,
    setStats,
    editingQuestionId,
    setEditingQuestionId,
    editingQuestion,
    setEditingQuestion,
    handleGenerate,
    handleGenerateMore,
    handleGenerateFromImage,
    addManualQuestion,
    removeQuestion,
    removeQuestions,
    preserveBoardInfo,
    setPreserveBoardInfo
  }), [
    inputText,
    lastInputText,
    questionCount,
    questions,
    updateQuestions,
    isGenerating,
    error,
    stats,
    editingQuestionId,
    editingQuestion,
    handleGenerate,
    handleGenerateMore,
    handleGenerateFromImage,
    addManualQuestion,
    removeQuestion,
    removeQuestions,
    preserveBoardInfo,
    setPreserveBoardInfo
  ]);
}
