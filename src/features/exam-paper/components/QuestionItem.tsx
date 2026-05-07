/* src/features/exam-paper/components/QuestionItem.tsx */
import React from 'react';
import { ExamQuestion } from '../types';

interface QuestionItemProps {
  question: ExamQuestion;
  includeExplanation: boolean;
}

export const QuestionItem: React.FC<QuestionItemProps> = ({ question, includeExplanation }) => {
  return (
    <div className="text-[13px] leading-snug break-inside-avoid question-item font-bengali">
      <div className="font-bold mb-1 flex items-start flex-container">
        <span className="shrink-0 w-10">{question.number}.</span>
        <span className="flex-1">{question.question}</span>
      </div>
      <div className="flex flex-col gap-0.5 ml-10">
        {question.options.map((opt) => (
          <div key={opt.label} className="flex gap-1 items-start option-container">
            <span className="shrink-0 font-bold option-circle text-[13px] w-8">
              {opt.label}.
            </span>
            <span className="flex-1 leading-snug option-text">{opt.text}</span>
          </div>
        ))}
      </div>
      {includeExplanation && (
        <div className="ml-10 mt-1">
          <div className="ans-text font-bold text-[11px] mb-1 text-black">
            Ans: {question.correct_answer}
          </div>
          {question.explanation && (
            <div className="text-[#475569] italic text-[11px] leading-normal bg-[#f8fafc] p-2 rounded-md border-l-2 border-[#cbd5e1] explanation-box">
              <span className="font-bold not-italic block mb-0.5 text-black">Explanation:</span>
              <p>{question.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
