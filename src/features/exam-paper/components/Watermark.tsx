/* src/features/exam-paper/components/Watermark.tsx */
import React from 'react';

interface WatermarkProps {
  watermark?: {
    enabled: boolean;
    type: 'text' | 'image';
    text: string;
    imageUrl: string;
    opacity: number;
  };
}

export const Watermark: React.FC<WatermarkProps> = ({ watermark }) => {
  if (!watermark?.enabled) return null;
  return (
    <div 
      className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 watermark-container"
      style={{ opacity: watermark.opacity }}
    >
      {watermark.type === 'text' ? (
        <div className="text-[80px] font-black uppercase text-black select-none -rotate-[35deg] whitespace-nowrap watermark-text">
          {watermark.text || 'WATERMARK'}
        </div>
      ) : watermark.imageUrl && (
        <img 
          src={watermark.imageUrl} 
          alt="Watermark" 
          className="max-w-[60%] max-h-[60%] object-contain select-none watermark-image"
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
};
