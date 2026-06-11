import { QuizQuestion } from "../../../types";

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
    console.log("Local JSON parser bypassed, falling back to Gemini API endpoint:", jsonErr);
  }

  // Call the server-side API proxy route
  try {
    const response = await fetch("/api/quiz/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, count, preserveBoardInfo }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    console.error("Error generating quiz from text via API:", err);
    throw err;
  }
}

export async function generateQuizFromImage(imageBase64: string, mimeType: string, count: number = 5, retries: number = 3): Promise<Omit<QuizQuestion, 'id' | 'status'>[]> {
  try {
    const response = await fetch("/api/quiz/generateFromImage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageBase64, mimeType, count }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    console.error("Error generating quiz from image via API:", err);
    throw err;
  }
}
