import { useState, useEffect, useMemo, useCallback } from 'react';
import { QuizQuestion } from '../../../types';
import { useAuth } from '../../auth/hooks/useAuth';
import { subscribeToDrafts, saveDraft, deleteDraft, batchSaveDrafts } from '../services/draftService';
import { saveQuiz } from '../../quiz/services/quizService';

export function useDraftsSource() {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    if (!user) {
      setDrafts([]);
      return;
    }
    const unsubscribe = subscribeToDrafts(user.id, setDrafts);
    return () => unsubscribe();
  }, [user?.id]);

  const moveToDraft = useCallback(async (question: QuizQuestion) => {
    if (!user) return;
    await saveDraft(user.id, question);
  }, [user?.id]);

  const moveManyToDraft = useCallback(async (questions: QuizQuestion[]) => {
    if (!user) return;
    await batchSaveDrafts(user.id, questions);
  }, [user?.id]);

  const sendDraftToTelegram = useCallback(async (draft: QuizQuestion, sendFn: (q: QuizQuestion) => Promise<boolean>) => {
    if (!user) return;
    const success = await sendFn(draft);
    if (success) {
      await saveQuiz(user.id, { ...draft, status: 'sent' });
      await deleteDraft(draft.id, user.id);
    }
  }, [user?.id]);

  const handleDeleteDraft = useCallback(async (id: string) => {
    if (!id) return;
    try {
      await deleteDraft(id, user?.id);
    } catch (error) {
      console.error('handleDeleteDraft error:', error);
    }
  }, [user?.id]);

  return useMemo(() => ({ 
    drafts, 
    moveToDraft, 
    moveManyToDraft, 
    sendDraftToTelegram, 
    deleteDraft: handleDeleteDraft 
  }), [drafts, moveToDraft, moveManyToDraft, sendDraftToTelegram, handleDeleteDraft]);
}
