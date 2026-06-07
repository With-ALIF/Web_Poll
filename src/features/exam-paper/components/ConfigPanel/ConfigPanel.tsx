/* src/features/exam-paper/components/ConfigPanel/ConfigPanel.tsx */
import React from 'react';
import { Settings2 } from 'lucide-react';
import { ExamPaperSettings } from '../../types';
import { WatermarkSettings } from './WatermarkSettings';
import { GeneralSettings } from './GeneralSettings';
import { BrandingSettings } from './BrandingSettings';

interface Props {
  settings: ExamPaperSettings;
  setSettings: React.Dispatch<React.SetStateAction<ExamPaperSettings>>;
  onClear: () => void;
  hasPaper: boolean;
  onSetChange: (val: string) => void;
}

export const ConfigPanel: React.FC<Props> = ({ settings, setSettings, onClear, hasPaper, onSetChange }) => {
  const update = (key: keyof ExamPaperSettings, val: any) => setSettings(prev => ({ ...prev, [key]: val }));

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center gap-2 font-bold text-slate-700 pb-2 border-b">
        <Settings2 size={18} /> Configuration
      </div>
      <GeneralSettings settings={settings} update={update} onSetChange={onSetChange} />
      <BrandingSettings settings={settings} update={update} />
      <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl">
        <label className="flex items-center gap-3 text-sm font-semibold cursor-pointer">
          <input type="checkbox" checked={settings.includeExplanation} onChange={(e) => update('includeExplanation', e.target.checked)} className="w-4 h-4" />
          Explanations
        </label>
        {hasPaper && <button onClick={onClear} className="text-xs font-bold text-red-500">Clear</button>}
      </div>
      <WatermarkSettings settings={settings} setSettings={setSettings} />
    </div>
  );
};
