export async function getChatDetails(chatId: string, botToken?: string) {
  const cleanChatId = chatId.trim();

  if (!cleanChatId) return null;

  const url = `/api/telegram/getChat?chat_id=${encodeURIComponent(cleanChatId)}`;
  const headers: Record<string, string> = {};
  if (botToken && botToken.trim()) {
    headers['x-telegram-bot-token'] = botToken.trim();
  }

  try {
    const response = await fetch(url, { headers });
    const resText = await response.text();
    let data: any = {};
    try {
      data = resText ? JSON.parse(resText) : {};
    } catch {
      data = { ok: false, error: resText || `Server returned HTTP ${response.status}` };
    }

    if (data.ok) {
      return data.result;
    }
    const err = data.error || data.description || 'Chat not found';
    throw new Error(err);
  } catch (error) {
    throw error;
  }
}
