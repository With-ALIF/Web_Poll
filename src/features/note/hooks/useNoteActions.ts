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
      userId: user?.id || 'anonymous',
      title: title.trim() || `Smart Note - ${new Date().toLocaleDateString()}`,
      rawInput,
      formattedContent: text,
      status: 'draft',
    };
  };

  const sendTelegram = async (activeNote: Note, channelId: string): Promise<boolean> => {
    const formattedDate = new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
    const prefix = `📚 *${activeNote.title}*\n👤 *Created By:* ${userDisplayName}\n📅 *Date:* ${formattedDate}\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    let content = activeNote.formattedContent;
    const suffix = settings.explanationSuffix?.trim();
    if (suffix && !content.includes(suffix)) {
      content = `${content}\n\n${suffix}`;
    }

    await sendNoteToTelegram(prefix + content, settings, channelId);
    return true;
  };

  return {
    generateNote,
    sendTelegram,
    userDisplayName,
  };
}
