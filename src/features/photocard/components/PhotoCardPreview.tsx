import React from 'react';
import { PhotoCardData } from '../types';
import { HeaderSection } from './preview/HeaderSection';
import { QuestionSection } from './preview/QuestionSection';
import { OptionsGrid } from './preview/OptionsGrid';
import { MarketingSection } from './preview/MarketingSection';
import { FooterSection } from './preview/FooterSection';
import { SUBJECT_BG_COLOR_MAP, DEFAULT_BG_COLOR } from '../constants';

interface PhotoCardPreviewProps {
  data: PhotoCardData;
}

const PhotoCardPreview: React.FC<PhotoCardPreviewProps> = ({ data }) => {
  const bgColor = SUBJECT_BG_COLOR_MAP[data.subject] || DEFAULT_BG_COLOR;

  return (
    <div className="flex flex-col items-center w-full">
      <div 
        id="photocard-preview"
        className="w-full aspect-square max-w-[600px] p-2 sm:p-5 md:p-6 flex flex-col relative shadow-xl"
        style={{ 
          fontFamily: "'Hind Siliguri', sans-serif",
          backgroundColor: data.backgroundColor || bgColor 
        }}
      >
        <HeaderSection data={data} />
        <QuestionSection data={data} />
        <OptionsGrid data={data} />
        {data.showMarketing === true && <MarketingSection data={data} />}
        <FooterSection data={data} />
      </div>
    </div>
  );
};

export default PhotoCardPreview;
