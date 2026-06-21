import { QuizQuestion, TelegramSettings } from "../../../../types";

export function formatQuestionText(question: QuizQuestion, settings: TelegramSettings): string {
  let finalQuestion = question.question;
  if (settings.questionPrefix?.trim()) {
    finalQuestion = `${settings.questionPrefix.trim()}\n${finalQuestion}`;
  }
  if (finalQuestion.length > 300) return finalQuestion.substring(0, 297) + '...';
  return finalQuestion;
}

export function formatExplanationText(question: QuizQuestion, settings: TelegramSettings): string {
  let finalExplanation = question.explanation || '';
  const suffix = settings.explanationSuffix?.trim();
  
  if (suffix && !finalExplanation.includes(suffix)) {
    finalExplanation = `${finalExplanation}\n\n${suffix}`;
  }
  
  if (finalExplanation.length > 200) return finalExplanation.substring(0, 197) + '...';
  return finalExplanation;
}
