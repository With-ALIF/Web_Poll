/* src/features/exam-paper/services/schemas.ts */
import { Type } from "@google/genai";

const metaSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    subtitle: { type: Type.STRING },
    full_marks: { type: Type.STRING },
    time: { type: Type.STRING },
    set: { type: Type.STRING },
    footer: { type: Type.STRING },
    type: { type: Type.STRING, enum: ["MCQ"] }
  },
  required: ["title", "subtitle", "full_marks", "time", "set", "footer", "type"]
};

export const getResponseSchema = () => ({
  type: Type.OBJECT,
  properties: {
    meta: metaSchema,
    ...mcqQuestionsSchema
  },
  required: ["meta", "questions"]
});

const mcqQuestionsSchema = {
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
};
