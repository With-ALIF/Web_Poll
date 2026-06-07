export type PaperType = 'MCQ';

export interface ExamOption {
  label: string;
  text: string;
}

export interface ExamQuestion {
  number: number;
  column: "left" | "right";
  question: string;
  options: ExamOption[];
  correct_answer: string;
  explanation?: string;
}

export interface ExamPaperMeta {
  title: string;
  subtitle: string;
  full_marks: string;
  time: string;
  set: string;
  footerName?: string;
  footerLink?: string;
  type: PaperType;
}

export interface ExamPaper {
  meta: ExamPaperMeta;
  questions?: ExamQuestion[];
}

export interface ExamPaperSettings {
  type: PaperType;
  title: string;
  totalQuestions: number;
  difficulty: string;
  includeExplanation: boolean;
  questionsPerPage: number;
  showTime: boolean;
  showMarks: boolean;
  subtitle: string;
  marks: string;
  time: string;
  set: string;
  footerName: string;
  footerLink: string;
  watermark: {
    enabled: boolean;
    type: 'text' | 'image';
    text: string;
    imageUrl: string;
    opacity: number;
  };
}
