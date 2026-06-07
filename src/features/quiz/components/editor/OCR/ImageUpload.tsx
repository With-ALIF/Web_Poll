import React from 'react';
import { Camera, Upload } from 'lucide-react';

interface ImageUploadProps {
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ fileInputRef, onFileChange }) => {
  return (
    <div 
      onClick={() => fileInputRef.current?.click()}
      className="w-full h-72 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 hover:bg-slate-100/80 hover:border-blue-400 transition-all cursor-pointer flex flex-col items-center justify-center p-8 text-center group"
    >
      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Camera className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">Take Photo or Upload Image</h3>
      <p className="text-sm text-slate-500 max-w-[240px]">
        Snap a picture of your questions from a book or screen and let AI extract them.
      </p>
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/*"
        className="hidden" 
      />
      <button className="mt-6 px-6 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-700 shadow-sm hover:shadow-md transition-all flex items-center gap-2">
        <Upload className="w-4 h-4" />
        Select Image
      </button>
    </div>
  );
};
