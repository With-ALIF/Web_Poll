import React from 'react';
import { Route } from 'react-router-dom';
import QuizInput from '../../features/quiz/components/editor/QuizInput';
import QuizList from '../../features/quiz/components/list/QuizList';
import DraftPage from '../../features/draft/pages/DraftPage';
import QBSPage from '../../features/qbs/pages/QBSPage';
import OCRPage from '../../features/admin/pages/OCRPage';
import ExamPaperPage from '../../features/exam-paper/pages/ExamPaperPage';
import PhotoCardPage from '../../features/photocard/PhotoCardPage';
import CSVModifier from '../../features/quiz/components/export/CSVModifier';
import ChannelFormattingOverview from '../../features/settings/components/channel/ChannelFormattingOverview';
import ProtectedRoute from '../../components/ProtectedRoute';
import NotePage from '../../features/note/pages/NotePage';
import { useAppInit } from '../useAppInit';

interface FeatureRoutesProps {
  appState: ReturnType<typeof useAppInit>;
  handleDraftSelected: (ids: string[]) => Promise<void>;
}

export const useFeatureRoutes = ({ appState, handleDraftSelected }: FeatureRoutesProps) => {
  const { settings, quiz, telegram, pendingQuestions, sentQuestions } = appState;

  return (
    <>
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5">
                  <QuizInput 
                    inputText={quiz.inputText}
                    setInputText={quiz.setInputText}
                    questionCount={quiz.questionCount}
                    setQuestionCount={quiz.setQuestionCount}
                    isGenerating={quiz.isGenerating}
                    error={quiz.error || telegram.sendError}
                    handleGenerate={quiz.handleGenerate}
                    handleGenerateMore={quiz.handleGenerateMore}
                    handleGenerateFromImage={quiz.handleGenerateFromImage}
                    lastInputText={quiz.lastInputText}
                    addManualQuestion={quiz.addManualQuestion}
                    preserveBoardInfo={quiz.preserveBoardInfo}
                    setPreserveBoardInfo={quiz.setPreserveBoardInfo}
                  />
                </div>
                <div className="lg:col-span-7">
                  <QuizList 
                    questions={pendingQuestions}
                    setQuestions={quiz.setQuestions}
                    handleSendAll={() => telegram.handleSendAll(pendingQuestions)}
                    handleSendSelected={telegram.handleSendSelected}
                    onDraftSelected={handleDraftSelected}
                    handleSendToTelegram={telegram.handleSendToTelegram}
                    removeQuestion={quiz.removeQuestion}
                    removeQuestions={quiz.removeQuestions}
                    editingQuestionId={quiz.editingQuestionId}
                    setEditingQuestionId={quiz.setEditingQuestionId}
                    editingQuestion={quiz.editingQuestion}
                    setEditingQuestion={quiz.setEditingQuestion}
                    stats={quiz.stats}
                    settings={settings.settings}
                    onChannelChange={(id) => settings.saveSettings({ ...settings.settings, activeChannelId: id })}
                    sendError={telegram.sendError}
                    onClearError={() => telegram.setSendError(null)}
                    isBulkSending={telegram.isBulkSending}
                    isStopping={telegram.isStopping}
                    handleStopSend={telegram.handleStopSend}
                    bulkSendStatus={telegram.bulkSendStatus}
                  />
                </div>
              </div>
            </div>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/drafts" 
        element={
          <ProtectedRoute permission="drafts">
            <DraftPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/polls" 
        element={
          <ProtectedRoute permission="polls">
            <div className="max-w-4xl mx-auto">
              <QuizList 
                questions={sentQuestions}
                setQuestions={quiz.setQuestions}
                handleSendAll={() => telegram.handleSendAll(sentQuestions)}
                handleSendSelected={telegram.handleSendSelected}
                handleSendToTelegram={telegram.handleSendToTelegram}
                removeQuestion={quiz.removeQuestion}
                removeQuestions={quiz.removeQuestions}
                editingQuestionId={quiz.editingQuestionId}
                setEditingQuestionId={quiz.setEditingQuestionId}
                editingQuestion={quiz.editingQuestion}
                setEditingQuestion={quiz.setEditingQuestion}
                stats={quiz.stats}
                settings={settings.settings}
                onChannelChange={(id) => settings.saveSettings({ ...settings.settings, activeChannelId: id })}
                sendError={telegram.sendError}
                onClearError={() => telegram.setSendError(null)}
                isBulkSending={telegram.isBulkSending}
                isStopping={telegram.isStopping}
                handleStopSend={telegram.handleStopSend}
                bulkSendStatus={telegram.bulkSendStatus}
                title="Total Polls"
                sentLabel="Total Poll"
                sentValue={sentQuestions.length}
                showGeneratedStat={false}
              />
            </div>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/qbs" 
        element={
          <ProtectedRoute permission="qbs">
            <QBSPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ocr" 
        element={
          <ProtectedRoute permission="ocr">
            <OCRPage appState={appState} handleDraftSelected={handleDraftSelected} />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/csv-modifier" 
        element={
          <ProtectedRoute permission="csv-modifier">
            <CSVModifier />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/channel-formats" 
        element={
          <ProtectedRoute permission="formats">
            <ChannelFormattingOverview settings={settings.settings} />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/photocard" 
        element={
          <ProtectedRoute permission="photocard">
            <PhotoCardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/exam-paper" 
        element={
          <ProtectedRoute permission="exam-paper">
            <ExamPaperPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/note" 
        element={
          <ProtectedRoute permission="note">
            <NotePage />
          </ProtectedRoute>
        } 
      />
    </>
  );
};
