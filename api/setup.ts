import TelegramBot from 'node-telegram-bot-api';

const BOT_TOKEN = "8783681142:AAGcPnAIVZ6L4ivQQFqNC2hFIq0uZmtC51U";
const bot = new TelegramBot(BOT_TOKEN);

export default async function handler(req: any, res: any) {
  const host = req.headers.host;
  // Telegram webhooks REQUIRE https
  const url = `https://${host}/api/webhook`;
  
  try {
    await bot.setWebHook(url);
    res.status(200).send(`✅ Webhook successfully set to: ${url}\n\nএখন আপনার বট Vercel থেকে 24/7 চলবে!`);
  } catch (error: any) {
    res.status(500).send(`❌ Error setting webhook: ${error.message}`);
  }
}
