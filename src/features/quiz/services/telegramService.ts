import { QuizQuestion, TelegramSettings } from "../../../types";
import { FIXED_BOT_TOKEN } from "../constants";

export async function getChatDetails(chatId: string, botToken: string) {
  const cleanToken = (botToken || FIXED_BOT_TOKEN).trim().replace(/^bot/i, '');
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
  const cleanToken = FIXED_BOT_TOKEN.trim().replace(/^bot/i, '');
  const cleanChatId = (targetChatId || settings.activeChannelId || '').trim();

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

function splitMessage(text: string, maxLength: number = 3900): string[] {
  const parts: string[] = [];
  if (text.length <= maxLength) {
    return [text];
  }
  
  // Split by line to avoid cutting in the middle of a line
  const lines = text.split('\n');
  let currentChunk = '';
  
  for (const line of lines) {
    if (line.length > maxLength) {
      // If a single line is longer thanmaxLength, split it aggressively
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
  const cleanToken = FIXED_BOT_TOKEN.trim().replace(/^bot/i, '');
  const cleanChatId = (targetChatId || settings.activeChannelId || '').trim();

  if (!cleanToken) {
    throw new Error("Bot Token is missing in settings!");
  }
  if (!cleanChatId) {
    throw new Error("Target Channel is not selected!");
  }

  // Split input content into chunks of safe size to prevent "message is too long" Telegram error (4096 limit)
  const chunks = splitMessage(noteContent, 3900);
  const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
  
  for (let i = 0; i < chunks.length; i++) {
    let chunkText = chunks[i];
    let plainChunkText = chunks[i];

    // Decorate chunks with indices if multiple parts exist
    if (chunks.length > 1) {
      chunkText = `*Part ${i + 1}/${chunks.length}*\n\n` + chunkText;
      plainChunkText = `Part ${i + 1}/${chunks.length}\n\n` + plainChunkText;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      
      // Fallback if Markdown parsing error happens
      console.warn(`Markdown message delivery failed for Part ${i + 1}, retrying as raw text:`, data);
      
      const retryRes = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: cleanChatId,
          text: plainChunkText,
        }),
      });
      
      const retryData = await retryRes.json();
      if (!retryData.ok) {
        throw new Error(retryData.description || `Failed to send note part ${i + 1} to Telegram`);
      }
    } catch (error: any) {
      console.error(`Error in sendNoteToTelegram sending part ${i + 1}:`, error);
      throw error;
    }
  }

  return true;
}
