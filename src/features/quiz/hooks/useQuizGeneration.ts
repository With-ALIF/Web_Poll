import React, { useState } from 'react';
import { QuizQuestion } from '../../../types';
import { generateQuizFromText, generateQuizFromImage } from '../services/geminiService';
import { batchSaveQuizzes, updateUserStats } from '../services/quizService';

export function useQuizGeneration(
  user: any,
  setQuestions: React.Dispatch<React.SetStateAction<QuizQuestion[]>>,
  setStats: React.Dispatch<React.SetStateAction<{ generated: number; sent: number }>>
) {
  const [inputText, setInputText] = useState('');
  const [lastInputText, setLastInputText] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preserveBoardInfo, setPreserveBoardInfoInternal] = useState<boolean>(() => {
    const saved = localStorage.getItem('preserveBoardInfo');
    return saved === null ? true : saved === 'true';
  });

  const setPreserveBoardInfo = (val: boolean) => {
    setPreserveBoardInfoInternal(val);
    localStorage.setItem('preserveBoardInfo', String(val));
  };

  const processGeneratedQuestions = async (generated: any[]) => {
    const newQuestions: QuizQuestion[] = generated.map((q: any) => ({
      ...q,
      id: Math.random().toString(36).substring(7),
      status: 'pending'
    }));
    
    setQuestions(prev => [...newQuestions, ...prev]);
    
    if (user) {
      await batchSaveQuizzes(user.uid, newQuestions);
    }

    setStats(prev => {
      const newStats = { ...prev, generated: prev.generated + generated.length };
      if (user) {
        localStorage.setItem(`stats_${user.uid}`, JSON.stringify(newStats));
        updateUserStats(user.uid, newStats);
      } else {
        localStorage.setItem('quizStats', JSON.stringify(newStats));
      }
      return newStats;
    });
  };

  const handleGenerate = async (clearInput: boolean = true): Promise<boolean> => {
    const textToUse = inputText.trim() || lastInputText.trim();
    if (!textToUse) {
      setError('Please enter some text to generate a quiz.');
      return false;
    }
    setError(null);
    setIsGenerating(true);
    try {
      const generated = await generateQuizFromText(textToUse, questionCount, preserveBoardInfo);
      await processGeneratedQuestions(generated);
      setLastInputText(textToUse);
      if (clearInput) {
        setInputText('');
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz. Please try again.');
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFromImage = async (imageBase64: string, mimeType: string): Promise<boolean> => {
    setError(null);
    setIsGenerating(true);
    try {
      const generated = await generateQuizFromImage(imageBase64, mimeType, questionCount);
      await processGeneratedQuestions(generated);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz from image. Please try again.');
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateMore = () => handleGenerate(false);

  return {
    inputText,
    setInputText,
    lastInputText,
    questionCount,
    setQuestionCount,
    isGenerating,
    error,
    setError,
    handleGenerate: () => handleGenerate(true),
    handleGenerateMore,
    handleGenerateFromImage,
    preserveBoardInfo,
    setPreserveBoardInfo
  };
}
