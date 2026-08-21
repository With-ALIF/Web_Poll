import { QuizQuestion, TelegramSettings } from "../../../types";

export async function getChatDetails(chatId: string, _botToken?: string) {
  const cleanChatId = chatId.trim();

  if (!cleanChatId) return null;

  const url = `/api/telegram/getChat?chat_id=${encodeURIComponent(cleanChatId)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.ok) {
      return data.result;
    }
    throw new Error(data.description || data.error || 'Chat not found');
  } catch (error) {
    throw error;
  }
}

export async function sendQuizToTelegram(
  question: QuizQuestion,
  settings: TelegramSettings,
  targetChatId?: string
): Promise<boolean> {
  const cleanChatId = (targetChatId || settings.activeChannelId || '').trim();
  const cleanToken = ((settings as any)?.botToken || '').trim();

  let replyToMessageId: number | undefined;

  // If there's an image, send it first
  if (question.image) {
    const photoUrl = `/api/telegram/sendPhoto`;
    
    try {
      const photoHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (cleanToken) {
        photoHeaders['x-telegram-bot-token'] = cleanToken;
      }

      const photoResponse = await fetch(photoUrl, {
        method: 'POST',
        headers: photoHeaders,
        body: JSON.stringify({
          chat_id: cleanChatId,
          image: question.image,
        }),
      });
      const photoResText = await photoResponse.text();
      let photoData: any = {};
      try { photoData = photoResText ? JSON.parse(photoResText) : {}; } catch { photoData = { ok: false }; }
      
      if (photoData.ok && photoData.result && photoData.result.message_id) {
        replyToMessageId = photoData.result.message_id;
      } else {
        console.error("Failed to send photo:", photoData);
        throw new Error(photoData.error || photoData.description || "Failed to send image to Telegram");
      }
    } catch (error: any) {
      console.error("Error sending photo:", error);
      throw new Error(error.message || "Failed to send image to Telegram");
    }
  }

  const url = `/api/telegram/sendPoll`;

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
    options: question.options,
    is_anonymous: true,
    type: "quiz",
    correct_option_id: question.correctOptionIndex,
  };

  if (finalExplanation && finalExplanation.trim().length > 0) {
    payload.explanation = finalExplanation.trim();
    payload.explanation_parse_mode = "HTML";
  }

  if (replyToMessageId) {
    payload.reply_to_message_id = replyToMessageId;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (cleanToken && cleanToken.trim()) {
    headers["x-telegram-bot-token"] = cleanToken.trim();
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
    console.error("Telegram API Error:", data);
    let errorMessage = data.error || data.description || "Failed to send quiz to Telegram";
    const lower = errorMessage.toLowerCase();
    
    if (lower.includes("chat not found")) {
      errorMessage = `Chat not found! ID used: "${cleanChatId}". Please ensure the bot is added as an Admin, and the Chat ID is exactly correct.`;
    } else if (lower.includes("unauthorized")) {
      errorMessage = "Unauthorized! Your Bot Token might be incorrect in settings.";
    } else if (lower === "not found" || (lower.includes("not found") && !lower.includes("chat"))) {
      errorMessage = "Telegram Bot Token টি ভুল বা খুঁজে পাওয়া যায়নি (Telegram API: 'Not Found')। নিশ্চিত করুন BotFather থেকে পাওয়া সম্পূর্ণ টোকেনটি সিক্রেট এ যুক্ত করেছেন।";
    }
    
    throw new Error(errorMessage);
  }

  return true;
}

function splitMessage(text: string, maxLength: number = 3900): string[] {
  const parts: string[] = [];
  if (text.length <= maxLength) {
    return [text];
  }
  
  const lines = text.split('\n');
  let currentChunk = '';
  
  for (const line of lines) {
    if (line.length > maxLength) {
      if (currentChunk) {
        parts.push(currentChunk.trimEnd());
        currentChunk = '';
      }
      
      let remaining = line;
      while (remaining.length > maxLength) {
        parts.push(remaining.substring(0, maxLength));
        remaining = remaining.substring(maxLength);
      }
      currentChunk = remaining + '\n';
    } else if (currentChunk.length + line.length + 1 > maxLength) {
      parts.push(currentChunk.trimEnd());
      currentChunk = line + '\n';
    } else {
      currentChunk += line + '\n';
    }
  }
  
  if (currentChunk.trimEnd()) {
    parts.push(currentChunk.trimEnd());
  }
  
  return parts;
}

export async function sendNoteToTelegram(
  noteContent: string,
  settings: TelegramSettings,
  targetChatId?: string
): Promise<boolean> {
  const cleanChatId = (targetChatId || settings.activeChannelId || '').trim();

  if (!cleanChatId) {
    throw new Error("Target Channel is not selected!");
  }

  const chunks = splitMessage(noteContent, 3900);
  const url = `/api/telegram/sendMessage`;
  const token = (settings?.botToken || '').trim();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['x-telegram-bot-token'] = token;
  }
  
  for (let i = 0; i < chunks.length; i++) {
    let chunkText = chunks[i];
    let plainChunkText = chunks[i];

    if (chunks.length > 1) {
      chunkText = `*Part ${i + 1}/${chunks.length}*\n\n` + chunkText;
      plainChunkText = `Part ${i + 1}/${chunks.length}\n\n` + plainChunkText;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          chat_id: cleanChatId,
          text: chunkText,
          parse_mode: 'Markdown',
        }),
      });
      
      const data = await response.json();
      if (data.ok) {
        continue;
      }
      
      console.warn(`Markdown message delivery failed for Part ${i + 1}, retrying as raw text:`, data);
      
      const retryRes = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          chat_id: cleanChatId,
          text: plainChunkText,
        }),
      });
      
      const retryData = await retryRes.json();
      if (!retryData.ok) {
        throw new Error(retryData.description || retryData.error || `Failed to send note part ${i + 1} to Telegram`);
      }
    } catch (error: any) {
      console.error(`Error in sendNoteToTelegram sending part ${i + 1}:`, error);
      throw error;
    }
  }

  return true;
}

export async function sendQuestionTextToTelegram(
  question: QuizQuestion,
  settings: TelegramSettings,
  targetChatId?: string
): Promise<boolean> {
  const cleanChatId = (targetChatId || settings.activeChannelId || '').trim();
  const cleanToken = ((settings as any)?.botToken || '').trim();

  if (!cleanChatId) {
    throw new Error("Target Channel is not selected!");
  }

  const finalQuestion = question.question;

  const url = `/api/telegram/sendMessage`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (cleanToken) {
    headers['x-telegram-bot-token'] = cleanToken;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: finalQuestion,
      }),
    });
    
    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.description || data.error || 'Failed to send message to Telegram');
    }
    return true;
  } catch (error: any) {
    console.error("Error sending question text to Telegram:", error);
    throw error;
  }
}
