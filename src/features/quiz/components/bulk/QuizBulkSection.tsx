import React from 'react';
import QuizBulkActions from './QuizBulkActions';
import { QuizQuestion } from '../../../../types';

interface QuizBulkSectionProps {
  filteredQuestions: QuizQuestion[];
  selectedIds: string[];
  isAllSelected: boolean;
  handleSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendSelected: () => void;
  onDraftSelected: () => void;
  handleDeleteSelected: () => void;
  onSetTopic: (topic: string) => void;
}

export default function QuizBulkSection({
  filteredQuestions,
  selectedIds,
  isAllSelected,
  handleSelectAll,
  onSendSelected,
  onDraftSelected,
  handleDeleteSelected,
  onSetTopic
}: QuizBulkSectionProps) {
  return (
    <QuizBulkActions 
      totalQuestions={filteredQuestions.length}
      selectedCount={selectedIds.length}
      isAllSelected={isAllSelected}
      handleSelectAll={handleSelectAll}
      onSendSelected={onSendSelected}
      onDraftSelected={onDraftSelected}
      handleDeleteSelected={handleDeleteSelected}
      onSetTopic={onSetTopic}
    />
  );
}
