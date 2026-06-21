import { useState } from 'react';
import { QuizQuestion } from '../../../types';

export function useDraftPageActions(drafts: QuizQuestion[], deleteDraft: any, sendDraftToTelegram: any, telegram: any) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedDraftForDetails, setSelectedDraftForDetails] = useState<QuizQuestion | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState<QuizQuestion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSend = async (draft: QuizQuestion) => {
    await sendDraftToTelegram(draft, async (q: QuizQuestion) => {
      try {
        await telegram.handleSendToTelegram(q.id, q);
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

  const handleBulkDelete = () => {
    setIsBulkDelete(true);
    setDraftToDelete(null);
    setDeleteModalOpen(true);
  };

  const handleSingleDelete = (id: string) => {
    const draft = drafts.find(d => d.id === id);
    if (!draft) return;
    setIsBulkDelete(false);
    setDraftToDelete(draft);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (isBulkDelete) {
        for (const id of selectedIds) {
          try { await deleteDraft(id); } catch (error) { console.error(error); }
        }
        setSelectedIds(new Set());
      } else if (draftToDelete) {
        await deleteDraft(draftToDelete.id);
      }
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setDraftToDelete(null);
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
    deleteModalOpen, setDeleteModalOpen, 
    isBulkDelete, draftToDelete, isDeleting,
    handleSend, toggleSelect, toggleSelectAll, 
    handleBulkDelete, handleSingleDelete, confirmDelete, handleBulkSend
  };
}
