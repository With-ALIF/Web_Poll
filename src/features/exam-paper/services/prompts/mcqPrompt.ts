/* src/features/exam-paper/services/prompts/mcqPrompt.ts */
import { ExamPaperSettings } from "../../types";

export function getMCQPrompt(content: string, settings: ExamPaperSettings): string {
  const half = Math.ceil(settings.totalQuestions / 2);
  return `
Generate professional MCQ exam paper content based on:
${content}

CONFIG:
- Title: ${settings.title}
- Subtitle: ${settings.subtitle}
- Total Questions: ${settings.totalQuestions}
- Difficulty: ${settings.difficulty}
- Include Explanation: ${settings.includeExplanation ? 'YES' : 'NO'}

REQUIREMENTS:
1. Meta info: title, subtitle, marks, time, set, footerName, footerLink.
2. Questions: Exactly ${settings.totalQuestions} items.
3. Columns: Split exactly at question ${half}.

RESPONSE: Return raw JSON only.
`;
}
