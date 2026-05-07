import { QuizQuestion, TelegramSettings } from "../../../types";

export async function getChatDetails(chatId: string, botToken: string) {
  const cleanToken = botToken.trim().replace(/^bot/i, '');
  const cleanChatId = chatId.trim();

  if (!cleanChatId || !cleanToken) return null;

  const url = `https://api.telegram.org/bot${cleanToken}/getChat?chat_id=${cleanChatId}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.ok) {
      return data.result;
    }
    throw new Error(data.description || 'Chat not found');
  } catch (error) {
    // We don't log the error here to avoid triggering the error overlay
    // for expected user errors (like typing an invalid chat ID).
    // The error is caught and displayed in the UI.
    throw error;
  }
}

export async function sendQuizToTelegram(
  question: QuizQuestion,
  settings: TelegramSettings,
  targetChatId?: string
): Promise<boolean> {
  // Sanitize inputs to remove accidental spaces or 'bot' prefix
  const cleanToken = settings.botToken.trim().replace(/^bot/i, '');
  const cleanChatId = (targetChatId || settings.activeChannelId || settings.chatId || '').trim();

  let replyToMessageId: number | undefined;

  // If there's an image, send it first
  if (question.image) {
    const photoUrl = `https://api.telegram.org/bot${cleanToken}/sendPhoto`;
    
    // Convert base64 to blob
    const base64Data = question.image.split(',')[1];
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

    try {
      const photoResponse = await fetch(photoUrl, {
        method: 'POST',
        body: formData,
      });
      const photoData = await photoResponse.json();
      
      if (photoData.ok && photoData.result && photoData.result.message_id) {
        replyToMessageId = photoData.result.message_id;
      } else {
        console.error("Failed to send photo:", photoData);
        throw new Error(photoData.description || "Failed to send image to Telegram");
      }
    } catch (error: any) {
      console.error("Error sending photo:", error);
      throw new Error(error.message || "Failed to send image to Telegram");
    }
  }

  const url = `https://api.telegram.org/bot${cleanToken}/sendPoll`;

  let finalQuestion = question.question;
  if (settings.questionPrefix && settings.questionPrefix.trim() !== '') {
    finalQuestion = `${settings.questionPrefix.trim()}\n${finalQuestion}`;
  }

  // Telegram poll question limit is 300 characters
  if (finalQuestion.length > 300) {
    finalQuestion = finalQuestion.substring(0, 297) + '...';
  }

  let finalExplanation = question.explanation || '';
  if (settings.explanationSuffix && settings.explanationSuffix.trim() !== '') {
    finalExplanation = `${finalExplanation}\n\n${settings.explanationSuffix.trim()}`;
  }

  // Telegram poll explanation limit is 200 characters
  if (finalExplanation.length > 200) {
    finalExplanation = finalExplanation.substring(0, 197) + '...';
  }

  const payload: any = {
    chat_id: cleanChatId,
    question: finalQuestion,
    options: JSON.stringify(question.options),
    is_anonymous: true,
    type: "quiz",
    correct_option_id: question.correctOptionIndex,
    explanation: finalExplanation,
  };

  if (replyToMessageId) {
    payload.reply_to_message_id = replyToMessageId;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!data.ok) {
    console.error("Telegram API Error:", data);
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
