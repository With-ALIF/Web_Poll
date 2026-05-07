export interface PhotoCardData {
  logoUrl?: string;
  headerTitle?: string;
  subject: string;
  chapter: string;
  question: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  leftLabel: string;
  leftHighlightedBox: string;
  rightHighlightedFeatures: string;
  rightPriceBox: string;
  showMarketing: boolean;
  telegramName?: string;
  facebookName?: string;
  backgroundColor?: string;
}
