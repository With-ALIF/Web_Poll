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
  if (settings.explanationSuffix?.trim()) {
    finalExplanation = `${finalExplanation}\n\n${settings.explanationSuffix.trim()}`;
  }
  if (finalExplanation.length > 200) return finalExplanation.substring(0, 197) + '...';
  return finalExplanation;
}
