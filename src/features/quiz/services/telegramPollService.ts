import { QuizQuestion, TelegramSettings } from "../../../types";
import { sendQuizPollToTelegram } from "./telegram-poll/poll";

export async function sendQuizToTelegram(
  question: QuizQuestion,
  settings: TelegramSettings,
  targetChatId?: string
): Promise<boolean> {
  const cleanChatId = (targetChatId || settings?.activeChannelId || '').trim();
  const token = (settings?.botToken || '').trim();

  return sendQuizPollToTelegram(question, settings, token, cleanChatId);
}
