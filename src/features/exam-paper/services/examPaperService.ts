/* src/features/exam-paper/services/examPaperService.ts */
import { ExamPaper, ExamPaperSettings } from "../types";
import { getActiveClientInfo, rotateClient } from "./ai/clientManager";
import { getMCQPrompt } from "./prompts/mcqPrompt";
import { getResponseSchema } from "./schemas";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function generateExamPaper(
  content: string, 
  settings: ExamPaperSettings, 
  retries: number = 2
): Promise<ExamPaper> {
  const prompt = getMCQPrompt(content, settings);
  const schema = getResponseSchema();

  for (let attempt = 0; attempt <= retries; attempt++) {
    const { client, index } = getActiveClientInfo();
    try {
      const response = await client.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
      });

      if (!response.text) throw new Error("Empty response from AI");
      return JSON.parse(response.text.trim());
    } catch (error: any) {
      console.error(`Attempt ${attempt + 1} (Key ${index}) failed:`, error);
      
      const msg = error?.message || '';
      if (msg.includes('API key not valid') || msg.includes('400')) {
        console.warn(`Key at index ${index} invalid. Rotating...`);
      }

      if (attempt < retries) {
        rotateClient();
        await delay(1500);
        continue;
      }
      
      const isServiceUnavailable = msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('temporary') || msg.includes('high demand') || msg.includes('Service Unavailable');
      if (isServiceUnavailable) {
        throw new Error("Gemini সার্ভারে বর্তমানে অত্যধিক চাপ রয়েছে (503 High Demand)। অনুগ্রহ করে কয়েক সেকেন্ড পর আবার চেষ্টা করুন অথবা একটি নতুন API Key যুক্ত করুন।");
      }
      throw error;
    }
  }
  throw new Error("Failed to generate exam paper.");
}
