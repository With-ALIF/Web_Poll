import { GoogleGenAI, Type } from "@google/genai";

// Load Gemini clients with rotation support
let aiClients: GoogleGenAI[] = [];
let currentClientIndex = 0;

// Module-level fallback model lists that auto-heal if a model gets exhausted (429/503)
let activeTextModels = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
let activeImageModels = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];

function demoteModel(modelList: string[], modelName: string, serviceName: string) {
  const index = modelList.indexOf(modelName);
  if (index !== -1 && modelList.length > 1) {
    modelList.splice(index, 1);
    modelList.push(modelName);
    console.warn(`[${serviceName}] Demoted model ${modelName} due to temporary failure. New order: ${modelList.join(', ')}`);
  }
}

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
      console.warn("No GEMINI_API_KEY variables found in server environment. Falling back to default initialization.");
      aiClients = [new GoogleGenAI({
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      })];
    } else {
      aiClients = keys.map(key => new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      }));
    }
  }
  return aiClients;
}

function getAI(): GoogleGenAI {
  const clients = getAIClients();
  return clients[currentClientIndex % clients.length];
}

function rotateKey() {
  const clients = getAIClients();
  if (clients.length > 1) {
    currentClientIndex = (currentClientIndex + 1) % clients.length;
    console.warn(`[Quiz API] Rotating to next Gemini API key due to error (New index: ${currentClientIndex})`);
  }
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateQuizFromTextLogic(text: string, count: number = 5, preserveBoardInfo: boolean = true, retries: number = 5): Promise<any[]> {
  const boardPreservationInstruction = preserveBoardInfo
    ? `CRITICAL - BOARD/UNIVERSITY/CREATOR NAME PRESERVATION:
If the input contains a board/university name, exam year, creator name tag, personal credit, or multiple names/years/tags (e.g., in brackets like '[দিনাজপুর বোর্ড ২০২৩]', '[ঢাকা বিশ্ববিদ্যালয়]', combined like '[ঢা. বো. ২৩; রা. বো. ২২]', '[DU 22-23]', or as raw text/metadata without brackets e.g. 'Ac.QBদিনাজপুর বোর্ড2023Scienceখ', 'Ad.QBDU2023Unit-A', 'B-2.1Hasan', or on a separate line), you MUST detect these board, varsity, exam, creator, credit, or name tags.
Format and append them neatly inside brackets at the end of the question string.
CRITICAL FORMATTING RULES FOR CREATOR TAGS & PREFIXES:
1. For personal creator tags/credits that have serial prefixes or codes like 'B-2.1Hasan', 'B-1.5Karim', etc., you MUST completely strip away the leading code/serial prefix (e.g., 'B-2.1', 'B-1.5') and keep ONLY the clean human name (e.g. '[Hasan]', '[Karim]').
2. For varsity/board metadata, keep them clean (e.g., '[দিনাজপুর বোর্ড ২০২৩]' or '[DU 2023 Unit-A]').
Under no circumstances should you discard the core human name or board information.
Also, the remaining main question statement MUST be kept EXACTLY 100% identical word-for-word to the input text without any rephrasing or modification!`
    : `CRITICAL - BOARD/UNIVERSITY NAME STRIPPING (DO NOT INCLUDE):
If the input contains a board/university name, exam year, multiple names/years, exam metadata, or creator/personal names/credits/tags (e.g., '[দিনাজপুর বোর্ড ২০২৩]', 'Ac.QBদিনাজপুর বোর্ড2023Scienceখ', 'Ad.QBDU2023Unit-A', 'B-2.1Hasan', 'Hasan', '[ঢা. বো. ২৩; রা. বো. ২২]', '[DU 22-23]', or similar patterns either in brackets, as raw text, or on separate lines), you MUST STRIP THESE OUT ENTIRELY from the question. Under no circumstances should you include or append any board, university, exam year, board abbreviation, creator name, personal credit, or exam codes/subjects/units/tags (like 'Science', 'Arts', 'Commerce', 'খ', 'ক', 'Unit-A', 'Ad.QB', 'Ac.QB', 'B-2.1Hasan', 'Hasan', 'B-2.1') in the generated question text. Keep the question clean and focused only on the question statement itself.
However, you MUST keep the core question statement EXACTLY 100% identical word-for-word to the input text without any translation, rephrasing, or modification!`;

  let modelAttempt = 0;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const currentModel = activeTextModels[modelAttempt % activeTextModels.length];
    try {
      const aiClient = getAI();
      console.log(`[Quiz API] Text Attempt ${attempt}: Using model ${currentModel}`);
      
      const response = await aiClient.models.generateContent({
        model: currentModel,
        contents: `You are an expert quiz creator. Extract exactly ${count} multiple-choice questions from the provided text. 
The text may be unstructured, in different languages (including Bengali), messy, or in CSV format. 
If the input is CSV, map the options and the correct answer properly (note that CSV answers might be 1-indexed, e.g., 1, 2, 3, 4, but you MUST output a 0-indexed correctOptionIndex, e.g., 0, 1, 2, 3).
Identify key facts and convert them into a quiz format. 
Ensure each question has exactly 4 options. 

CRITICAL - EXACT QUESTION WORDING PRESERVATION:
You MUST keep the question statement EXACTLY word-for-word as it is written in the input text. Under no circumstances should you rephrase, translate, summarize, clean up, correct grammar, or rewrite the question statement. It must match the original wording identically.

${boardPreservationInstruction}

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
        throw new Error("AI returned an empty response.");
      }

      let jsonStr = response.text.trim();
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.replace(/^```json\n/, "").replace(/\n```$/, "");
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```\n/, "").replace(/\n```$/, "");
      }

      // Distribute load on success
      if (aiClients.length > 1) {
        currentClientIndex = (currentClientIndex + 1) % aiClients.length;
      }

      return JSON.parse(jsonStr);
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      const isRateLimit = errorMsg.includes('429') || errorMsg.includes('Quota exceeded');
      const isForbidden = errorMsg.includes('403') || errorMsg.includes('leaked') || errorMsg.includes('PERMISSION_DENIED');
      const isJsonError = errorMsg.includes('json') || errorMsg.includes('Unexpected end of JSON');
      const isServiceUnavailable = errorMsg.includes('503') || errorMsg.includes('UNAVAILABLE') || errorMsg.includes('temporary') || errorMsg.includes('high demand') || errorMsg.includes('Service Unavailable');
      
      if (isRateLimit || isServiceUnavailable) {
        demoteModel(activeTextModels, currentModel, "Quiz API Text");
      }

      if (attempt < retries) {
        console.warn(`[Quiz API] Attempt ${attempt} with model ${currentModel} failed (will retry):`, error.message || error);
        rotateKey();
        modelAttempt++;
        const waitTime = Math.pow(2, attempt % 3) * 1500;
        await delay(waitTime);
        continue;
      }
      
      console.error(`[Quiz API] Text generation failed after all attempts. Final error on ${currentModel}:`, error.message || error);

      if (isServiceUnavailable) {
        throw new Error("Gemini সার্ভারে বর্তমানে অত্যধিক চাপ রয়েছে (503 High Demand)। অনুগ্রহ করে কয়েক সেকেন্ড পর আবার চেষ্টা করুন অথবা একটি নতুন API Key যুক্ত করুন।");
      }
      
      throw error;
    }
  }
  
  throw new Error("Failed to generate quiz after multiple attempts due to server limits.");
}

export async function generateQuizFromImageLogic(imageBase64: string, mimeType: string, count: number = 5, retries: number = 5): Promise<any[]> {
  let modelAttempt = 0;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const currentModel = activeImageModels[modelAttempt % activeImageModels.length];
    try {
      const aiClient = getAI();
      console.log(`[Quiz API] Image Attempt ${attempt}: Using model ${currentModel}`);
      
      const response = await aiClient.models.generateContent({
        model: currentModel,
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

      // Distribute load on success
      if (aiClients.length > 1) {
        currentClientIndex = (currentClientIndex + 1) % aiClients.length;
      }

      return JSON.parse(jsonStr);
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      const isRateLimit = errorMsg.includes('429') || errorMsg.includes('Quota exceeded');
      const isForbidden = errorMsg.includes('403') || errorMsg.includes('leaked') || errorMsg.includes('PERMISSION_DENIED');
      const isJsonError = errorMsg.includes('json') || errorMsg.includes('Unexpected end of JSON');
      const isServiceUnavailable = errorMsg.includes('503') || errorMsg.includes('UNAVAILABLE') || errorMsg.includes('temporary') || errorMsg.includes('high demand') || errorMsg.includes('Service Unavailable');
      
      if (isRateLimit || isServiceUnavailable) {
        demoteModel(activeImageModels, currentModel, "Quiz API Image");
      }

      if (attempt < retries) {
        console.warn(`[Quiz API] Image Attempt ${attempt} with model ${currentModel} failed (will retry):`, error.message || error);
        rotateKey();
        modelAttempt++;
        const waitTime = Math.pow(2, attempt % 3) * 1500;
        await delay(waitTime);
        continue;
      }
      
      console.error(`[Quiz API] Image generation failed after all attempts. Final error on ${currentModel}:`, error.message || error);

      if (isServiceUnavailable) {
        throw new Error("Gemini সার্ভারে বর্তমানে অত্যধিক চাপ রয়েছে (503 High Demand)। অনুগ্রহ করে কয়েক সেকেন্ড পর আবার চেষ্টা করুন অথবা একটি নতুন API Key যুক্ত করুন।");
      }
      
      throw error;
    }
  }
  
  throw new Error("Failed to generate quiz from image after multiple attempts.");
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Parse path or action to distinguish requests
  const path = req.path || req.originalUrl || req.url || '';
  const isImageRequest = path.includes('generateFromImage');

  try {
    if (isImageRequest) {
      const { imageBase64, mimeType, count } = req.body;
      if (!imageBase64 || !mimeType) {
        return res.status(400).json({ error: 'imageBase64 and mimeType are required' });
      }
      const data = await generateQuizFromImageLogic(imageBase64, mimeType, count || 5);
      return res.status(200).json(data);
    } else {
      const { text, count, preserveBoardInfo } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'text is required' });
      }
      const data = await generateQuizFromTextLogic(text, count || 5, preserveBoardInfo !== false);
      return res.status(200).json(data);
    }
  } catch (error: any) {
    console.error("[Quiz API Error]:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
