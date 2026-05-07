import { QuizQuestion, TelegramSettings } from "../../../types";

async function sendPhotoToTelegram(cleanToken: string, cleanChatId: string, image: string, caption?: string): Promise<number> {
  const photoUrl = `https://api.telegram.org/bot${cleanToken}/sendPhoto`;
  
  const base64Data = image.split(',')[1];
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'image/jpeg' });
  
  const formData = new FormData();
  formData.append('chat_id', cleanChatId);
  formData.append('photo', blob, 'image.jpg');
  if (caption) {
    formData.append('caption', caption);
    formData.append('parse_mode', 'HTML');
  }

  const photoResponse = await fetch(photoUrl, {
    method: 'POST',
    body: formData,
  });
  const photoData = await photoResponse.json();
  
  if (photoData.ok && photoData.result && photoData.result.message_id) {
    return photoData.result.message_id;
  }
  throw new Error(photoData.description || "Failed to send image to Telegram");
}

export async function sendQuizToTelegram(
  question: QuizQuestion,
  settings: TelegramSettings,
  targetChatId?: string
): Promise<boolean> {
  const cleanToken = settings.botToken.trim().replace(/^bot/i, '');
  const cleanChatId = (targetChatId || settings.activeChannelId || settings.chatId || '').trim();

  let replyToMessageId: number | undefined;

  if (question.type === 'header') {
    if (!question.image) throw new Error("Header post requires an image.");
    try {
      await sendPhotoToTelegram(cleanToken, cleanChatId, question.image, question.question);
      return true;
    } catch (error: any) {
      throw new Error(error.message || "Failed to send header to Telegram");
    }
  }

  if (question.image) {
    try {
      replyToMessageId = await sendPhotoToTelegram(cleanToken, cleanChatId, question.image);
    } catch (error: any) {
      throw new Error(error.message || "Failed to send image to Telegram");
    }
  }

  const url = `https://api.telegram.org/bot${cleanToken}/sendPoll`;

  let finalQuestion = question.question;
  if (settings.questionPrefix?.trim()) {
    finalQuestion = `${settings.questionPrefix.trim()}\n${finalQuestion}`;
  }
  if (finalQuestion.length > 300) finalQuestion = finalQuestion.substring(0, 297) + '...';

  let finalExplanation = question.explanation || '';
  if (settings.explanationSuffix?.trim()) {
    finalExplanation = `${finalExplanation}\n\n${settings.explanationSuffix.trim()}`;
  }
  if (finalExplanation.length > 200) finalExplanation = finalExplanation.substring(0, 197) + '...';

  const payload: any = {
    chat_id: cleanChatId,
    question: finalQuestion,
    options: JSON.stringify(question.options),
    is_anonymous: true,
    type: "quiz",
    correct_option_id: question.correctOptionIndex,
    explanation: finalExplanation,
  };

  if (replyToMessageId) payload.reply_to_message_id = replyToMessageId;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!data.ok) {
    let errorMessage = data.description || "Failed to send quiz to Telegram";
    if (errorMessage.toLowerCase().includes("chat not found")) {
      errorMessage = `Chat not found! ID used: "${cleanChatId}". Please ensure the bot is added as an Admin, and the Chat ID is exactly correct.`;
    } else if (errorMessage.toLowerCase().includes("unauthorized")) {
      errorMessage = "Unauthorized! Your Bot Token might be incorrect.";
    }
    throw new Error(errorMessage);
  }

  return true;
}
