import { IncomingMessage, ServerResponse } from "http";

function getTelegramBotToken(req: any): string | null {
  const candidates = [
    req.headers?.['x-telegram-bot-token'] as string,
    req.body?.bot_token,
    req.query?.bot_token as string,
    process.env.TELEGRAM_BOT_TOKEN,
    process.env.BOT_TOKEN,
    process.env.TELEGRAM_TOKEN,
    process.env.VITE_TELEGRAM_BOT_TOKEN
  ];

  for (const raw of candidates) {
    if (raw && typeof raw === 'string') {
      const trimmed = raw.trim().replace(/^['"]|['"]$/g, '').trim();
      const cleaned = trimmed.replace(/^bot/i, '').trim();
      if (cleaned.length > 5) {
        return cleaned;
      }
    }
  }
  return null;
}

function formatTelegramApiError(data: any, cleanChatId?: string): string {
  const desc = (data?.description || data?.error || "").toLowerCase();
  if (desc === "not found" || (desc.includes("not found") && !desc.includes("chat"))) {
    return "Telegram Bot Token টি সঠিক নয় বা পাওয়া যায়নি (Telegram API: 'Not Found')। নিশ্চিত করুন Settings > Secrets এ সঠিক TELEGRAM_BOT_TOKEN যুক্ত করেছেন।";
  }
  if (desc.includes("chat not found")) {
    return `Chat ID পাওয়া যায়নি! (ID: ${cleanChatId || "unknown"})। নিশ্চিত করুন বটটি আপনার চ্যানেল বা গ্রুপে Admin হিসেবে যুক্ত আছে এবং Chat ID টি সঠিক।`;
  }
  if (desc.includes("unauthorized")) {
    return "টেলিগ্রাম বট টোকেনটি সঠিক নয় (Unauthorized)। দয়া করে Bot Token টি যাচাই করুন।";
  }
  if (desc.includes("user_bot_to_bot_disabled")) {
    return "বট অন্য বটকে মেসেজ পাঠাতে পারে না। অনুগ্রহ করে চ্যানেলের ইউজারনেম বা আইডি (@channel_name বা -100...) দিন।";
  }
  if (desc.includes("not enough rights") || desc.includes("restricted") || desc.includes("admin") || desc.includes("have no rights") || desc.includes("not a member") || desc.includes("kicked")) {
    return "বটটির চ্যানেলে মেসেজ/পোল পাঠানোর অনুমতি নেই। অনুগ্রহ করে বটকে চ্যানেলে যোগ করে Administrator বানান এবং 'Post Messages' পারমিশন দিন।";
  }
  if (desc.includes("blocked by the user")) {
    return "বটটি ব্লক করা হয়েছে। টেলিগ্রামে গিয়ে বটটি আনব্লক করুন।";
  }
  if (desc.includes("poll explanation must not be empty")) {
    return "Explanation ফিল্ড খালি রাখা যাবে না।";
  }
  if (desc.includes("poll options must have at least 2")) {
    return "কুইজে কমপক্ষে ২টি অপশন থাকতে হবে।";
  }
  if (desc.includes("poll option text is too long")) {
    return "কুইজের কোনো অপশন ১০০ অক্ষরের বেশি হতে পারবে না।";
  }
  return data?.description || data?.error || "Failed to communicate with Telegram";
}

async function fetchWithTimeout(url: string, options: any = {}, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-telegram-bot-token'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = req.query.action;

  if (!action) {
    return res.status(400).json({ ok: false, error: "Action is required." });
  }

  const cleanToken = getTelegramBotToken(req);
  if (!cleanToken) {
    return res.status(400).json({
      ok: false,
      error: "টেলিগ্রাম বট টোকেন পাওয়া যায়নি। দয়া করে Settings > Secrets-এ TELEGRAM_BOT_TOKEN যুক্ত করুন।"
    });
  }

  const timeoutMsg = "টেলিগ্রাম সার্ভারের সাথে সংযোগের সময় শেষ হয়েছে (Timeout)। অনুগ্রহ করে আপনার নেটওয়ার্ক এবং বট টোকেনটি চেক করুন।";

  try {
    if (action === "sendPoll") {
      if (req.method !== "POST") {
        return res.status(405).json({ ok: false, error: "Method not allowed. Use POST." });
      }

      const { chat_id } = req.body;
      if (!chat_id) {
        return res.status(400).json({ ok: false, error: "chat_id is required." });
      }

      const cleanChatId = String(chat_id).trim();

      let rawOptions = req.body.options;
      if (typeof rawOptions === 'string') {
        try {
          rawOptions = JSON.parse(rawOptions);
        } catch (e) {}
      }
      let formattedOptions: string[] = [];
      if (Array.isArray(rawOptions)) {
        formattedOptions = rawOptions.map((opt: any) => {
          if (typeof opt === 'string') return opt.trim().substring(0, 100);
          if (opt && typeof opt === 'object' && opt.text) return String(opt.text).trim().substring(0, 100);
          return String(opt || '').trim().substring(0, 100);
        }).filter(Boolean);
      }

      if (formattedOptions.length < 2 || formattedOptions.length > 10) {
        return res.status(400).json({
          ok: false,
          error: "Telegram polls must contain between 2 and 10 options."
        });
      }

      const correctIndex = Math.max(0, Math.min(formattedOptions.length - 1, Number(req.body.correct_option_id ?? 0)));

      const payload: Record<string, any> = {
        chat_id: cleanChatId,
        question: (String(req.body.question || '').trim() || 'Quiz Question').substring(0, 300),
        options: formattedOptions,
        is_anonymous: req.body.is_anonymous !== false,
        type: req.body.type || "quiz",
        correct_option_id: correctIndex
      };

      const explanation = typeof req.body.explanation === 'string' ? req.body.explanation.trim() : '';
      if (explanation.length > 0) {
        payload.explanation = explanation.substring(0, 200);
        payload.explanation_parse_mode = req.body.explanation_parse_mode || "HTML";
      }

      if (req.body.reply_to_message_id) {
        payload.reply_to_message_id = Number(req.body.reply_to_message_id);
      }

      let response = await fetchWithTimeout(`https://api.telegram.org/bot${cleanToken}/sendPoll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      let resText = await response.text();
      let data: any = {};
      try {
        data = resText ? JSON.parse(resText) : {};
      } catch {
        data = { ok: false, description: resText || `Telegram HTTP ${response.status}` };
      }

      if ((!response.ok || !data.ok) && payload.explanation_parse_mode && (data.description || '').toLowerCase().includes('parse')) {
        delete payload.explanation_parse_mode;
        if (payload.explanation) {
          payload.explanation = payload.explanation.replace(/<[^>]*>/g, '').substring(0, 200);
        }
        response = await fetchWithTimeout(`https://api.telegram.org/bot${cleanToken}/sendPoll`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        resText = await response.text();
        try {
          data = resText ? JSON.parse(resText) : {};
        } catch {
          data = { ok: false, description: resText || `Telegram HTTP ${response.status}` };
        }
      }

      if (!response.ok || !data.ok) {
        const errorMsg = formatTelegramApiError(data, cleanChatId);
        return res.status(response.status || 400).json({
          ...data,
          ok: false,
          error: errorMsg
        });
      }

      return res.status(200).json(data);
    } 
    
    else if (action === "sendMessage") {
      if (req.method !== "POST") {
        return res.status(405).json({ ok: false, error: "Method not allowed. Use POST." });
      }

      const { chat_id, text } = req.body;
      if (!chat_id) {
        return res.status(400).json({ ok: false, error: "chat_id is required." });
      }
      if (!text) {
        return res.status(400).json({ ok: false, error: "text is required." });
      }

      const cleanChatId = String(chat_id).trim();
      const payload: Record<string, any> = {
        chat_id: cleanChatId,
        text: String(text)
      };

      if (req.body.parse_mode) payload.parse_mode = req.body.parse_mode;
      if (req.body.reply_to_message_id) payload.reply_to_message_id = Number(req.body.reply_to_message_id);

      let response = await fetchWithTimeout(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      let resText = await response.text();
      let data: any = {};
      try {
        data = resText ? JSON.parse(resText) : {};
      } catch {
        data = { ok: false, description: resText || `Telegram HTTP ${response.status}` };
      }

      if ((!response.ok || !data.ok) && payload.parse_mode) {
        delete payload.parse_mode;
        response = await fetchWithTimeout(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        resText = await response.text();
        try {
          data = resText ? JSON.parse(resText) : {};
        } catch {
          data = { ok: false, description: resText || `Telegram HTTP ${response.status}` };
        }
      }

      if (!response.ok || !data.ok) {
        const errorMsg = formatTelegramApiError(data, cleanChatId);
        return res.status(response.status || 400).json({
          ...data,
          ok: false,
          error: errorMsg
        });
      }

      return res.status(200).json(data);
    } 
    
    else if (action === "sendPhoto") {
      if (req.method !== "POST") {
        return res.status(405).json({ ok: false, error: "Method not allowed. Use POST." });
      }

      const { chat_id, image, photo, caption, parse_mode, reply_to_message_id } = req.body;
      if (!chat_id) {
        return res.status(400).json({ ok: false, error: "chat_id is required." });
      }

      const rawPhoto = image || photo;
      if (!rawPhoto) {
        return res.status(400).json({ ok: false, error: "image or photo data is required." });
      }

      const cleanChatId = String(chat_id).trim();
      const formData = new FormData();
      formData.append('chat_id', cleanChatId);

      if (rawPhoto.startsWith('http://') || rawPhoto.startsWith('https://')) {
        formData.append('photo', rawPhoto);
      } else {
        const base64Data = rawPhoto.includes(',') ? rawPhoto.split(',')[1] : rawPhoto;
        const buffer = Buffer.from(base64Data, 'base64');
        const blob = new Blob([buffer], { type: 'image/jpeg' });
        formData.append('photo', blob, 'image.jpg');
      }

      if (caption && String(caption).trim()) {
        formData.append('caption', String(caption).trim());
      }
      if (parse_mode) {
        formData.append('parse_mode', parse_mode);
      }
      if (reply_to_message_id) {
        formData.append('reply_to_message_id', String(reply_to_message_id));
      }

      const response = await fetchWithTimeout(`https://api.telegram.org/bot${cleanToken}/sendPhoto`, {
        method: 'POST',
        body: formData
      });

      const resText = await response.text();
      let data: any = {};
      try {
        data = resText ? JSON.parse(resText) : {};
      } catch {
        data = { ok: false, description: resText || `Telegram HTTP ${response.status}` };
      }

      if (!response.ok || !data.ok) {
        const errorMsg = formatTelegramApiError(data, cleanChatId);
        return res.status(response.status || 400).json({
          ...data,
          ok: false,
          error: errorMsg
        });
      }

      return res.status(200).json(data);
    } 
    
    else if (action === "getChat") {
      if (req.method !== "GET") {
        return res.status(405).json({ ok: false, error: "Method not allowed. Use GET." });
      }

      const chatId = req.query.chat_id;
      if (!chatId) {
        return res.status(400).json({ ok: false, error: "chat_id parameter is required." });
      }

      const cleanChatId = String(chatId).trim();
      const response = await fetchWithTimeout(`https://api.telegram.org/bot${cleanToken}/getChat?chat_id=${encodeURIComponent(cleanChatId)}`);

      const resText = await response.text();
      let data: any = {};
      try {
        data = resText ? JSON.parse(resText) : {};
      } catch {
        data = { ok: false, description: resText || `Telegram HTTP ${response.status}` };
      }

      if (!response.ok || !data.ok) {
        const errorMsg = formatTelegramApiError(data, cleanChatId);
        return res.status(response.status || 400).json({
          ...data,
          ok: false,
          error: errorMsg
        });
      }

      return res.status(200).json(data);
    } 
    
    else {
      return res.status(404).json({ ok: false, error: `Action '${action}' not found.` });
    }
  } catch (err: any) {
    console.error(`Error in Telegram serverless proxy action '${action}':`, err);
    let errorMsg = err.message || `Internal server error during Telegram ${action} request`;
    if (err.name === 'AbortError' || err.message?.toLowerCase().includes('abort') || err.message?.toLowerCase().includes('timeout')) {
      errorMsg = timeoutMsg;
    }
    return res.status(504).json({ ok: false, error: errorMsg });
  }
}
