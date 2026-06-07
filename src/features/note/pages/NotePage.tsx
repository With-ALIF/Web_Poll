import React from 'react';
import { useNotePage } from '../hooks/useNotePage';

// Modular Components
import { NoteHeader } from '../components/NoteHeader';
import { NoteAlert } from '../components/NoteAlert';
import { NoteCreatorForm } from '../components/NoteCreatorForm';
import { HistoryList } from '../components/HistoryList';
import { PreviewHeader } from '../components/PreviewHeader';
import { PreviewContent } from '../components/PreviewContent';
import { TelegramDispatch } from '../components/TelegramDispatch';
import { PrintPDFLayout } from '../components/PrintPDFLayout';

export default function NotePage() {
  const {
    state,
    settings,
    userDisplayName,
    notePrintRef,
    handleDownloadPDF,
    handleGenerateNote,
    startEditing,
    handleSaveEdit,
    handleDeleteNote,
    handleSendToTelegram,
    FIXED_BOT_TOKEN,
  } = useNotePage();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mb-12">
      <NoteHeader />
      <NoteAlert message={state.message} onClear={() => state.setMessage(null)} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NoteCreatorForm 
            title={state.title} setTitle={state.setTitle} rawInput={state.rawInput} setRawInput={state.setRawInput} 
            isGenerating={state.isGenerating} onSubmit={handleGenerateNote} 
          />
          <HistoryList 
            loadingNotes={state.loadingNotes} notes={state.notes} activeNote={state.activeNote} 
            onSelect={(note) => { state.setActiveNote(note); state.setIsEditing(false); state.setMessage(null); }} 
          />
        </div>
        <div className="lg:col-span-7">
          {state.activeNote ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 p-6 flex flex-col gap-6">
              <PreviewHeader 
                activeNote={state.activeNote} isEditing={state.isEditing} isDownloadingPdf={state.isDownloadingPdf}
                onStartEditing={startEditing} onDownloadPDF={handleDownloadPDF} onSaveEdit={handleSaveEdit}
                onCancelEdit={() => state.setIsEditing(false)} onDelete={handleDeleteNote}
              />
              <PreviewContent 
                activeNote={state.activeNote} isEditing={state.isEditing} editedContent={state.editedContent}
                setEditedContent={state.setEditedContent} userDisplayName={userDisplayName}
              />
              <TelegramDispatch 
                settings={settings} selectedChannelId={state.selectedChannelId} setSelectedChannelId={state.setSelectedChannelId}
                isSending={state.isSending} isEditing={state.isEditing} onSend={handleSendToTelegram} fixedBotToken={FIXED_BOT_TOKEN}
              />
            </div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/20 p-8 text-center text-slate-400">
              <span className="text-sm font-bold text-slate-700">No Note Selected</span>
            </div>
          )}
        </div>
      </div>
      <PrintPDFLayout activeNote={state.activeNote} userDisplayName={userDisplayName} printRef={notePrintRef} />
    </div>
  );
}
