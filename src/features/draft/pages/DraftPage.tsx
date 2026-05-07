import React from 'react';
import { useDrafts } from '../hooks/useDrafts';
import { useDraftPageActions } from '../hooks/useDraftPageActions';
import DraftList from '../components/DraftList';
import DraftToolbar from '../components/DraftToolbar';
import DraftDetailsModal from '../components/DraftDetailsModal';
import DraftCsvExportModal from '../components/DraftCsvExportModal';
import { useAppInit } from '../../../app/useAppInit';

export default function DraftPage() {
  const { drafts, deleteDraft, sendDraftToTelegram } = useDrafts();
  const { telegram } = useAppInit();
  const {
    selectedIds, selectedDraftForDetails, setSelectedDraftForDetails,
    isExportModalOpen, setIsExportModalOpen,
    handleSend, toggleSelect, toggleSelectAll, handleBulkDelete, handleBulkSend
  } = useDraftPageActions(drafts, deleteDraft, sendDraftToTelegram, telegram);

  const selectedDrafts = drafts.filter(d => selectedIds.has(d.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-3">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Draft Polls</h1>
        </div>
        <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-sm font-bold">
          {drafts.length} Total Drafts
        </span>
      </div>

      <DraftToolbar
        selectedCount={selectedIds.size}
        totalCount={drafts.length}
        onDeleteSelected={handleBulkDelete}
        onSendSelected={handleBulkSend}
        onDownloadCsv={() => setIsExportModalOpen(true)}
        onToggleSelectAll={toggleSelectAll}
        isAllSelected={selectedIds.size === drafts.length && drafts.length > 0}
      />

      <DraftList 
        drafts={drafts} 
        onSend={handleSend} 
        onDelete={deleteDraft}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onOpenDetails={setSelectedDraftForDetails}
      />

      {selectedDraftForDetails && (
        <DraftDetailsModal 
          draft={selectedDraftForDetails} 
          onClose={() => setSelectedDraftForDetails(null)} 
        />
      )}

      {isExportModalOpen && (
        <DraftCsvExportModal
          selectedDrafts={selectedDrafts}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </div>
  );
}
