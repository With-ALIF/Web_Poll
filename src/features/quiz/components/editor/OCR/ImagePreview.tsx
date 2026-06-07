import React from 'react';
import { X } from 'lucide-react';

interface ImagePreviewProps {
  image: string;
  onClear: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ image, onClear }) => {
  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-100 h-72 group">
      <img 
        src={image} 
        alt="Selected" 
        className="w-full h-full object-contain"
      />
      <button 
        onClick={onClear}
        className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all active:scale-95"
        title="Remove Image"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
