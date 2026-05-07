import React, { useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { QuizQuestion } from '../../../../types';

interface QuizImageUploaderProps {
  editingQuestion: QuizQuestion;
  setEditingQuestion: (q: QuizQuestion) => void;
}

export default function QuizImageUploader({ editingQuestion, setEditingQuestion }: QuizImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingQuestion({
          ...editingQuestion,
          image: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setEditingQuestion({
      ...editingQuestion,
      image: undefined
    });
  };

  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">Image (Optional)</label>
      <div className="flex flex-col gap-2">
        {editingQuestion.image ? (
          <div className="relative inline-block self-start">
            <img 
              src={editingQuestion.image} 
              alt="Question" 
              className="h-32 object-contain rounded-lg border border-slate-200"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-sm"
              title="Remove Image"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={editingQuestion.image || ''}
                onChange={(e) => setEditingQuestion({...editingQuestion, image: e.target.value})}
                placeholder="Paste image URL here..."
                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">OR</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 border border-slate-200 border-dashed rounded-lg text-sm text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors whitespace-nowrap"
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
