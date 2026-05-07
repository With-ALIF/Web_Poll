/* src/features/exam-paper/services/ai/clientManager.ts */
import { GoogleGenAI } from "@google/genai";
import { loadGeminiKeys } from "./keyLoader";

let aiClients: GoogleGenAI[] = [];
let currentClientIndex = 0;

export function getAIClients(): GoogleGenAI[] {
  if (aiClients.length === 0) {
    const keys = loadGeminiKeys();
    if (keys.length === 0) {
      throw new Error("Gemini API key is not configured.");
    }
    aiClients = keys.map(key => new GoogleGenAI({ apiKey: key }));
  }
  return aiClients;
}

export function getActiveClientInfo() {
  const clients = getAIClients();
  const index = currentClientIndex % clients.length;
  return {
    client: clients[index],
    index
  };
}

export function rotateClient() {
  const clients = getAIClients();
  if (clients.length > 0) {
    currentClientIndex = (currentClientIndex + 1) % clients.length;
  }
}
