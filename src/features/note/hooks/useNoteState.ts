import { useState, useEffect } from 'react';
import { Note } from '../../../types';

export function useNoteState() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [rawInput, setRawInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  useEffect(() => {
    setLoadingNotes(false);
  }, []);

  return {
    notes, setNotes,
    activeNote, setActiveNote,
    title, setTitle,
    rawInput, setRawInput,
    isGenerating, setIsGenerating,
    isSending, setIsSending,
    isEditing, setIsEditing,
    editedContent, setEditedContent,
    selectedChannelId, setSelectedChannelId,
    message, setMessage,
    loadingNotes,
    isDownloadingPdf, setIsDownloadingPdf,
  };
}
