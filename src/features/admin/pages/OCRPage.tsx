import React from 'react';
import OCRQuizInput from '../../quiz/components/editor/OCR/index';
import QuizList from '../../quiz/components/list/QuizList';
import { useAppInit } from '../../../app/useAppInit';

interface OCRPageProps {
  appState: ReturnType<typeof useAppInit>;
  handleDraftSelected: (ids: string[]) => Promise<void>;
}

export default function OCRPage({ appState, handleDraftSelected }: OCRPageProps) {
  const { settings, quiz, telegram, pendingQuestions } = appState;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200">
            <OCRQuizInput 
              onGenerate={quiz.handleGenerateFromImage}
              isGenerating={quiz.isGenerating}
              questionCount={quiz.questionCount}
              setQuestionCount={quiz.setQuestionCount}
            />
          </div>
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
          />
        </div>
      </div>
    </div>
  );
}
