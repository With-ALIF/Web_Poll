import { useState } from 'react';
import { QuizQuestion } from '../../../types';

export function useDraftPageActions(drafts: QuizQuestion[], deleteDraft: any, sendDraftToTelegram: any, telegram: any) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedDraftForDetails, setSelectedDraftForDetails] = useState<QuizQuestion | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleSend = async (draft: QuizQuestion) => {
    await sendDraftToTelegram(draft, async (q: QuizQuestion) => {
      try {
        await telegram.handleSendToTelegram(q.id);
        return true;
      } catch (e) {
        return false;
      }
    });
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === drafts.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(drafts.map(d => d.id)));
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} drafts?`)) {
      for (const id of selectedIds) {
        try { await deleteDraft(id); } catch (error) { console.error(error); }
      }
      setSelectedIds(new Set());
    }
  };

  const handleBulkSend = async () => {
    const selectedDrafts = drafts
      .filter(d => selectedIds.has(d.id))
      .sort((a, b) => {
        if (a.type === 'header' && b.type !== 'header') return -1;
        if (a.type !== 'header' && b.type === 'header') return 1;
        return 0;
      });
    for (const draft of selectedDrafts) { await handleSend(draft); }
    setSelectedIds(new Set());
  };

  return {
    selectedIds, selectedDraftForDetails, setSelectedDraftForDetails,
    isExportModalOpen, setIsExportModalOpen,
    handleSend, toggleSelect, toggleSelectAll, handleBulkDelete, handleBulkSend
  };
}
