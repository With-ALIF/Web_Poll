import TelegramBot from 'node-telegram-bot-api';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const bot = BOT_TOKEN ? new TelegramBot(BOT_TOKEN) : null;

const welcomeMessage = (chatId: string) => `👋 স্বাগতম!

আপনি এখন TeleQuiz AI Bot ব্যবহার করছেন 🎯
এই বটের মাধ্যমে খুব সহজেই কুইজ তৈরি করে Telegram-এ শেয়ার করতে পারবেন।

🌐 Web App ব্যবহার করুন:
👉 "TeleQuiz AI Web App খুলুন" http://poll.mnr.bd/

🔑 **আপনার Chat ID:** \`${chatId}\`
(এই ID টি কপি করে Web App এর Settings-এ বসান)

🛠️ কিভাবে ব্যবহার করবেন:
1️⃣ উপরের Web App-এ প্রবেশ করুন
2️⃣ আপনার টেক্সট / নোট পেস্ট করুন
3️⃣ Generate Quiz বাটনে ক্লিক করুন
4️⃣ Settings এ গিয়ে আপনার Chat ID বসান
5️⃣ Send to Channel চাপ দিয়ে Telegram-এ পাঠান

🚀 দ্রুত, সহজ এবং স্মার্ট কুইজ তৈরির জন্য TeleQuiz AI ব্যবহার করুন!`;

export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    if (!bot) {
      console.error("TELEGRAM_BOT_TOKEN environment variable is missing.");
      return res.status(500).send("TELEGRAM_BOT_TOKEN is missing");
    }
    try {
      const update = req.body;
      console.log("Webhook update:", JSON.stringify(update));
      const msg = update.message || update.channel_post;
      console.log("Msg:", JSON.stringify(msg));
      
      if (msg && (msg.text || msg.caption)) {
        const text = (msg.text || msg.caption)!.trim();
        const chatId = msg.chat.id.toString();
        console.log(`Received message from ${chatId}: ${text}`);

        if (text.startsWith('/start')) {
          await bot.sendMessage(chatId, welcomeMessage(chatId), { 
            parse_mode: 'Markdown',
            disable_web_page_preview: true 
          });
        } else if (text.toLowerCase().startsWith('/id') || text.toLowerCase().startsWith('/chatid')) {
          // Always reply to explicit ID commands
          await bot.sendMessage(chatId, `আপনার Chat ID হলো: \`${chatId}\`\nএটি কপি করে Web App এর Settings এ বসান।`, { parse_mode: 'Markdown' });
        }
      }
    } catch (e) {
      console.error(e);
    }
    res.status(200).send('OK');
  } else {
    res.status(200).send('Webhook is active');
  }
}
