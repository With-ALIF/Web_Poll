import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateOptions(question: string) {
  if (!question.trim()) {
    throw new Error("Please provide a question first.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: `Based on the following MCQ question, generate 4 relevant options (A, B, C, D). 
      IMPORTANT: Detect the language of the question and generate the options in that SAME LANGUAGE.
      If the question is in English, options must be in English. 
      If the question is in Bengali, options must be in Bengali.
      
      Question: ${question}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            a: { type: Type.STRING, description: "Option A" },
            b: { type: Type.STRING, description: "Option B" },
            c: { type: Type.STRING, description: "Option C" },
            d: { type: Type.STRING, description: "Option D" },
          },
          required: ["a", "b", "c", "d"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No options generated.");
    return JSON.parse(text) as { a: string, b: string, c: string, d: string };
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    const isServiceUnavailable = errorMsg.includes('503') || errorMsg.includes('UNAVAILABLE') || errorMsg.includes('temporary') || errorMsg.includes('high demand') || errorMsg.includes('Service Unavailable');
    const isRateLimit = errorMsg.includes('429') || errorMsg.includes('Quota exceeded');
    
    if (isServiceUnavailable) {
      throw new Error("Gemini সার্ভারে বর্তমানে অত্যধিক চাপ রয়েছে (503 High Demand)। অনুগ্রহ করে কয়েক সেকেন্ড পর আবার চেষ্টা করুন।");
    }
    if (isRateLimit) {
      throw new Error("API ব্যবহার মাত্রা অতিক্রম করেছে (429 Rate Limit)। অনুগ্রহ করে একটু অপেক্ষা করে আবার চেষ্টা করুন।");
    }
    throw error;
  }
}
