/* src/features/exam-paper/services/prompts/mcqPrompt.ts */
import { ExamPaperSettings } from "../../types";

export function getMCQPrompt(content: string, settings: ExamPaperSettings): string {
  const half = Math.ceil(settings.totalQuestions / 2);
  return `
Generate high-quality Multiple Choice Questions (MCQs) based on the input content.

INPUT CONTENT:
${content}

SETTINGS:
* Title: ${settings.title}
* Total Questions: ${settings.totalQuestions}
* Difficulty: ${settings.difficulty}
* Include Explanation: ${settings.includeExplanation ? 'YES' : 'NO'}

REQUIREMENTS:
1. Generate MCQs in the SAME LANGUAGE as the input content.
2. 4 options per question, ONE correct answer.
3. If "Include Explanation" is YES, provide 3-4 lines of explanation.

FORMAT:
* Left column: Q1–Q${half}
* Right column: Q${half + 1}–Q${settings.totalQuestions}

OUTPUT JSON MUST MATCH THE SCHEMA.
`;
}
