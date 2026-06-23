import { GoogleGenAI, Type } from "@google/genai";

// Self-contained types to avoid import issues in bundled environment
interface ExamPaperSettings {
  title: string;
  subtitle: string;
  totalQuestions: number;
  difficulty: string;
  includeExplanation: boolean;
}

// Model Fallback List - Using standard high-performance names
const ACTIVE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash", 
  "gemini-flash-latest"
];

// Load Gemini clients with rotation support
let aiClients: GoogleGenAI[] = [];
let currentClientIndex = 0;

function getAIClients(): GoogleGenAI[] {
  if (aiClients.length === 0) {
    const keysSet = new Set<string>();
    
    // Check for standard Gemini API Key locations
    const keysStr = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
    if (keysStr && keysStr !== 'undefined' && typeof keysStr === 'string') {
      keysStr.split(',').forEach(k => {
        const trimmed = k.trim();
        if (trimmed && trimmed.length > 5) keysSet.add(trimmed);
      });
    }

    // Fallback/Extra slots
    [process.env.GEMINI_API_KEY_1, process.env.GEMINI_API_KEY_2, process.env.GEMINI_API_KEY_3].forEach(k => {
      if (k && k !== 'undefined' && typeof k === 'string') {
        const trimmed = k.trim();
        if (trimmed && trimmed.length > 5) keysSet.add(trimmed);
      }
    });
    
    const keys = Array.from(keysSet);
    
    if (keys.length === 0) {
      console.warn("[Exam Paper API] No GEMINI_API_KEY found. Client will be empty.");
      aiClients = [];
    } else {
      console.log(`[Exam Paper API] Initialized with ${keys.length} API keys.`);
      aiClients = keys.map(key => new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' }
        }
      }));
    }
  }
  return aiClients;
}

function getAI(): GoogleGenAI | null {
  const clients = getAIClients();
  if (clients.length === 0) return null;
  const client = clients[currentClientIndex % clients.length];
  return client;
}

function rotateKey() {
  const clients = getAIClients();
  if (clients.length > 1) {
    currentClientIndex = (currentClientIndex + 1) % clients.length;
    console.warn(`[Exam Paper API] Rotating API Key. New Index: ${currentClientIndex}`);
  }
}

// Logic moved inside to avoid bundle/import issues
function getPrompt(content: string, settings: ExamPaperSettings): string {
  const half = Math.ceil(settings.totalQuestions / 2);
  return `Generate professional MCQ exam paper content.
Source: ${content}

SETTING:
- Title: ${settings.title}
- Subtitle: ${settings.subtitle}
- Total Questions: ${settings.totalQuestions}
- Language: The same language as the source content.
- Column split: At question #${half}.

SCHEMA RULES:
- Exactly ${settings.totalQuestions} questions.
- Exactly 4 options per question (label A, B, C, D).
- correct_answer must be "A", "B", "C", or "D".
- column must be "left" or "right".
- Add explanation if requested: ${settings.includeExplanation ? 'YES' : 'NO'}.

Return ONLY valid JSON.`;
}

function getSchema() {
  return {
    type: Type.OBJECT,
    properties: {
      meta: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          subtitle: { type: Type.STRING },
          full_marks: { type: Type.STRING },
          time: { type: Type.STRING },
          set: { type: Type.STRING },
          type: { type: Type.STRING }
        },
        required: ["title", "subtitle", "full_marks", "time", "set"]
      },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            number: { type: Type.NUMBER },
            column: { type: Type.STRING, enum: ["left", "right"] },
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  text: { type: Type.STRING }
                },
                required: ["label", "text"]
              }
            },
            correct_answer: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["number", "column", "question", "options", "correct_answer"]
        }
      }
    },
    required: ["meta", "questions"]
  };
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { content, settings } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required.' });
    }

    const ai = getAI();
    if (!ai) {
      return res.status(500).json({ error: "Gemini API Key is missing. Please add it in Settings > Secrets and redeploy the site." });
    }

    const prompt = getPrompt(content, settings);
    const schema = getSchema();
    const retries = 5;
    
    // Copy the model list to modify locally if model names are bad
    let localModelList = [...ACTIVE_MODELS];

    for (let attempt = 0; attempt <= retries; attempt++) {
      const currentModel = localModelList[0];
      try {
        console.log(`[Exam Paper API] Attempt ${attempt}: Using model ${currentModel}`);
        
        // Use Interactions API (interactions.create) as per @google/genai 2.x skill
        const interaction = await ai.interactions.create({
          model: currentModel,
          input: prompt,
          response_format: schema,
          generation_config: {
            temperature: 0.1
          }
        });

        const lastStep = interaction.steps[interaction.steps.length - 1];
        if (!lastStep || lastStep.type !== 'model_output') {
           throw new Error(`AI failed to produce model output. Step type: ${lastStep?.type || 'none'}`);
        }

        const textContent = lastStep.content?.find(c => c.type === 'text');
        if (!textContent || !textContent.text) {
           throw new Error("AI returned empty text content in the final step.");
        }

        let jsonStr = textContent.text.trim();
        // Clean markdown
        if (jsonStr.includes("```json")) {
           jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
        } else if (jsonStr.includes("```")) {
           jsonStr = jsonStr.split("```")[1].split("```")[0].trim();
        }

        const parsed = JSON.parse(jsonStr);
        return res.status(200).json(parsed);

      } catch (err: any) {
        const msg = err.message || String(err);
        console.warn(`[Exam Paper API] Attempt ${attempt} failed with ${currentModel}:`, msg);

        const isFatal = msg.includes("API_KEY_INVALID") || msg.includes("key is invalid");
        if (isFatal) {
          return res.status(401).json({ error: "Your Gemini API Key is invalid. Please update it in Settings > Secrets." });
        }

        // Handle model errors (404/Quota/Unavailable)
        const shouldDemote = msg.includes("404") || msg.includes("not found") || msg.includes("429") || msg.includes("503") || msg.includes("quota") || msg.includes("overloaded");
        if (shouldDemote && localModelList.length > 1) {
          localModelList.shift();
          localModelList.push(currentModel);
        }

        if (attempt === retries) {
          return res.status(500).json({ error: `Failed after all retries. Final error: ${msg}` });
        }

        rotateKey();
        // Faster backoff for low latency
        await new Promise(r => setTimeout(r, 400 * Math.pow(1.3, attempt)));
      }
    }
  } catch (error: any) {
    console.error("[Exam Paper API] Fatal Handler Error:", error);
    return res.status(500).json({ error: "Fatal Internal Server Error: " + (error.message || String(error)) });
  }
}

