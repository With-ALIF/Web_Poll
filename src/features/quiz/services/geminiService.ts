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

export async function generateQuizFromText(text: string, count: number = 5, preserveBoardInfo: boolean = true, retries: number = 3): Promise<Omit<QuizQuestion, 'id' | 'status'>[]> {
  // Try local JSON parsing first to immediately support copy-pasting preformatted JSON arrays
  try {
    const trimmedText = text.trim();
    if (trimmedText.startsWith('[') || trimmedText.startsWith('{')) {
      const parsed = JSON.parse(trimmedText);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      if (items.length > 0 && (items[0].question || items[0].q)) {
        console.log("Successfully detected and parsed raw JSON input locally", items);
        return items.map((item: any) => {
          let qText = item.question || item.q || '';
          
          if (!preserveBoardInfo) {
            // Strip any bracketed board/university info if not preserved
            qText = qText.replace(/\[\s*(.*?বোর্ড|.*?বো\.|.*?board|.*?university|.*?varsity|.*?\d{4}.*?)\s*\]/gi, '').trim();
            qText = qText.replace(/\[[^\]]+\]\s*$/, '').trim(); // also remove trailing bracketed info if any
          }

          let opts: string[] = [];
          if (Array.isArray(item.options)) opts = item.options;
          else if (Array.isArray(item.choices)) opts = item.choices;
          else if (Array.isArray(item.answers)) opts = item.answers;
          
          // Pad or slice options to have exactly 4 items
          if (opts.length < 4) {
            while (opts.length < 4) {
              opts.push(`Option ${opts.length + 1}`);
            }
          } else if (opts.length > 4) {
            opts = opts.slice(0, 4);
          }

          // Determine correct index
          let correctIdx = 0;
          if (typeof item.correctOptionIndex === 'number') {
            correctIdx = item.correctOptionIndex;
          } else if (typeof item.correct_index === 'number') {
            correctIdx = item.correct_index;
          } else if (item.answer !== undefined) {
            const ansStr = String(item.answer).trim();
            const foundIdx = opts.findIndex(o => o.trim() === ansStr);
            if (foundIdx !== -1) {
              correctIdx = foundIdx;
            } else {
              // Try numeric answer
              const parsedIdx = parseInt(ansStr);
              if (!isNaN(parsedIdx)) {
                // If the parsed index is 1-based (from 1 to 4), make it 0-based
                correctIdx = parsedIdx >= 1 && parsedIdx <= 4 ? parsedIdx - 1 : parsedIdx;
              }
            }
          }

          // Ensure correct index is within bounds [0, 3]
          if (correctIdx < 0 || correctIdx > 3 || isNaN(correctIdx)) {
            correctIdx = 0;
          }

          const explanation = item.explanation || item.explain || item.desc || '';

          return {
            question: qText.substring(0, 250),
            options: opts.map(o => String(o).substring(0, 90)),
            correctOptionIndex: correctIdx,
            explanation: explanation.substring(0, 150)
          };
        });
      }
    }
  } catch (jsonErr) {
    // If JSON parsing fails, we gracefully continue with Gemini generation
    console.log("Local JSON parser bypassed, falling back to Gemini:", jsonErr);
  }

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
      const isServiceUnavailable = errorMsg.includes('503') || errorMsg.includes('UNAVAILABLE') || errorMsg.includes('temporary') || errorMsg.includes('high demand') || errorMsg.includes('Service Unavailable');
      
      if ((isRateLimit || isForbidden || isJsonError || isServiceUnavailable) && attempt < retries) {
        if (isForbidden || isJsonError || isServiceUnavailable) {
          console.error(`Gemini Error: ${isJsonError ? 'Network/JSON error' : isServiceUnavailable ? 'Service Unavailable (503)' : 'Forbidden'}. Switching keys...`);
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
      
      if (isServiceUnavailable) {
        throw new Error("Gemini সার্ভারে বর্তমানে অত্যধিক চাপ রয়েছে (503 High Demand)। অনুগ্রহ করে কয়েক সেকেন্ড পর আবার চেষ্টা করুন অথবা একটি নতুন API Key যুক্ত করুন।");
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
      const isServiceUnavailable = errorMsg.includes('503') || errorMsg.includes('UNAVAILABLE') || errorMsg.includes('temporary') || errorMsg.includes('high demand') || errorMsg.includes('Service Unavailable');
      
      if ((isRateLimit || isForbidden || isJsonError || isServiceUnavailable) && attempt < retries) {
        rotateKey();
        const waitTime = Math.pow(2, attempt) * 2000;
        await delay(waitTime);
        continue;
      }
      
      if (isJsonError) {
        throw new Error("Connection Interrupted: Could not read AI response. Please try again.");
      }
      
      if (isServiceUnavailable) {
        throw new Error("Gemini সার্ভারে বর্তমানে অত্যধিক চাপ রয়েছে (503 High Demand)। অনুগ্রহ করে কয়েক সেকেন্ড পর আবার চেষ্টা করুন অথবা একটি নতুন API Key যুক্ত করুন।");
      }
      
      throw error;
    }
  }
  
  throw new Error("Failed to generate quiz from image after multiple attempts.");
}
