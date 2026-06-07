import React, { useState, useRef } from 'react';
import { OCRHeader } from './OCRHeader';
import { ImageUpload } from './ImageUpload';
import { ImagePreview } from './ImagePreview';
import { ActionButtons } from './ActionButtons';

interface OCRQuizInputProps {
  onGenerate: (imageBase64: string, mimeType: string) => Promise<boolean>;
  isGenerating: boolean;
  questionCount: number;
  setQuestionCount: (count: number) => void;
}

export default function OCRQuizInput({
  onGenerate,
  isGenerating,
  questionCount,
  setQuestionCount
}: OCRQuizInputProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setMimeType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (selectedImage) {
      await onGenerate(selectedImage, mimeType);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setMimeType('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <OCRHeader 
        questionCount={questionCount} 
        setQuestionCount={setQuestionCount} 
      />

      {!selectedImage ? (
        <ImageUpload 
          fileInputRef={fileInputRef} 
          onFileChange={handleFileChange} 
        />
      ) : (
        <ImagePreview 
          image={selectedImage} 
          onClear={clearImage} 
        />
      )}

      <ActionButtons 
        onGenerate={handleGenerate} 
        isGenerating={isGenerating} 
        disabled={!selectedImage} 
      />
    </div>
  );
}
