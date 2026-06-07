import { Note, TelegramSettings } from '../../../types';
import { formatNoteWithGemini } from '../services/noteService';
import { sendNoteToTelegram } from '../../quiz/services/telegramService';

interface NoteActionsProps {
  user: any;
  settings: TelegramSettings;
  fixedBotToken: string;
}

export function useNoteActions({ user, settings, fixedBotToken }: NoteActionsProps) {
  const userDisplayName = user?.displayName || user?.email || 'Student';

  const generateNote = async (title: string, rawInput: string): Promise<Note> => {
    const text = await formatNoteWithGemini(rawInput);
    return {
      id: `note_${Date.now()}`,
      userId: user?.uid || 'anonymous',
      title: title.trim() || `Smart Note - ${new Date().toLocaleDateString()}`,
      rawInput,
      formattedContent: text,
      status: 'draft',
    };
  };

  const sendTelegram = async (activeNote: Note, channelId: string): Promise<boolean> => {
    const formattedDate = new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
    const prefix = `📚 *${activeNote.title}*\n👤 *Created By:* ${userDisplayName}\n📅 *Date:* ${formattedDate}\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    const token = settings.botToken || fixedBotToken;
    await sendNoteToTelegram(prefix + activeNote.formattedContent, { ...settings, botToken: token }, channelId);
    return true;
  };

  return {
    generateNote,
    sendTelegram,
    userDisplayName,
  };
}
