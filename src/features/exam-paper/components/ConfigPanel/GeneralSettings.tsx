/* src/features/exam-paper/components/ConfigPanel/GeneralSettings.tsx */
import React from 'react';
import { ExamPaperSettings } from '../../types';

interface Props {
  settings: ExamPaperSettings;
  update: (key: keyof ExamPaperSettings, val: any) => void;
  onSetChange: (val: string) => void;
}

export const GeneralSettings: React.FC<Props> = ({ settings, update, onSetChange }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[
        { label: 'Total MCQs', key: 'totalQuestions', type: 'number' },
        { label: 'Marks', key: 'marks', type: 'text' },
        { label: 'Time', key: 'time', type: 'text' },
      ].map((f) => (
        <div key={f.key} className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">{f.label}</label>
          <input 
            type={f.type} value={(settings as any)[f.key]}
            onChange={(e) => update(f.key as any, f.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#2C4B9B]"
          />
        </div>
      ))}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase">Set</label>
        <select value={settings.set} onChange={(e) => onSetChange(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none">
          {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>Set {s}</option>)}
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase">MCQs/Page</label>
        <select value={settings.questionsPerPage} onChange={(e) => update('questionsPerPage', parseInt(e.target.value))} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none">
          {[6, 8, 10, 12, 14, 16].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-4 col-span-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={settings.showTime} onChange={(e) => update('showTime', e.target.checked)} className="rounded text-[#2C4B9B] focus:ring-[#2C4B9B]" />
          <span className="text-sm">Show Time</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={settings.showMarks} onChange={(e) => update('showMarks', e.target.checked)} className="rounded text-[#2C4B9B] focus:ring-[#2C4B9B]" />
          <span className="text-sm">Show Marks</span>
        </label>
      </div>
    </div>
  );
};
