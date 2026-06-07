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
    throw error;
  }
}
