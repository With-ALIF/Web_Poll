import { GoogleGenAI } from "@google/genai";

// Load Gemini clients with rotation support
let aiClients: GoogleGenAI[] = [];
let currentClientIndex = 0;

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

  try {
    const aiInstance = getAI();
    
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

    const response = await aiInstance.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const formatted = response.text || "";
    return res.status(200).json({ formattedNote: formatted });
  } catch (error: any) {
    console.error("Gemini Note Formatting Error:", error);
    return res.status(500).json({ error: error.message || 'Failed to generate note using Gemini.' });
  }
}
