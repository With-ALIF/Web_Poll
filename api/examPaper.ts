import { GoogleGenAI } from "@google/genai";
import { getMCQPrompt } from "../src/features/exam-paper/services/prompts/mcqPrompt";
import { getResponseSchema } from "../src/features/exam-paper/services/schemas";

// Load Gemini clients with rotation support
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
    console.warn(`[Exam Paper API] Rotating to next Gemini API key due to error (New index: ${currentClientIndex})`);
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { content, settings } = req.body;
  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'Content is required.' });
  }
  if (!settings) {
    return res.status(400).json({ error: 'Settings are required.' });
  }

  const prompt = getMCQPrompt(content, settings);
  const schema = getResponseSchema();
  const retries = 5;
  const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let modelAttempt = 0;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const currentModel = modelsToTry[modelAttempt % modelsToTry.length];
    try {
      const aiClient = getAI();
      console.log(`[Exam Paper API] Attempt ${attempt}: Using model ${currentModel}`);
      const response = await aiClient.models.generateContent({
        model: currentModel,
        contents: prompt,
        config: { 
          responseMimeType: "application/json", 
          responseSchema: schema 
        }
      });

      if (!response.text) throw new Error("Empty response from AI");
      
      // Distribute load on success
      if (aiClients.length > 1) {
        currentClientIndex = (currentClientIndex + 1) % aiClients.length;
      }

      return res.status(200).json(JSON.parse(response.text.trim()));
    } catch (error: any) {
      console.error(`[Exam Paper API] Attempt ${attempt} failed with model ${currentModel}:`, error.message || error);
      const msg = error?.message || '';
      
      if (attempt < retries) {
        rotateKey();
        modelAttempt++;
        await new Promise(resolve => setTimeout(resolve, 1500));
        continue;
      }

      const isServiceUnavailable = msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('temporary') || msg.includes('high demand') || msg.includes('Service Unavailable');
      if (isServiceUnavailable) {
        return res.status(503).json({ error: "Gemini সার্ভারে বর্তমানে অত্যধিক চাপ রয়েছে (503 High Demand)। অনুগ্রহ করে কয়েক সেকেন্ড পর আবার চেষ্টা করুন অথবা একটি নতুন API Key যুক্ত করুন।" });
      }
      return res.status(500).json({ error: error.message || "Failed to generate exam paper." });
    }
  }
}
