/* src/features/exam-paper/components/Footer.tsx */
import React from 'react';

interface FooterProps {
  name?: string;
  link?: string;
  pageNumber?: number;
  totalPages?: number;
}

export const Footer: React.FC<FooterProps> = ({ name, link, pageNumber, totalPages }) => {
  if (!name && !pageNumber) return null;
  return (
    <div className="relative z-10 mt-auto pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-900 footer-section">
      <div className="text-left">
        {name && <span className="font-bold">{name}</span>}
        {link && (
          <span className="ml-2">
            <a href={link} className="text-blue-600 underline">
              {link.replace(/^https?:\/\//, '')}
            </a>
          </span>
        )}
      </div>
      {pageNumber && (
        <div className="text-right font-bold text-black">
          Page {pageNumber} of {totalPages}
        </div>
      )}
    </div>
  );
};
