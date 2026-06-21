import { TelegramSettings } from "../../../types";

export const getEffectiveSettings = (settings: TelegramSettings, chatId: string, botToken: string, user: any, canEditSuffix: boolean = true, globalDefaultSuffix?: string) => {
  let cp = settings.questionPrefix, cs = settings.explanationSuffix;
  
  // If user cannot edit suffix, always force the global default suffix (or empty string if not set)
  if (!canEditSuffix) {
    // যাদের পারমিশন নেই তাদের জন্য গ্লোবাল ডিফল্ট সাফিক্স বাধ্যতামূলক
    cs = globalDefaultSuffix || '';
  } else {
    // যাদের পারমিশন আছে তাদের জন্য গ্লোবাল ডিফল্ট সাফিক্স একদম ব্যবহার হবে না (User Request)
    // আমরা কেবল তাদের নিজস্ব সাফিক্স নিব। যদি তারা কিছু সেট না করে (Empty), তবে সাফিক্স খালি থাকবে।
    const rawSuffix = settings.explanationSuffix || '';
    const unwantedLink = 'join: https://t.me/SOT_Academy';
    
    // Check if it matches the unwanted link or the global default
    // We use a more aggressive approach to detect "default" content and strip it
    const trimmedSuffix = rawSuffix.trim();
    const trimmedDefault = (globalDefaultSuffix || '').trim();
    const trimmedUnwanted = unwantedLink.trim();
    
    const matchesDefault = (trimmedDefault && trimmedSuffix === trimmedDefault) || 
                          (trimmedSuffix === trimmedUnwanted) ||
                          (trimmedSuffix.toLowerCase().includes('join alif')); // Hardcoded fallback for the screenshot issue
    
    if (matchesDefault) {
      cs = '';
    } else {
      cs = rawSuffix;
    }
  }

  const ch = settings.channels?.find(c => c.id === chatId);
  if (ch) {
    if (ch.activePrefixId === 'none') cp = '';
    else if (ch.activePrefixId) cp = settings.prefixes?.find(p => p.id === ch.activePrefixId)?.content || cp;
    
    // চ্যানেল লেভেলেও একই চেক: পারমিশন থাকলে ডিফল্ট সাফিক্স ব্লক হবে
    if (canEditSuffix) {
      if (ch.activeSuffixId === 'none') {
        cs = '';
      } else if (ch.activeSuffixId) {
        const foundSuffix = settings.suffixes?.find(s => s.id === ch.activeSuffixId)?.content || cs;
        const trimmedFound = foundSuffix.trim();
        const trimmedDefault = (globalDefaultSuffix || '').trim();
        const trimmedUnwanted = 'join: https://t.me/SOT_Academy'.trim();
        
        const matchesDefault = (trimmedDefault && trimmedFound === trimmedDefault) || 
                              (trimmedFound === trimmedUnwanted) ||
                              (trimmedFound.toLowerCase().includes('join alif'));
        
        if (matchesDefault) {
          cs = '';
        } else {
          cs = foundSuffix;
        }
      }
    }
  }
  
  return { ...settings, botToken, questionPrefix: cp, explanationSuffix: cs };
};
