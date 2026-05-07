import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from "../../../types";

let aiClients: GoogleGenAI[] = [];
let currentClientIndex = 0;

function getAIClients(): GoogleGenAI[] {
  if (aiClients.length === 0) {
    const keysSet = new Set<string>();
    
    // Check for comma-separated keys
    const keysStr = process.env.GEMINI_API_KEYS;
    if (keysStr && keysStr !== 'undefined') {
      keysStr.split(',').forEach(k => {
        const trimmed = k.trim();
        if (trimmed) keysSet.add(trimmed);
      });
    }

    // Check for individual keys
    const individualKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_1,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3
    ];

    individualKeys.forEach(k => {
      if (k && k !== 'undefined') {
        const trimmed = k.trim();
        if (trimmed) keysSet.add(trimmed);
      }
    });
    
    const keys = Array.from(keysSet);
    
    if (keys.length === 0) {
      console.error("Environment variable GEMINI_API_KEY/KEYS is missing or undefined.");
      throw new Error("Gemini API configuration is missing. Please set GEMINI_API_KEY or GEMINI_API_KEY_1, _2, _3 in your server environment and rebuild/restart.");
    }
    
    aiClients = keys.map(key => new GoogleGenAI({ apiKey: key }));
  }
  return aiClients;
}

function getAI(): GoogleGenAI {
  const clients = getAIClients();
  const client = clients[currentClientIndex % clients.length];
  // Increment index for true round-robin rotation across requests
  currentClientIndex = (currentClientIndex + 1) % clients.length;
  return client;
}

