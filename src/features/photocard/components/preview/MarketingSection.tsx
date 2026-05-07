import React from 'react';
import { PhotoCardData } from '../../types';

interface MarketingSectionProps {
  data: PhotoCardData;
}

export const MarketingSection: React.FC<MarketingSectionProps> = ({ data }) => {
  return (
    <div className="relative mt-auto pt-1 sm:pt-3 mb-1 sm:mb-2 px-4 flex justify-between items-end">
      {/* Left Side */}
      <div className="flex flex-col items-center z-10 basis-[45%]">
        <h3 className="text-lg sm:text-[22px] md:text-[26px] font-black mb-0.5 sm:mb-1 tracking-tight leading-none whitespace-nowrap" style={{ color: '#030712' }}>
          {data.leftLabel === "সলভ কোর্স :" ? "অনুশীলনী" : (data.leftLabel || "অনুশীলনী")}
        </h3>
        <div className="bg-[#FFD74D] border-[1.5px] sm:border-[2px] px-2.5 sm:px-4 py-1 sm:py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-sm mt-0.5" style={{ borderColor: '#030712' }}>
          <span className="text-[9px] sm:text-[13px] md:text-[15px] font-bold whitespace-nowrap leading-none block pt-0.5" style={{ color: '#030712' }}>
            {data.leftHighlightedBox === "অনুশীলনী" ? "সলভ কোর্স :" : (data.leftHighlightedBox || "সলভ কোর্স :")}
          </span>
        </div>
      </div>

      {/* Looped Arrow SVG */}
      <div className="absolute inset-x-0 bottom-[10px] sm:bottom-[5px] pointer-events-none flex justify-center items-center overflow-visible z-0">
        <svg viewBox="0 0 200 80" className="w-[70px] sm:w-[130px] h-[30px] sm:h-[55px] opacity-90 translate-x-[5%] sm:translate-x-[12%] translate-y-[5%] sm:translate-y-[0%]">
          <path 
            d="M30 40 C 60 40, 80 80, 55 80 C 35 80, 30 50, 60 20 C 90 -10, 140 10, 175 35" 
            fill="none" 
            stroke="#1a1a1a" 
            strokeWidth="2.5" 
            strokeDasharray="4 3"
            strokeLinecap="round"
          />
          <path d="M175 35 L162 32 L170 45 Z" fill="#1a1a1a" />
        </svg>
      </div>

      {/* Right Side */}
      <div className="flex flex-col items-center z-10 basis-[45%]">
        <p className="text-[8px] sm:text-[13px] md:text-[15px] font-black mb-0.5 sm:mb-1 text-center whitespace-nowrap tracking-tight" style={{ color: '#030712' }}>
          {data.rightHighlightedFeatures || "ক্লাস, পিডিএফ, পোল"}
        </p>
        <div className="bg-[#FFD74D] border-[1.5px] sm:border-[2px] px-2.5 sm:px-4 py-1 sm:py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-sm mt-0.5" style={{ borderColor: '#030712' }}>
          <span className="text-[9px] sm:text-[13px] md:text-[15px] font-bold whitespace-nowrap leading-none block pt-0.5" style={{ color: '#030712' }}>
            {data.rightPriceBox || "২৯৯ টাকা"}
          </span>
        </div>
      </div>
    </div>
  );
};
