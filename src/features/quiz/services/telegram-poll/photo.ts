async function sendPhotoToTelegram(
  cleanToken: string,
  cleanChatId: string,
  image: string,
  caption?: string
): Promise<number> {
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

  const response = await fetch(photoUrl, {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
  
  if (data.ok && data.result?.message_id) {
    return data.result.message_id;
  }
  throw new Error(data.description || "Failed to send image to Telegram");
}

export { sendPhotoToTelegram };
