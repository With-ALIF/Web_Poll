/* src/features/exam-paper/components/ConfigPanel/WatermarkSettings.tsx */
import React from 'react';
import { ExamPaperSettings } from '../../types';

interface WatermarkSettingsProps {
  settings: ExamPaperSettings;
  setSettings: React.Dispatch<React.SetStateAction<ExamPaperSettings>>;
}

export const WatermarkSettings: React.FC<WatermarkSettingsProps> = ({ settings, setSettings }) => {
  const updateWatermark = (updates: any) => {
    setSettings({ ...settings, watermark: { ...settings.watermark, ...updates } });
  };

  return (
    <div className="space-y-4 pt-2 border-t border-slate-100">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Watermark</label>
        <button 
          onClick={() => updateWatermark({ enabled: !settings.watermark.enabled })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.watermark.enabled ? 'bg-blue-600' : 'bg-slate-200'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.watermark.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      {settings.watermark.enabled && (
        <div className="space-y-3 p-3 bg-slate-50 rounded-xl animate-in fade-in slide-in-from-top-1">
          <div className="flex gap-2">
            {['text', 'image'].map(type => (
              <button key={type} onClick={() => updateWatermark({ type })} className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${settings.watermark.type === type ? 'bg-white border-blue-200 text-blue-600 shadow-sm' : 'border-transparent text-slate-500'}`}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <input 
            type="text"
            value={settings.watermark.type === 'text' ? settings.watermark.text : settings.watermark.imageUrl}
            onChange={(e) => updateWatermark(settings.watermark.type === 'text' ? { text: e.target.value } : { imageUrl: e.target.value })}
            placeholder={settings.watermark.type === 'text' ? "Enter watermark text..." : "Enter image URL..."}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
          />
          
          {settings.watermark.type === 'image' && (
            <input 
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    updateWatermark({ imageUrl: reader.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          )}

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
              <span>Opacity</span>
              <span>{Math.round(settings.watermark.opacity * 100)}%</span>
            </div>
            <input 
              type="range" min="0.01" max="0.5" step="0.01"
              value={settings.watermark.opacity}
              onChange={(e) => updateWatermark({ opacity: parseFloat(e.target.value) })}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      )}
    </div>
  );
};