function rotateKey() {
  // Manual rotation increment (used on failures)
  const clients = getAIClients();
  if (clients.length > 1) {
    // If we incremented in getAI but it failed, rotateKey will skip to the next
    // This is fine as it ensures we don't keep hitting the same failed key
    currentClientIndex = (currentClientIndex + 1) % clients.length;
    console.warn(`Encountered error, rotating to next Gemini API key (New target index: ${currentClientIndex})`);
  }
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateQuizFromText(text: string, count: number = 5, retries: number = 3): Promise<Omit<QuizQuestion, 'id' | 'status'>[]> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const aiClient = getAI();
      const response = await aiClient.models.generateContent({
        model: "gemini-flash-latest",
        contents: `You are an expert quiz creator. Extract exactly ${count} multiple-choice questions from the provided text. 
The text may be unstructured, in different languages (including Bengali), messy, or in CSV format. 
If the input is CSV, map the options and the correct answer properly (note that CSV answers might be 1-indexed, e.g., 1, 2, 3, 4, but you MUST output a 0-indexed correctOptionIndex, e.g., 0, 1, 2, 3).
Identify key facts and convert them into a quiz format. 
Ensure each question has exactly 4 options. 
CRITICAL: Keep questions under 250 characters and options under 90 characters to comply with Telegram's limits.
The output must be in the language of the input text.

Text to process:
${text}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { 
                  type: Type.STRING,
                  description: "The quiz question. Max 250 characters."
                },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Exactly 4 options for the multiple choice question. Max 90 characters per option."
                },
                correctOptionIndex: { 
                  type: Type.INTEGER,
                  description: "The index of the correct option (0 to 3). If the source says answer is 4, this should be 3."
                },
                explanation: { 
                  type: Type.STRING,
                  description: "A short explanation of why the answer is correct. Max 150 characters."
                }
              },
              required: ["question", "options", "correctOptionIndex", "explanation"]
            }
          }
        }
      });

      if (!response || !response.text) {
        console.error("Response object is invalid or missing:", response);
        throw new Error("AI returned an empty response. Please check your API key validity and quota.");
      }

      let jsonStr = "";
      try {
        jsonStr = response.text.trim();
      } catch (textErr) {
        console.error("Failed to extract text from response:", textErr);
        throw new Error("Could not read text from AI response. Check your API key.");
      }

      if (!jsonStr) {
        throw new Error("AI returned empty text. This might be a safety filter or quota issue.");
      }

      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.replace(/^```json\n/, "").replace(/\n```$/, "");
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```\n/, "").replace(/\n```$/, "");
      }

      try {
        return JSON.parse(jsonStr);
      } catch (e) {
        console.error("Failed to parse JSON:", jsonStr);
        throw new Error("AI generated an invalid format. Please try again.");
      }
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      const isRateLimit = errorMsg.includes('429') || errorMsg.includes('Quota exceeded');
      const isForbidden = errorMsg.includes('403') || errorMsg.includes('leaked') || errorMsg.includes('PERMISSION_DENIED');
      const isJsonError = errorMsg.includes('json') || errorMsg.includes('Unexpected end of JSON');
      
      if ((isRateLimit || isForbidden || isJsonError) && attempt < retries) {
        if (isForbidden || isJsonError) {
          console.error(`Gemini Error: ${isJsonError ? 'Network/JSON error' : 'Forbidden'}. Switching keys...`);
        }
        
        rotateKey();
        
        // Exponential backoff
        const waitTime = Math.pow(2, attempt) * 2000;
        console.warn(`Gemini error. Retrying in ${waitTime/1000}s... (Attempt ${attempt + 1} of ${retries})`);
        await delay(waitTime);
        continue;
      }
      
      if (isJsonError) {
        throw new Error("API Connection Interrupted: Your server or internet connection blocked the AI response. Please try again or check your API key.");
      }
      
      throw error;
    }
  }
  
  throw new Error("Failed to generate quiz after multiple attempts due to server limits.");
}

export async function generateQuizFromImage(imageBase64: string, mimeType: string, count: number = 5, retries: number = 3): Promise<Omit<QuizQuestion, 'id' | 'status'>[]> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const aiClient = getAI();
      const response = await aiClient.models.generateContent({
        model: "gemini-flash-latest", // Standard stable flash model
        contents: {
          parts: [
            {
              inlineData: {
                data: imageBase64.split(',')[1] || imageBase64,
                mimeType: mimeType
              }
            },
            {
              text: `You are an expert quiz creator. Extract exactly ${count} multiple-choice questions from the provided image. 
The image contains questions and options. Extract them faithfully.
Note that the answers might be indicated in the image (e.g., circled, bold, or at the end).
Ensure each question has exactly 4 options. 
CRITICAL: Keep questions under 250 characters and options under 90 characters to comply with Telegram's limits.
The output must be in the language of the input image.

Identify key facts and convert them into a quiz format. 
Map the options and the correct answer properly.
You MUST output a 0-indexed correctOptionIndex (e.g., 0, 1, 2, 3).`
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { 
                  type: Type.STRING,
                  description: "The quiz question. Max 250 characters."
                },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Exactly 4 options for the multiple choice question. Max 90 characters per option."
                },
                correctOptionIndex: { 
                  type: Type.INTEGER,
                  description: "The index of the correct option (0 to 3)."
                },
                explanation: { 
                  type: Type.STRING,
                  description: "A short explanation. Max 150 characters."
                }
              },
              required: ["question", "options", "correctOptionIndex", "explanation"]
            }
          }
        }
      });

      if (!response.text) {
        throw new Error("Failed to generate content");
      }

      let jsonStr = response.text.trim();
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.replace(/^```json\n/, "").replace(/\n```$/, "");
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```\n/, "").replace(/\n```$/, "");
      }

      try {
        return JSON.parse(jsonStr);
      } catch (e) {
        console.error("Failed to parse JSON:", jsonStr);
        throw new Error("AI generated invalid format from image. Please try again.");
      }
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      const isRateLimit = errorMsg.includes('429') || errorMsg.includes('Quota exceeded');
      const isForbidden = errorMsg.includes('403') || errorMsg.includes('leaked') || errorMsg.includes('PERMISSION_DENIED');
      const isJsonError = errorMsg.includes('json') || errorMsg.includes('Unexpected end of JSON');
      
      if ((isRateLimit || isForbidden || isJsonError) && attempt < retries) {
        rotateKey();
        const waitTime = Math.pow(2, attempt) * 2000;
        await delay(waitTime);
        continue;
      }
      
      if (isJsonError) {
        throw new Error("Connection Interrupted: Could not read AI response. Please try again.");
      }
      
      throw error;
    }
  }
  
  throw new Error("Failed to generate quiz from image after multiple attempts.");
}
