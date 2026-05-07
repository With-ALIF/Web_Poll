import { useMemo } from 'react';
import { QuizQuestion } from '../../../types';

export function useQuizExport(filteredQuestions: QuizQuestion[], selectedIds: string[]) {
  const exportQuestions = useMemo(() => {
    return selectedIds.length > 0 
      ? filteredQuestions.filter(q => selectedIds.includes(q.id)) 
      : filteredQuestions;
  }, [filteredQuestions, selectedIds]);

  return {
    exportQuestions,
    selectedCount: selectedIds.length
  };
}
