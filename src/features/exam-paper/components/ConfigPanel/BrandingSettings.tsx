/* src/features/exam-paper/components/ConfigPanel/BrandingSettings.tsx */
import React from 'react';
import { ExamPaperSettings } from '../../types';

interface Props {
  settings: ExamPaperSettings;
  update: (key: keyof ExamPaperSettings, val: any) => void;
}

export const BrandingSettings: React.FC<Props> = ({ settings, update }) => {
  return (
    <>
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase">Exam Title</label>
        <input type="text" value={settings.title} onChange={(e) => update('title', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase">Exam Subtitle</label>
        <input type="text" value={settings.subtitle} onChange={(e) => update('subtitle', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
      </div>
    </>
  );
};
