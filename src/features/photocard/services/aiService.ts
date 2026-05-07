import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateOptions(question: string) {
  if (!question.trim()) {
    throw new Error("Please provide a question first.");
  }

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
}
