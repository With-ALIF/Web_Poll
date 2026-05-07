import React from 'react';
import { AnimatePresence } from 'motion/react';
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
    handleSendSelected(selectedIds);
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

      <QuizExportSection 
        questions={exportQuestions} 
        selectedCount={selectedCount}
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
