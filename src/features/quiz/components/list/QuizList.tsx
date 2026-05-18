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
