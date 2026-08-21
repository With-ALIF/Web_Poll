import { QuizQuestion, TelegramSettings } from "../../../../types";
import { sendPhotoToTelegram } from "./photo";
import { handleTelegramError } from "./errorHelper";
import { formatQuestionText, formatExplanationText } from "./format";

export async function sendQuizPollToTelegram(
  question: QuizQuestion,
  settings: TelegramSettings,
  cleanToken: string,
  cleanChatId: string
): Promise<boolean> {
  const targetId = cleanChatId ? cleanChatId.trim() : (settings.activeChannelId || '').trim();
  if (!targetId) {
    throw new Error("টেলিগ্রাম চ্যানেল বা চ্যাট আইডি পাওয়া যায়নি। অনুগ্রহ করে সেটিংস থেকে চ্যানেল নির্বাচন করুন।");
  }

  // Sanitize options
  const sanitizedOptions = (question.options || [])
    .map(opt => (typeof opt === 'string' ? opt : (opt as any)?.text || String(opt || '')).trim())
    .filter(Boolean)
    .map(opt => opt.substring(0, 100));

  if (sanitizedOptions.length < 2 || sanitizedOptions.length > 10) {
    throw new Error("Telegram polls must have between 2 and 10 options.");
  }

  const correctIndex = Math.max(0, Math.min(sanitizedOptions.length - 1, Number(question.correctOptionIndex ?? 0)));

  const finalToken = (cleanToken || (settings as any)?.botToken || '').trim();

  let replyToMessageId: number | undefined;
  if (question.image) {
    try {
      replyToMessageId = await sendPhotoToTelegram(finalToken, targetId, question.image);
    } catch (error: any) {
      throw new Error(error.message || "Failed to send image to Telegram");
    }
  }

  const url = `/api/telegram/sendPoll`;
  const explanation = formatExplanationText(question, settings);

  const payload: any = {
    chat_id: targetId,
    question: formatQuestionText(question, settings),
    options: sanitizedOptions,
    is_anonymous: true,
    type: "quiz",
    correct_option_id: correctIndex,
  };

  if (explanation && explanation.trim().length > 0) {
    payload.explanation = explanation.trim().substring(0, 200);
    payload.explanation_parse_mode = "HTML";
  }

  if (replyToMessageId) payload.reply_to_message_id = replyToMessageId;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (finalToken) {
    headers["x-telegram-bot-token"] = finalToken;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const resText = await response.text();
  let data: any = {};
  try {
    data = resText ? JSON.parse(resText) : {};
  } catch {
    data = { ok: false, error: resText || `Server returned HTTP ${response.status}` };
  }

  if (!response.ok || !data.ok) {
    handleTelegramError(data.error || data.description || "Failed to send quiz to Telegram", targetId);
  }

  return true;
}
