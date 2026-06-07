import { QuizQuestion } from "../../../../types";
import { sendPhotoToTelegram } from "./photo";

export async function sendHeaderToTelegram(
  question: QuizQuestion,
  cleanToken: string,
  cleanChatId: string
): Promise<boolean> {
  if (question.image) {
    try {
      await sendPhotoToTelegram(cleanToken, cleanChatId, question.image, question.question);
      return true;
    } catch (error: any) {
      throw new Error(error.message || "Failed to send header to Telegram");
    }
  }

  try {
    const textUrl = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
    const response = await fetch(textUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: question.question,
        parse_mode: 'HTML'
      }),
    });
    const textData = await response.json();
    if (textData.ok) {
      return true;
    }
    throw new Error(textData.description || "Failed to send text header to Telegram");
  } catch (error: any) {
    throw new Error(error.message || "Failed to send header message to Telegram");
  }
}
