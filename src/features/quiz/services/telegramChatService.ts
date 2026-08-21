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
