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
  if (question.options.length < 2 || question.options.length > 10) {
    throw new Error("Telegram polls must have between 2 and 10 options.");
  }
  if (question.correctOptionIndex < 0 || question.correctOptionIndex >= question.options.length) {
    throw new Error("Correct option index is invalid for this quiz.");
  }

  let replyToMessageId: number | undefined;
  if (question.image) {
    try {
      replyToMessageId = await sendPhotoToTelegram(cleanToken, cleanChatId, question.image);
    } catch (error: any) {
      throw new Error(error.message || "Failed to send image to Telegram");
    }
  }

  const url = `https://api.telegram.org/bot${cleanToken}/sendPoll`;
  const payload: any = {
    chat_id: cleanChatId,
    question: formatQuestionText(question, settings),
    options: question.options,
    is_anonymous: true,
    type: "quiz",
    correct_option_id: question.correctOptionIndex,
    explanation: formatExplanationText(question, settings),
    explanation_parse_mode: "HTML",
  };

  if (replyToMessageId) payload.reply_to_message_id = replyToMessageId;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!data.ok) {
    handleTelegramError(data.description || "Failed to send quiz to Telegram", cleanChatId);
  }

  return true;
}
