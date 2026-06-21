import { GoogleGenAI, Type } from "@google/genai";

// Load Gemini clients with rotation support
let aiClients: GoogleGenAI[] = [];
let currentClientIndex = 0;

// Fallback models that can auto-heal on quota/temporary errors (429/503)
let activeModels = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];

function demoteModel(modelName: string) {
  const index = activeModels.indexOf(modelName);
  if (index !== -1 && activeModels.length > 1) {
    activeModels.splice(index, 1);
    activeModels.push(modelName);
    console.warn(`[Photocard API] Demoted model ${modelName} due to failure. New order: ${activeModels.join(', ')}`);
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
    console.warn(`[Photocard API] Rotating to next Gemini API key due to error (New index: ${currentClientIndex})`);
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { question } = req.body;
  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ error: 'Please provide a valid question' });
  }

  const retries = 5;
  let modelAttempt = 0;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const currentModel = activeModels[0];
    try {
      const aiClient = getAI();
      console.log(`[Photocard API] Temporary Attempt ${attempt}: Using model ${currentModel}`);
      
      const interaction = await aiClient.interactions.create({
        model: currentModel,
        input: `Based on the following MCQ question, generate 4 relevant options (A, B, C, D). 
IMPORTANT: Detect the language of the question and generate the options in that SAME LANGUAGE.
If the question is in English, options must be in English. 
If the question is in Bengali, options must be in Bengali.
 
Question: ${question}`,
        response_format: {
          type: Type.OBJECT,
          properties: {
            a: { type: Type.STRING, description: "Option A" },
            b: { type: Type.STRING, description: "Option B" },
            c: { type: Type.STRING, description: "Option C" },
            d: { type: Type.STRING, description: "Option D" },
          },
          required: ["a", "b", "c", "d"],
        },
      });

      const lastStep = interaction.steps[interaction.steps.length - 1];
      if (!lastStep || lastStep.type !== 'model_output') throw new Error("No options generated.");
      
      const textStep = lastStep.content?.find(c => c.type === 'text');
      const text = textStep?.text;
      if (!text) throw new Error("No text content in response.");

      // Distribute load on success
      if (aiClients.length > 1) {
        currentClientIndex = (currentClientIndex + 1) % aiClients.length;
      }

      return res.status(200).json(JSON.parse(text));
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      const isServiceUnavailable = errorMsg.includes('503') || errorMsg.includes('UNAVAILABLE') || errorMsg.includes('temporary') || errorMsg.includes('high demand') || errorMsg.includes('Service Unavailable');
      const isRateLimit = errorMsg.includes('429') || errorMsg.includes('Quota exceeded');

      if (isRateLimit || isServiceUnavailable) {
        demoteModel(currentModel);
      }

      if (attempt < retries) {
        console.warn(`[Photocard API] Attempt ${attempt} failed with model ${currentModel} (will retry):`, error.message || error);
        rotateKey();
        modelAttempt++;
        await new Promise(resolve => setTimeout(resolve, 1500));
        continue;
      }

      console.error(`[Photocard API] All attempts failed. Final error with model ${currentModel}:`, error.message || error);

      if (isServiceUnavailable) {
        return res.status(503).json({ error: "Gemini সার্ভারে বর্তমানে অত্যধিক চাপ রয়েছে (503 High Demand)। অনুগ্রহ করে কয়েক সেকেন্ড পর আবার চেষ্টা করুন।" });
      }
      if (isRateLimit) {
        return res.status(429).json({ error: "API ব্যবহার মাত্রা অতিক্রম করেছে (429 Rate Limit)। অনুগ্রহ করে একটু অপেক্ষা করে আবার চেষ্টা করুন।" });
      }
      return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  }
}
