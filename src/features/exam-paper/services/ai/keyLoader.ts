/* src/features/exam-paper/services/ai/keyLoader.ts */

export function loadGeminiKeys(): string[] {
  const keysSet = new Set<string>();
  
  const keysStr = process.env.GEMINI_API_KEYS;
  if (keysStr && keysStr !== 'undefined') {
    keysStr.split(',').forEach((k: string) => {
      const t = k.trim();
      if (t && t.length > 10 && !t.includes('YOUR_')) keysSet.add(t);
    });
  }

  const envKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    (process.env as any).VITE_GEMINI_API_KEY
  ];

  envKeys.forEach(k => {
    if (k && k !== 'undefined') {
      const t = k.trim();
      if (t && t.length > 10 && !t.includes('YOUR_')) keysSet.add(t);
    }
  });
  
  return Array.from(keysSet);
}
