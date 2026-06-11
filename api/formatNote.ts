import { GoogleGenAI } from "@google/genai";

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
    console.warn(`[Format Note API] Demoted model ${modelName} due to errors. New order: ${activeModels.join(', ')}`);
  }
}

function getAIClients(): GoogleGenAI[] {
  if (aiClients.length === 0) {
    const keysSet = new Set<string>();
    
    // Check for standard API key or comma-separated API keys
    const keysStr = process.env.GEMINI_API_KEYS;
    if (keysStr && keysStr !== 'undefined') {
      keysStr.split(',').forEach(k => {
        const trimmed = k.trim();
        if (trimmed) keysSet.add(trimmed);
      });
    }

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
      console.warn("No GEMINI_API_KEY variables found. Falling back to default initialization.");
      // We will try an unitialized instance which might fallback to process.env.GEMINI_API_KEY automatically
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
  const client = clients[currentClientIndex % clients.length];
  currentClientIndex = (currentClientIndex + 1) % clients.length;
  return client;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { content } = req.body;
  if (!content || typeof content !== 'string' || content.trim() === '') {
    return res.status(400).json({ error: 'Content is required' });
  }

  const isShortTopic = content.trim().length < 200;
  
  let promptSuffix = '';
  if (isShortTopic) {
    promptSuffix = `The user input is extremely short (under 200 characters) and is likely a topic name, concept, chapter, or keyword (for example, "${content.trim()}").
Since the user only provided a topic name instead of full study material, you MUST proactively write a highly comprehensive, extremely detailed, and complete college/admission level study note on this topic ("${content.trim()}") from scratch using your own knowledge. 
Generate extensive background, core definitions, mathematical equations, properties, classifications, units, dimension tables, and classic exam tips so the student gets a fully complete note without requiring pre-written text.`;
  } else {
    promptSuffix = `The user has provided a detailed draft or raw notes. Use this raw text as the source of truth, organize it, clean it up, make it comprehensive, and format it beautifully. Ensure you keep all facts, numbers, and detailed theories from the input intact.`;
  }

  const prompt = `You are an expert Educational & General Note Formatter who generates beautifully structured, extremely informative, and context-rich study notes.

User Input Topic/Content:
"""
${content}
"""

${promptSuffix}

Your task is to analyze this input and generate a highly comprehensive, information-rich, clean, and beautiful educational markdown note on the entire topic, keeping all facts, concepts, and detailed theories intact. Do not summarize too briefly — the note must be detailed and cover all key concepts.

Formatting & Style Rules:
1. **Title**: Start with a bold, distinct title/heading at the very beginning (e.g., "# পদার্থবিজ্ঞান ১ম পত্র — ১ম অধ্যায় (ভৌত জগৎ ও পরিমাপ) এর বিস্তারিত নোট" or "# ${content.trim()} — বিস্তারিত স্টাডি নোট").
2. **Sequential Bengali/English Numbering**: Use clear numbered headings like "১. [টপিক নাম]", "২. [টপিক নাম]" for main sections.
3. **Structured Sub-sections**: Use nested bullet points (•, ক, খ) for classifications, definitions, and types, making them highly readable.
4. **Tables for Units & Values**: Always convert lists of measurements, units, scales, prefixes, variables, or equations into cleanly formatted Markdown tables.
5. **Special Highlights & Tips**: Add boxes or highlighted sections for crucial points, such as:
   - "Admission Tip: [Crucial exam point]"
   - "মনে রাখো: [Important mnemonic or shortcut]"
   - "Shortcut Line: [Easy memorization line]"
6. **Linguistic Tone**: Keep the language exactly as requested (usually Bengali mixed with core English terms in parentheses, e.g., "ভৌত রাশি (Physical Quantity)"). Keep a warm, scholastic, and highly helpful tone.
7. **No Meta Comments**: Avoid any introductory or closing statements (like "Here is the note:"). Output ONLY the direct markdown notes itself.`;

  const clients = getAIClients();
  let lastError: any = null;
  let formatted = "";
  
  const retriesCount = 5;
  let modelAttempt = 0;

  for (let attempt = 0; attempt <= retriesCount; attempt++) {
    const activeIndex = (currentClientIndex + attempt) % Math.max(1, clients.length);
    const aiInstance = clients[activeIndex];
    const currentModel = activeModels[modelAttempt % activeModels.length];

    try {
      console.log(`[Note Generation] Temporary Attempt ${attempt}: Using key index ${activeIndex + 1} and model ${currentModel}`);
      const response = await aiInstance.models.generateContent({
        model: currentModel,
        contents: prompt,
      });

      formatted = response.text || "";
      // Update global index to the next one to distribute load gracefully next time
      currentClientIndex = (activeIndex + 1) % Math.max(1, clients.length);
      console.log(`[Note Generation] Successfully generated formatted note using key index ${activeIndex + 1}`);
      break;
    } catch (error: any) {
      lastError = error;
      const errMsg = error?.message || String(error);
      const isRateLimit = errMsg.includes('429') || errMsg.includes('Quota exceeded');
      const isServiceUnavailable = errMsg.includes('503') || errMsg.includes('temporary') || errMsg.includes('high demand') || errMsg.includes('Service Unavailable');
      
      if (isRateLimit || isServiceUnavailable) {
        demoteModel(currentModel);
      }

      if (attempt < retriesCount) {
        console.warn(`[Note Generation] Attempt ${attempt} with model ${currentModel} on key index ${activeIndex + 1} failed (will retry):`, error.message || error);
        modelAttempt++;
        console.log(`[Note Generation] Rate limited or server busy. Waiting 1.5s then trying next key/model...`);
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        console.error(`[Note Generation] All attempts failed. Final error with model ${currentModel} on key index ${activeIndex + 1}:`, error.message || error);
      }
    }
  }

  if (!formatted && lastError) {
    const errorMsg = lastError?.message || String(lastError);
    if (errorMsg.includes('suspended') || errorMsg.includes('PERMISSION_DENIED') || errorMsg.includes('403')) {
      return res.status(403).json({
        error: `Gemini formatting failed check. All API keys tried (${clients.length} loaded). Final error: API Key is suspended or permissions were denied. Please update your key settings.`
      });
    }
    return res.status(500).json({ 
      error: `Failed to generate note after trying all available Gemini keys. Last error: ${errorMsg}` 
    });
  }

  return res.status(200).json({ formattedNote: formatted });
}
