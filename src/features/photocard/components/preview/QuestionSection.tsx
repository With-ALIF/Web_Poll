import React from 'react';
import { motion } from 'motion/react';
import { PhotoCardData } from '../../types';
import { SUBJECT_ICON_MAP, DEFAULT_ICON, SUBJECT_COLOR_MAP, DEFAULT_COLOR } from '../../constants';

interface QuestionSectionProps {
  data: PhotoCardData;
}

export const QuestionSection: React.FC<QuestionSectionProps> = ({ data }) => {
  const SubjectIcon = SUBJECT_ICON_MAP[data.subject] || DEFAULT_ICON;
  const iconColor = SUBJECT_COLOR_MAP[data.subject] || DEFAULT_COLOR;

  return (
    <div className="flex-1 flex flex-col justify-center py-1 sm:py-3 md:py-4">
      <h1 
        className="text-xs sm:text-xl md:text-2xl font-black text-center leading-tight line-clamp-4 px-1"
        style={{ color: '#030712' }}
      >
        <motion.span 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center justify-center mr-1.5 sm:mr-3 align-middle p-1 sm:p-2 rounded-lg sm:rounded-xl shadow-sm"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <SubjectIcon 
            className="w-4 h-4 sm:w-10 sm:h-10" 
            style={{ color: iconColor }}
          />
        </motion.span>
        {data.question || "আপনার প্রশ্নটি এখানে লিখুন?"}
      </h1>
    </div>
  );
};
