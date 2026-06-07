export function handleTelegramError(errorMessage: string, cleanChatId: string): never {
  const desc = errorMessage.toLowerCase();
  let msg = errorMessage;
  if (desc.includes("chat not found")) {
    msg = `Chat not found! (ID: ${cleanChatId}). Ensure the bot is an Admin there.`;
  } else if (desc.includes("user_bot_to_bot_disabled")) {
    msg = "Bots cannot message other bots. Please use a Channel or Group ID instead.";
  } else if (desc.includes("unauthorized")) {
    msg = "Invalid Bot Token. Check settings.";
  } else if (desc.includes("message is too long")) {
    msg = "Quiz text exceeds Telegram's limit. Try shortening it.";
  }
  throw new Error(msg);
}
