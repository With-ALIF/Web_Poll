export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  status: 'pending' | 'sending' | 'sent' | 'error';
  image?: string;
  topic?: string;
};

export type TelegramChannel = {
  id: string;
  name: string;
  type: string;
  activePrefixId?: string;
  activeSuffixId?: string;
};

export type SavedText = {
  id: string;
  content: string;
};

export type TelegramSettings = {
  channels?: TelegramChannel[];
  activeChannelId?: string;
  selectedChannelIds?: string[];
  questionPrefix?: string;
  explanationSuffix?: string;
  prefixes?: SavedText[];
  suffixes?: SavedText[];
  activePrefixId?: string;
  activeSuffixId?: string;
};

export type Note = {
  id: string;
  userId: string;
  title: string;
  rawInput: string;
  formattedContent: string;
  status: 'draft' | 'sending' | 'sent' | 'error';
  createdAt?: any;
  updatedAt?: any;
};
