/* src/features/exam-paper/utils/paginateMCQ.ts */
import { ExamQuestion } from '../types';

export interface MCQPage {
  left: ExamQuestion[];
  right: ExamQuestion[];
}

export function paginateMCQs(questions: ExamQuestion[], questionsPerPage: number): MCQPage[] {
  const mcqPages: MCQPage[] = [];
  const allQuestions = [...questions].sort((a, b) => a.number - b.number);
  
  const columnCount = questionsPerPage / 2;
  
  for (let i = 0; i < allQuestions.length; i += questionsPerPage) {
    const pageQuestions = allQuestions.slice(i, i + questionsPerPage);
    const left = pageQuestions.slice(0, columnCount);
    const right = pageQuestions.slice(columnCount, questionsPerPage);
    mcqPages.push({ left, right });
  }
  
  return mcqPages;
}
