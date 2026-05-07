import { useState, useMemo } from 'react';
import { QuizQuestion } from '../../../types';
import { useAuth } from '../../auth/hooks/useAuth';
import { useQuizSync } from './useQuizSync';
import { useQuizGeneration } from './useQuizGeneration';
import { useQuizActions } from './useQuizActions';
import { useQuizLocalStorage } from './useQuizLocalStorage';

export function useQuiz() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [stats, setStats] = useState({ generated: 0, sent: 0 });

  // Edit states
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);

  // Real-time Sync Effect
  useQuizSync(user, setQuestions, setStats);

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
    handleGenerateFromImage
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
    removeQuestions
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
    removeQuestions
  ]);
}
