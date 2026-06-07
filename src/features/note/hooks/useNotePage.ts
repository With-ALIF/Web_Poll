import { useRef, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useSettings } from '../../settings/hooks/useSettings';
import { useNoteState } from './useNoteState';
import { useNoteActions } from './useNoteActions';
import { useNotePDF } from './useNotePDF';
import { FIXED_BOT_TOKEN } from '../../../app/useAppInit';

export function useNotePage() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const notePrintRef = useRef<HTMLDivElement>(null);

  const state = useNoteState();
  const { generateNote, sendTelegram, userDisplayName } = useNoteActions({
    user,
    settings,
    fixedBotToken: FIXED_BOT_TOKEN,
  });
  const { exportPDF } = useNotePDF();

  useEffect(() => {
    if (settings.channels && settings.channels.length > 0) {
      state.setSelectedChannelId(settings.activeChannelId || settings.channels[0].id);
    }
  }, [settings, state.setSelectedChannelId]);

  const handleDownloadPDF = async () => {
    if (!state.activeNote) return;
    state.setIsDownloadingPdf(true);
    state.setMessage(null);
    try {
      await exportPDF(state.activeNote.title, userDisplayName, notePrintRef);
      state.setMessage({ type: 'success', text: 'Beautiful PDF note downloaded successfully!' });
    } catch (err: any) {
      state.setMessage({ type: 'error', text: 'Failed to export note as PDF.' });
    } finally {
      state.setIsDownloadingPdf(false);
    }
  };

  const handleGenerateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.rawInput.trim()) return;
    state.setIsGenerating(true);
    state.setMessage(null);
    try {
      const newNote = await generateNote(state.title, state.rawInput);
      state.setNotes(prev => [newNote, ...prev]);
      state.setActiveNote(newNote);
      state.setTitle('');
      state.setRawInput('');
      state.setMessage({ type: 'success', text: 'Beautiful note generated successfully!' });
    } catch (err: any) {
      state.setMessage({ type: 'error', text: err.message || 'Failed to generate note.' });
    } finally {
      state.setIsGenerating(false);
    }
  };

  const startEditing = () => {
    if (!state.activeNote) return;
    state.setEditedContent(state.activeNote.formattedContent);
    state.setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!state.activeNote) return;
    const updated = { ...state.activeNote, formattedContent: state.editedContent, updatedAt: new Date() };
    state.setNotes(prev => prev.map(n => n.id === state.activeNote?.id ? updated : n));
    state.setActiveNote(updated);
    state.setIsEditing(false);
    state.setMessage({ type: 'success', text: 'Note updated successfully!' });
  };

  const handleDeleteNote = (noteId: string) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    const remaining = state.notes.filter(n => n.id !== noteId);
    state.setNotes(remaining);
    if (state.activeNote?.id === noteId) {
      state.setActiveNote(remaining.length > 0 ? remaining[0] : null);
      state.setIsEditing(false);
    }
    state.setMessage({ type: 'success', text: 'Note deleted successfully!' });
  };

  const handleSendToTelegram = async () => {
    if (!state.activeNote || !state.selectedChannelId) return;
    state.setIsSending(true);
    state.setMessage(null);
    try {
      await sendTelegram(state.activeNote, state.selectedChannelId);
      const updated = { ...state.activeNote, status: 'sent' as const };
      state.setNotes(prev => prev.map(n => n.id === state.activeNote?.id ? updated : n));
      state.setActiveNote(updated);
      state.setMessage({ type: 'success', text: '⚡ Note beautifully sent to your Telegram channel!' });
    } catch (err: any) {
      state.setMessage({ type: 'error', text: err.message || 'Failed to send note to Telegram.' });
    } finally {
      state.setIsSending(false);
    }
  };

  return {
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
  };
}
