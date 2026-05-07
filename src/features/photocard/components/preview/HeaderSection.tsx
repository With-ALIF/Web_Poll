import React from 'react';
import { PhotoCardData } from '../../types';

interface HeaderSectionProps {
  data: PhotoCardData;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({ data }) => {
  return (
    <>
      <div className="mt-1 sm:mt-2 flex justify-between items-center w-full px-2 sm:px-6">
        <div className="flex items-center space-x-2">
          {data.logoUrl && data.logoUrl.trim() !== '' && (
            <img 
              src={data.logoUrl} 
              alt="Logo" 
              className="w-6 h-6 sm:w-12 sm:h-12 object-contain rounded-md"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== data.logoUrl) return; // Prevent infinite loop if fallback also fails
                console.warn('Logo preview failed to load');
              }}
            />
          )}
        </div>
        <div className="flex-1 text-right">
          <span className="text-[10px] sm:text-[16px] font-bold leading-tight" style={{ color: '#030712' }}>
            {data.headerTitle}
          </span>
        </div>
      </div>

      <div className="mt-1 sm:mt-4 flex flex-col items-center space-y-0.5 sm:space-y-2">
        <div className="h-[1.5px] sm:h-[4px] w-full" style={{ backgroundColor: '#030712' }} />
        <h2 className="text-sm sm:text-2xl md:text-3xl font-black px-1 sm:px-4 text-center uppercase tracking-tighter truncate w-full" style={{ color: '#030712' }}>
          {data.subject || "সাবজেক্ট নাম"}
        </h2>
        <p className="text-[8px] sm:text-lg md:text-xl font-bold" style={{ color: '#1f2937' }}>
          {data.chapter || "অধ্যায় নাম"}
        </p>
      </div>
    </>
  );
};
