/* src/features/exam-paper/services/examPaperService.ts */
import { ExamPaper, ExamPaperSettings } from "../types";

export async function generateExamPaper(
  content: string, 
  settings: ExamPaperSettings, 
  retries: number = 2
): Promise<ExamPaper> {
  try {
    const response = await fetch("/api/exam-paper/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content, settings }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }

    return await response.json() as ExamPaper;
  } catch (error: any) {
    console.error("Error generating exam paper via API:", error);
    throw error;
  }
}
