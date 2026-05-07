import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../../../types';

export function useQuizSelection(questions: QuizQuestion[], filteredQuestions: QuizQuestion[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    // Clean up selectedIds if questions are removed individually
    setSelectedIds(prev => prev.filter(id => questions.some(q => q.id === id)));
  }, [questions]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredQuestions.map(q => q.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  return {
    selectedIds,
    setSelectedIds,
    handleSelectAll,
    toggleSelection,
    clearSelection,
    isAllSelected: selectedIds.length === filteredQuestions.length && filteredQuestions.length > 0,
    selectedCount: selectedIds.length
  };
}
