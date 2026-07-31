import TelegramBot from 'node-telegram-bot-api';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const bot = BOT_TOKEN ? new TelegramBot(BOT_TOKEN) : null;

export default async function handler(req: any, res: any) {
  const host = req.headers.host;
  // Telegram webhooks REQUIRE https
  const url = `https://${host}/api/webhook`;
  
  if (!bot) {
    return res.status(500).send("❌ Error: TELEGRAM_BOT_TOKEN environment variable is not defined.");
  }
  
  try {
    await bot.setWebHook(url);
    res.status(200).send(`✅ Webhook successfully set to: ${url}\n\nএখন আপনার বট Vercel থেকে 24/7 চলবে!`);
  } catch (error: any) {
    res.status(500).send(`❌ Error setting webhook: ${error.message}`);
  }
}
