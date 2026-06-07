import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import QuizListHeader from './QuizListHeader';
import QuizListToolbar from './QuizListToolbar';
import QuizEmptyState from '../core/QuizEmptyState';
import QuizListItems from './QuizListItems';
import QuizExportSection from '../export/QuizExportSection';
import QuizBulkSection from '../bulk/QuizBulkSection';
import { useQuizSelection } from '../../hooks/useQuizSelection';
import { useQuizFilter } from '../../hooks/useQuizFilter';
import { useQuizExport } from '../../hooks/useQuizExport';
import { QuizListProps } from './QuizList.types';

export default function QuizList({
  questions,
  setQuestions,
  handleSendAll,
  handleSendSelected,
  onDraftSelected,
  handleSendToTelegram,
  removeQuestion,
  removeQuestions,
  editingQuestionId,
  setEditingQuestionId,
  editingQuestion,
  setEditingQuestion,
  stats,
  settings,
  onChannelChange,
  title,
  sentLabel,
  sentValue,
  showGeneratedStat,
  sendError,
  onClearError,
  isBulkSending,
  isStopping,
  handleStopSend,
  bulkSendStatus,
  className = ""
}: QuizListProps) {
  const { selectedTopic, setSelectedTopic, filteredQuestions } = useQuizFilter(questions);
  const { 
    selectedIds, 
    handleSelectAll, 
    toggleSelection, 
    clearSelection, 
    isAllSelected, 
    selectedCount 
  } = useQuizSelection(questions, filteredQuestions);
  const { exportQuestions } = useQuizExport(filteredQuestions, selectedIds);

  const handleDeleteSelected = () => {
    removeQuestions(selectedIds);
    clearSelection();
  };

  const onSendSelected = () => {
    if (selectedIds.length > 0) {
      handleSendSelected(selectedIds);
    } else {
      handleSendAll();
    }
    clearSelection();
  };

  const handleDraftSelected = () => {
    if (onDraftSelected) {
      onDraftSelected(selectedIds);
      clearSelection();
    }
  };

  const handleSetBulkTopic = (topic: string) => {
    setQuestions(prev => prev.map(q => 
      selectedIds.includes(q.id) ? { ...q, topic } : q
    ));
    clearSelection();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <QuizListHeader 
        totalQuestions={questions.length} 
        stats={stats}
        title={title}
        sentLabel={sentLabel}
        sentValue={sentValue}
        showGeneratedStat={showGeneratedStat}
      >
        <QuizListToolbar 
          questions={questions}
          settings={settings}
          onChannelChange={onChannelChange}
          handleSendAll={handleSendAll}
          selectedTopic={selectedTopic}
          onTopicChange={setSelectedTopic}
        />
      </QuizListHeader>

      <AnimatePresence>
        {isBulkSending && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600 shrink-0">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
                </span>
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-indigo-900">
                  {bulkSendStatus || "পোল পাঠানো হচ্ছে..."}
                </h4>
                <p className="text-xs text-indigo-700 mt-0.5 leading-relaxed">
                  {bulkSendStatus 
                    ? "টেলিগ্রামের লিমিট এড়াতে প্রতি ২০টি পোল পাঠানোর পর ৪০ সেকেন্ড বিরতি নেওয়া হয়।" 
                    : "সবগুলো পোল একে একে টেলিগ্রামে পাঠানো হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন।"
                  }
                </p>
              </div>
            </div>
            {handleStopSend && (
              <button 
                onClick={handleStopSend}
                disabled={isStopping}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shrink-0 self-end sm:self-auto"
              >
                {isStopping ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    থামানো হচ্ছে...
                  </>
                ) : (
                  <>
                    <X className="w-3.5 h-3.5" />
                    Stop Send Poll
                  </>
                )}
              </button>
            )}
          </motion.div>
        )}

        {sendError && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 shadow-sm"
          >
            <div className="bg-red-100 p-1.5 rounded-lg text-red-600 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-red-900">Send Error</h4>
              <p className="text-xs text-red-700 mt-0.5 leading-relaxed break-words">{sendError}</p>
            </div>
            {onClearError && (
              <button 
                onClick={onClearError}
                className="p-1 hover:bg-red-100 rounded-lg text-red-400 hover:text-red-600 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <QuizExportSection 
        questions={exportQuestions} 
        selectedCount={selectedCount}
        onSendToTelegram={() => onSendSelected()}
      />

      <QuizBulkSection 
        filteredQuestions={filteredQuestions}
        selectedIds={selectedIds}
        isAllSelected={isAllSelected}
        handleSelectAll={handleSelectAll}
        onSendSelected={onSendSelected}
        onDraftSelected={handleDraftSelected}
        handleDeleteSelected={handleDeleteSelected}
        onSetTopic={handleSetBulkTopic}
      />

      <div className="space-y-4">
        <AnimatePresence>
          {filteredQuestions.length === 0 ? (
            <QuizEmptyState />
          ) : (
            <QuizListItems 
              questions={filteredQuestions}
              setQuestions={setQuestions}
              selectedIds={selectedIds}
              toggleSelection={toggleSelection}
              removeQuestion={removeQuestion}
              handleSendToTelegram={handleSendToTelegram}
              editingQuestionId={editingQuestionId}
              setEditingQuestionId={setEditingQuestionId}
              editingQuestion={editingQuestion}
              setEditingQuestion={setEditingQuestion}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
