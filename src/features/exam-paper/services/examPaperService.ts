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
      let errorMessage = `HTTP error ${response.status}`;
      let errorText = "";
      try {
        errorText = await response.text();
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // Fallback if the server returns HTML instead of JSON
        console.error("Non-JSON error response from server. Body preview:", errorText.substring(0, 200));
        errorMessage = `Server Error (${response.status}): ${errorText.substring(0, 100) || "The server failed to process the request. This often happens if the API key is invalid or a model is unavailable."}`;
      }
      throw new Error(errorMessage);
    }

    return await response.json() as ExamPaper;
  } catch (error: any) {
    console.error("Error generating exam paper via API:", error);
    throw error;
  }
}
