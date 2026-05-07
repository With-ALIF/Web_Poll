import React from 'react';
import { QuizQuestion, TelegramSettings } from '../../../../types';

export interface QuizListProps {
  questions: QuizQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<QuizQuestion[]>>;
  handleSendAll: () => void;
  handleSendSelected: (ids: string[]) => void;
  onDraftSelected?: (ids: string[]) => void;
  handleSendToTelegram: (id: string) => void;
  removeQuestion: (id: string) => void;
  removeQuestions: (ids: string[]) => void;
  editingQuestionId: string | null;
  setEditingQuestionId: (id: string | null) => void;
  editingQuestion: QuizQuestion | null;
  setEditingQuestion: (q: QuizQuestion | null) => void;
  stats: { generated: number; sent: number };
  settings: TelegramSettings;
  onChannelChange: (channelId: string) => void;
  title?: string;
  sentLabel?: string;
  sentValue?: number;
  showGeneratedStat?: boolean;
  className?: string;
}
