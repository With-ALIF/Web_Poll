/* src/features/exam-paper/services/schemas.ts */
import { Type } from "@google/genai";

const metaSchema = {
  type: Type.OBJECT,
  description: "Meta information for the exam paper",
  properties: {
    title: { type: Type.STRING, description: "Main title of the exam" },
    subtitle: { type: Type.STRING, description: "Subtitle (e.g. subject or exam year)" },
    full_marks: { type: Type.STRING, description: "Maximum marks (e.g. '100')" },
    time: { type: Type.STRING, description: "Allowed time (e.g. '3 Hours')" },
    set: { type: Type.STRING, description: "Set name (e.g. 'A')" },
    footerName: { type: Type.STRING, description: "Footer text name" },
    footerLink: { type: Type.STRING, description: "Footer URL" },
    type: { type: Type.STRING, description: "Always 'MCQ'" }
  },
  required: ["title", "subtitle", "full_marks", "time", "set", "type"]
};

export const getResponseSchema = () => ({
  type: Type.OBJECT,
  properties: {
    meta: metaSchema,
    questions: {
      type: Type.ARRAY,
      description: "List of MCQ questions",
      items: {
        type: Type.OBJECT,
        properties: {
          number: { type: Type.NUMBER, description: "Question number (1, 2, ...)" },
          column: { type: Type.STRING, description: "Left or right column", enum: ["left", "right"] },
          question: { type: Type.STRING, description: "The question text" },
          options: {
            type: Type.ARRAY,
            description: "List of exactly 4 options",
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING, description: "A, B, C, or D" },
                text: { type: Type.STRING, description: "Option text" }
              },
              required: ["label", "text"]
            }
          },
          correct_answer: { type: Type.STRING, description: "The correct label (e.g. 'A')" },
          explanation: { type: Type.STRING, description: "Detailed explanation if requested" }
        },
        required: ["number", "column", "question", "options", "correct_answer"]
      }
    }
  },
  required: ["meta", "questions"]
});
