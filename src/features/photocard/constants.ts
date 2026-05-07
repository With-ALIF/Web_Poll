import { 
  Atom, 
  Beaker, 
  Dna, 
  Pi, 
  BookText, 
  Languages, 
  Sparkles,
  LucideIcon
} from 'lucide-react';

export const SUBJECT_OPTIONS = [
  "রসায়ন প্রথম পত্র",
  "রসায়ন দ্বিতীয় পত্র",
  "পদার্থ বিজ্ঞান প্রথম পত্র",
  "পদার্থ বিজ্ঞান দ্বিতীয় পত্র",
  "জীববিজ্ঞান প্রথম পত্র",
  "জীববিজ্ঞান দ্বিতীয় পত্র",
  "উচ্চতর গণিত প্রথম পত্র",
  "উচ্চতর গণিত দ্বিতীয় পত্র",
  "বাংলা প্রথম পত্র",
  "বাংলা দ্বিতীয় পত্র",
  "ইংরেজি"
];

export const SUBJECT_ICON_MAP: Record<string, LucideIcon> = {
  "রসায়ন প্রথম পত্র": Beaker,
  "রসায়ন দ্বিতীয় পত্র": Beaker,
  "পদার্থ বিজ্ঞান প্রথম পত্র": Atom,
  "পদার্থ বিজ্ঞান দ্বিতীয় পত্র": Atom,
  "জীববিজ্ঞান প্রথম পত্র": Dna,
  "জীববিজ্ঞান দ্বিতীয় পত্র": Dna,
  "উচ্চতর গণিত প্রথম পত্র": Pi,
  "উচ্চতর গণিত দ্বিতীয় পত্র": Pi,
  "বাংলা প্রথম পত্র": BookText,
  "বাংলা দ্বিতীয় পত্র": BookText,
  "ইংরেজি": Languages,
};

export const SUBJECT_COLOR_MAP: Record<string, string> = {
  "রসায়ন প্রথম পত্র": "#1e40af", // deep blue
  "রসায়ন দ্বিতীয় পত্র": "#1e3a8a", 
  "পদার্থ বিজ্ঞান প্রথম পত্র": "#be123c", // deep rose/pink
  "পদার্থ বিজ্ঞান দ্বিতীয় পত্র": "#9f1239",
  "জীববিজ্ঞান প্রথম পত্র": "#047857", // deep emerald
  "জীববিজ্ঞান দ্বিতীয় পত্র": "#065f46",
  "উচ্চতর গণিত প্রথম পত্র": "#b45309", // deep amber/orange
  "উচ্চতর গণিত দ্বিতীয় পত্র": "#92400e",
  "বাংলা প্রথম পত্র": "#6d28d9", // deep violet
  "বাংলা দ্বিতীয় পত্র": "#5b21b6",
  "ইংরেজি": "#b91c1c", // deep red
};

export const SUBJECT_BG_COLOR_MAP: Record<string, string> = {
  "রসায়ন প্রথম পত্র": "#bbf7d0", // Green 200
  "রসায়ন দ্বিতীয় পত্র": "#a7f3d0", // Emerald 200
  "পদার্থ বিজ্ঞান প্রথম পত্র": "#bae6fd", // Sky 200
  "পদার্থ বিজ্ঞান দ্বিতীয় পত্র": "#7dd3fc", // Sky 300
  "জীববিজ্ঞান প্রথম পত্র": "#fecdd3", // Rose 200
  "জীববিজ্ঞান দ্বিতীয় পত্র": "#fecaca", // Red 200
  "উচ্চতর গণিত প্রথম পত্র": "#f5d0fe", // Fuchsia 200
  "উচ্চতর গণিত দ্বিতীয় পত্র": "#e9d5ff", // Purple 200
  "বাংলা প্রথম পত্র": "#ddd6fe", // Violet 200
  "বাংলা দ্বিতীয় পত্র": "#c4b5fd", // Violet 300
  "ইংরেজি": "#fecaca", // Red 200
};

export const DEFAULT_ICON = Sparkles;
export const DEFAULT_COLOR = "#6366f1"; // indigo
export const DEFAULT_BG_COLOR = "#F5F2ED"; // cream
