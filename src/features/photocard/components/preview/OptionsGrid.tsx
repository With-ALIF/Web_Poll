import React from 'react';
import { motion } from 'motion/react';
import { PhotoCardData } from '../../types';

interface OptionsGridProps {
  data: PhotoCardData;
}

export const OptionsGrid: React.FC<OptionsGridProps> = ({ data }) => {
  const optionsList = [
    { key: 'a', emoji: '👍' },
    { key: 'b', emoji: '❤️' },
    { key: 'c', emoji: '🥰' },
    { key: 'd', emoji: '😮' }
  ];

  return (
    <div className="rounded sm:rounded-2xl p-1.5 sm:p-2 mb-1 sm:mb-2 shadow-inner" style={{ backgroundColor: '#111827' }}>
      <div className="grid grid-cols-2 gap-1 sm:gap-1.5">
        {optionsList.map((opt) => (
          <motion.div 
            key={opt.key}
            whileHover={{ scale: 1.02 }}
            className="py-1.5 px-1 sm:py-3 sm:px-2 rounded sm:rounded-xl border border-gray-700 flex items-center space-x-1 sm:space-x-2 transition-colors"
            style={{ backgroundColor: '#1f2937' }}
          >
            <span className="text-xs sm:text-xl">{opt.emoji}</span>
            <span className="text-white text-[7px] sm:text-sm md:text-base font-medium truncate">
              {(data.options as any)[opt.key] || "অপশন..."}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
