import React from 'react';
import { PhotoCardData } from '../types';
import { LogoSettings } from './editor/LogoSettings';
import { HeaderTitleSettings } from './editor/HeaderTitleSettings';
import { SubjectChapterSettings } from './editor/SubjectChapterSettings';
import { QuestionSettings } from './editor/QuestionSettings';
import { OptionsSettings } from './editor/OptionsSettings';
import { MarketingSettings } from './editor/MarketingSettings';
import { SocialSettings } from './editor/SocialSettings';
import { BackgroundSettings } from './editor/BackgroundSettings';

interface PhotoCardEditorProps {
  data: PhotoCardData;
  onChange: (newData: PhotoCardData) => void;
}

const PhotoCardEditor: React.FC<PhotoCardEditorProps> = ({ data, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('opt-')) {
      const optionKey = name.split('-')[1];
      onChange({
        ...data,
        options: {
          ...data.options,
          [optionKey]: value
        }
      });
    } else {
      onChange({
        ...data,
        [name]: value
      });
    }
  };

  const editorProps = { data, onChange, handleChange };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6 overflow-y-auto max-h-[85vh]">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-gray-950">ফ্ল্যাশকার্ড এডিটর</h2>
      </div>

      <div className="space-y-8">
        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] px-1 border-b border-blue-100 pb-2 mb-4">Header Settings</h3>
          <LogoSettings {...editorProps} />
          <HeaderTitleSettings {...editorProps} />
        </div>

        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-gray-950 uppercase tracking-[0.2em] px-1 border-b border-gray-100 pb-2 mb-4">Question & Options</h3>
          <SubjectChapterSettings {...editorProps} />
          <QuestionSettings {...editorProps} />
          <OptionsSettings {...editorProps} />
          <BackgroundSettings {...editorProps} />
        </div>

        <div className="space-y-8">
          <MarketingSettings {...editorProps} />
          <SocialSettings {...editorProps} />
        </div>
      </div>
    </div>
  );
};

export default PhotoCardEditor;
