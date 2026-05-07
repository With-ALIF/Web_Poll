/* src/features/exam-paper/hooks/useExamPaper.ts */
import { useState } from 'react';
import { ExamPaper, ExamPaperSettings, ExamQuestion } from '../types';
import { generateExamPaper } from '../services/examPaperService';
import { shuffleArray } from '../utils/shuffle';

export function useExamPaper() {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paper, setPaper] = useState<ExamPaper | null>(null);
  const [originalQuestions, setOriginalQuestions] = useState<ExamQuestion[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(-1);
  const [editQuestion, setEditQuestion] = useState<ExamQuestion | null>(null);
  const [settings, setSettings] = useState<ExamPaperSettings>({
    type: 'MCQ', title: 'Model Test', totalQuestions: 10, difficulty: 'Medium',
    includeExplanation: false, questionsPerPage: 10, showTime: true, showMarks: true, subtitle: 'Final Examination 2024', marks: '100',
    time: '3 Hours', set: 'A', footerName: 'AI Exam Builder', footerLink: 'https://',
    watermark: { enabled: false, type: 'text', text: 'AI EXAM BUILDER', imageUrl: '', opacity: 0.1 }
  });

  const handleGenerate = async () => {
    if (!inputText.trim()) return setError('Please enter some content.');
    setIsGenerating(true); setError(null);
    try {
      const g = await generateExamPaper(inputText, settings);
      setPaper(g);
      if (g.questions) setOriginalQuestions(JSON.parse(JSON.stringify(g.questions)));
    } catch (err: any) { setError(err.message || 'Failed to generate.');
    } finally { setIsGenerating(false); }
  };

  const handleSetChange = (newSet: string) => {
    setSettings(prev => ({ ...prev, set: newSet }));
    if (paper && originalQuestions.length > 0) {
      const qs = newSet === 'A' ? originalQuestions : shuffleArray(originalQuestions);
      const updated = qs.map((q, idx) => ({
        ...q, number: idx + 1,
        column: (idx < Math.ceil(qs.length / 2) ? 'left' : 'right') as any
      }));
      setPaper({ ...paper, meta: { ...paper.meta, set: newSet }, questions: updated });
    }
  };

  return {
    inputText, setInputText, isGenerating, error, setError,
    paper, setPaper, originalQuestions, setOriginalQuestions,
    selectedIdx, setSelectedIdx, editQuestion, setEditQuestion,
    settings, setSettings, handleGenerate, handleSetChange
  };
}
