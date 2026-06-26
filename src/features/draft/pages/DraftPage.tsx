import React, { useState } from 'react';
import { useDrafts } from '../hooks/useDrafts';
import { useDraftPageActions } from '../hooks/useDraftPageActions';
import DraftList from '../components/DraftList';
import DraftToolbar from '../components/DraftToolbar';
import DraftDetailsModal from '../components/DraftDetailsModal';
import DraftCsvExportModal from '../components/DraftCsvExportModal';
import { useAppInit } from '../../../app/useAppInit';
import DeleteConfirmModal from '../../../components/DeleteConfirmModal';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, X, Filter } from 'lucide-react';
import { QUIZ_TOPICS } from '../../quiz/constants';

export default function DraftPage() {
  const { drafts, deleteDraft, sendDraftToTelegram, moveManyToDraft } = useDrafts();
  const { telegram } = useAppInit();
  
  const [filterTopic, setFilterTopic] = useState('all');
  const filteredDrafts = filterTopic === 'all' 
    ? drafts 
    : filterTopic === 'uncategorized'
      ? drafts.filter(d => !d.topic)
      : drafts.filter(d => d.topic === filterTopic);

  const {
    selectedIds, selectedDraftForDetails, setSelectedDraftForDetails,
    isExportModalOpen, setIsExportModalOpen,
    deleteModalOpen, setDeleteModalOpen,
    isBulkDelete, isDeleting,
    handleSend, toggleSelect, toggleSelectAll, 
    handleBulkDelete, handleSingleDelete, confirmDelete, handleBulkSend,
    handleSetTopic
  } = useDraftPageActions(filteredDrafts, deleteDraft, sendDraftToTelegram, telegram, moveManyToDraft);

  const selectedDrafts = filteredDrafts.filter(d => selectedIds.has(d.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Draft Polls</h1>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              className="bg-transparent text-sm outline-none w-40 cursor-pointer font-medium text-slate-700"
            >
              <option value="all">All Subjects</option>
              <option value="uncategorized">Uncategorized</option>
              {QUIZ_TOPICS.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>
          <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap">
            {filteredDrafts.length} {filterTopic !== 'all' ? 'Filtered' : 'Total'} Drafts
          </span>
        </div>
      </div>

      <AnimatePresence>
        {telegram.sendError && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 shadow-sm mb-6"
          >
            <div className="bg-red-100 p-1.5 rounded-lg text-red-600 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-red-900">Error</h4>
              <p className="text-xs text-red-700 mt-0.5 leading-relaxed break-words">{telegram.sendError}</p>
            </div>
            <button 
              onClick={() => telegram.setSendError(null)}
              className="p-1 hover:bg-red-100 rounded-lg text-red-400 hover:text-red-600 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <DraftToolbar
        selectedCount={selectedIds.size}
        totalCount={filteredDrafts.length}
        onDeleteSelected={handleBulkDelete}
        onSendSelected={handleBulkSend}
        onDownloadCsv={() => setIsExportModalOpen(true)}
        onToggleSelectAll={toggleSelectAll}
        isAllSelected={selectedIds.size === filteredDrafts.length && filteredDrafts.length > 0}
        onSetTopic={handleSetTopic}
      />

      <DraftList 
        drafts={filteredDrafts} 
        onSend={handleSend} 
        onDelete={handleSingleDelete}
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

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title={isBulkDelete ? "Delete Drafts" : "Delete Draft"}
        message={isBulkDelete 
          ? `Are you sure you want to delete ${selectedIds.size} selected drafts? This action cannot be undone.` 
          : "Are you sure you want to delete this draft? This action cannot be undone."}
      />
    </div>
  );
}
