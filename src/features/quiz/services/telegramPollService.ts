import { QuizQuestion, TelegramSettings } from "../../../types";
import { sendHeaderToTelegram } from "./telegram-poll/header";
import { sendQuizPollToTelegram } from "./telegram-poll/poll";

export async function sendQuizToTelegram(
  question: QuizQuestion,
  settings: TelegramSettings,
  targetChatId?: string
): Promise<boolean> {
  const cleanToken = settings.botToken.trim().replace(/^bot/i, '');
  const cleanChatId = (targetChatId || settings.activeChannelId || settings.chatId || '').trim();

  if (question.type === 'header') {
    return sendHeaderToTelegram(question, cleanToken, cleanChatId);
  }

  return sendQuizPollToTelegram(question, settings, cleanToken, cleanChatId);
}
