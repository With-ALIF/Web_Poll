async function sendPhotoToTelegram(
  cleanToken: string,
  cleanChatId: string,
  image: string,
  caption?: string
): Promise<number> {
  const photoUrl = `/api/telegram/sendPhoto`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (cleanToken && cleanToken.trim()) {
    headers['x-telegram-bot-token'] = cleanToken.trim();
  }

  const response = await fetch(photoUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      chat_id: cleanChatId,
      image: image,
      caption: caption,
      parse_mode: 'HTML'
    })
  });

  const resText = await response.text();
  let data: any = {};
  try {
    data = resText ? JSON.parse(resText) : {};
  } catch {
    data = { ok: false, error: resText || `Server returned HTTP ${response.status}` };
  }
  
  if (response.ok && data.ok && data.result?.message_id) {
    return data.result.message_id;
  }
  throw new Error(data.error || data.description || "Failed to send image to Telegram");
}

export { sendPhotoToTelegram };
