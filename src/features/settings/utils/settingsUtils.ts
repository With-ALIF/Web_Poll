import { TelegramSettings } from "../../../types";

export const getEffectiveSettings = (settings: TelegramSettings, chatId: string, botToken: string, user: any, canEditSuffix: boolean = true, globalDefaultSuffix?: string) => {
  let cp = settings.questionPrefix, cs = settings.explanationSuffix;
  
  // If user cannot edit suffix, always force the global default suffix
  if (!canEditSuffix && globalDefaultSuffix !== undefined) {
    cs = globalDefaultSuffix;
  }

  const ch = settings.channels?.find(c => c.id === chatId);
  if (ch) {
    if (ch.activePrefixId === 'none') cp = '';
    else if (ch.activePrefixId) cp = settings.prefixes?.find(p => p.id === ch.activePrefixId)?.content || cp;
    
    // Only apply channel-specific suffix if the user is allowed to edit suffixes
    if (canEditSuffix) {
      if (ch.activeSuffixId === 'none') cs = '';
      else if (ch.activeSuffixId) cs = settings.suffixes?.find(s => s.id === ch.activeSuffixId)?.content || cs;
    }
  }
  
  return { ...settings, botToken, questionPrefix: user ? cp : undefined, explanationSuffix: user ? cs : undefined };
};
