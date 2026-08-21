async function sendPhotoToTelegram(
  _cleanToken: string,
  cleanChatId: string,
  image: string,
  caption?: string
): Promise<number> {
  const photoUrl = `/api/telegram/sendPhoto`;
  
  const response = await fetch(photoUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: cleanChatId,
      image: image,
      caption: caption,
      parse_mode: 'HTML'
    })
  });
  const data = await response.json();
  
  if (data.ok && data.result?.message_id) {
    return data.result.message_id;
  }
  throw new Error(data.description || data.error || "Failed to send image to Telegram");
}

export { sendPhotoToTelegram };
