export function handleTelegramError(errorMessage: string, cleanChatId: string): never {
  const desc = (errorMessage || '').toLowerCase();
  let msg = errorMessage;
  if (desc.includes("environment variable is not configured") || desc.includes("not configured") || desc.includes("token is missing") || desc.includes("টোকেন পাওয়া যায়নি")) {
    msg = "টেলিগ্রাম বট টোকেন পাওয়া যায়নি। দয়া করে Settings > Secrets-এ TELEGRAM_BOT_TOKEN যুক্ত করুন।";
  } else if (desc.includes("chat not found") || desc.includes("id পাওয়া যায়নি")) {
    msg = `Chat ID পাওয়া যায়নি! (ID: ${cleanChatId})। নিশ্চিত করুন বটটি আপনার চ্যানেল বা গ্রুপে Admin হিসেবে যুক্ত আছে এবং Chat ID টি সঠিক।`;
  } else if (desc.includes("user_bot_to_bot_disabled")) {
    msg = "বট অন্য বটকে মেসেজ পাঠাতে পারে না। অনুগ্রহ করে চ্যানেলের ইউজারনেম বা আইডি (@channel_name বা -100...) দিন।";
  } else if (desc.includes("unauthorized") || desc.includes("invalid token")) {
    msg = "টেলিগ্রাম বট টোকেনটি সঠিক নয় (Unauthorized)। দয়া করে Bot Token টি যাচাই করুন।";
  } else if (desc === "not found" || (desc.includes("not found") && !desc.includes("chat"))) {
    msg = "Telegram Bot Token টি সঠিক নয় বা পাওয়া যায়নি (Telegram API: 'Not Found')। নিশ্চিত করুন Settings > Secrets এ সঠিক TELEGRAM_BOT_TOKEN যুক্ত করেছেন।";
  } else if (desc.includes("not enough rights") || desc.includes("restricted") || desc.includes("admin") || desc.includes("have no rights") || desc.includes("not a member") || desc.includes("kicked")) {
    msg = "বটটির চ্যানেলে মেসেজ/পোল পাঠানোর অনুমতি নেই। অনুগ্রহ করে বটকে চ্যানেলে যোগ করে Administrator বানান এবং 'Post Messages' পারমিশন দিন।";
  } else if (desc.includes("message is too long")) {
    msg = "কুইজের লেখা টেলিগ্রামের সীমার চেয়ে বড়। লেখাটি কিছুটা ছোট করুন।";
  } else if (desc.includes("poll explanation must not be empty")) {
    msg = "Explanation ফিল্ড খালি রাখা যাবে না।";
  }
  throw new Error(msg);
}
