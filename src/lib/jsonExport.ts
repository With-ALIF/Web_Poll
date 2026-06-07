import { QuizQuestion } from '../types';

export function exportToJSON(questions: QuizQuestion[]) {
  // Map questions to a clean JSON structure
  const data = questions.map(q => ({
    question: q.question,
    options: q.options,
    answer: q.correctOptionIndex + 1, // 1-based index to match CSV
    explanation: q.explanation || '',
    type: 1,
    section: 1,
    image: q.image || ''
  }));

  // Convert to formatted JSON string
  const jsonContent = JSON.stringify(data, null, 2);

  // Create and trigger download
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `quizzes_export_${Math.floor(Date.now() / 1000)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
