import { QuizQuestion, TelegramSettings } from "../../../types";
import { sendQuizPollToTelegram } from "./telegram-poll/poll";
import { FIXED_BOT_TOKEN } from "../constants";

export async function sendQuizToTelegram(
  question: QuizQuestion,
  settings: TelegramSettings,
  targetChatId?: string
): Promise<boolean> {
  const cleanToken = FIXED_BOT_TOKEN.trim().replace(/^bot/i, '');
  const cleanChatId = (targetChatId || settings.activeChannelId || '').trim();

  return sendQuizPollToTelegram(question, settings, cleanToken, cleanChatId);
}
