import React from 'react';
import { Send, Facebook } from 'lucide-react';
import { PhotoCardData } from '../../types';

interface FooterSectionProps {
  data: PhotoCardData;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ data }) => {
  return (
    <div className="flex justify-between items-center mt-0.5 sm:mt-2 px-2 sm:px-4 pb-1 sm:pb-2">
      {data.telegramName ? (
        <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-3 bg-[#E8E8E8] rounded-full border border-gray-200">
          <div className="w-3 h-3 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <Send className="w-2 h-2 sm:w-3.5 sm:h-3.5 text-white pr-0.5" />
          </div>
          <span className="text-[6px] sm:text-[12px] font-black uppercase" style={{ color: '#111827' }}>{data.telegramName}</span>
        </div>
      ) : <div></div>}
      {data.facebookName ? (
        <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-3 bg-[#E8E8E8] rounded-full border border-gray-200">
          <div className="w-3 h-3 sm:w-6 sm:h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <Facebook className="w-2 h-2 sm:w-3.5 sm:h-3.5 text-white fill-current" />
          </div>
          <span className="text-[6px] sm:text-[12px] font-black uppercase" style={{ color: '#111827' }}>{data.facebookName}</span>
        </div>
      ) : <div></div>}
    </div>
  );
};
