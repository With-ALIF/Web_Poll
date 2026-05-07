import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Plus, X, Upload } from 'lucide-react';
import { QuizQuestion } from '../../../../types';

interface TopicHeaderInputProps {
  onAdd: (header: Omit<QuizQuestion, 'id' | 'status'>) => void;
}

export default function TopicHeaderInput({ onAdd }: TopicHeaderInputProps) {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    if (!image) return;
    onAdd({
      type: 'header',
      question: caption, // Using question field for caption
      options: [],
      correctOptionIndex: -1,
      explanation: '',
      image: image,
    });
    setCaption('');
    setImage(null);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Caption / Header Text
          </label>
        </div>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Enter header text or caption here..."
          rows={3}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Header Image (Required)
        </label>
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`relative aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
            image ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 hover:border-slate-300 bg-slate-50'
          }`}
        >
          {image ? (
            <>
              <img src={image} alt="Preview" className="w-full h-full object-contain rounded-lg" />
              <button 
                onClick={(e) => { e.stopPropagation(); setImage(null); }}
                className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-600 rounded-full shadow-sm hover:bg-white"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-2">
                <Upload className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 font-medium">Click to upload header image</p>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      </div>

      <button
        onClick={handleAdd}
        disabled={!image}
        className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Header Post
      </button>
    </div>
  );
}
