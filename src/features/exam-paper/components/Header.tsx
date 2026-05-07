/* src/features/exam-paper/components/Header.tsx */
import React from 'react';
import { ExamPaperMeta } from '../types';

interface HeaderProps {
  meta: ExamPaperMeta;
  showTime: boolean;
  showMarks: boolean;
}

export const Header: React.FC<HeaderProps> = ({ meta, showTime, showMarks }) => {
  return (
    <div className="relative z-10 text-center border-b border-black pb-2 mb-4">
      <h1 className="text-xl font-bold uppercase tracking-widest leading-tight">
        {meta.title}
      </h1>
      <p className="text-md font-medium mt-0.5">{meta.subtitle}</p>
      <div className="flex justify-between mt-2 text-[12px] font-bold header-meta pt-1 px-2">
        {showTime && <span>Time: {meta.time}</span>}
        <span>Set: {meta.set}</span>
        {showMarks && <span>Full Marks: {meta.full_marks}</span>}
      </div>
    </div>
  );
};
