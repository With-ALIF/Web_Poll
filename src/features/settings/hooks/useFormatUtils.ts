import { TelegramSettings } from '../../../types';

export function useFormatUtils(settings: TelegramSettings) {
  const usedPrefixIds = new Set(settings.channels?.map(c => c.activePrefixId).filter(Boolean));
  const usedSuffixIds = new Set(settings.channels?.map(c => c.activeSuffixId).filter(Boolean));

  const unusedPrefixes = settings.prefixes?.filter(p => !usedPrefixIds.has(p.id)) || [];
  const unusedSuffixes = settings.suffixes?.filter(s => !usedSuffixIds.has(s.id)) || [];

  return {
    unusedPrefixes,
    unusedSuffixes
  };
}
