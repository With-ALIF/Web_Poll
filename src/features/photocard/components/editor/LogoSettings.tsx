import React from 'react';
import { ChevronDown, Image as ImageIcon, Upload } from 'lucide-react';
import { EditorProps } from './types';

export const LogoSettings: React.FC<EditorProps> = ({ data, onChange }) => {
  const [isCustomMode, setIsCustomMode] = React.useState(false);
  
  const presets = [
    "https://raw.githubusercontent.com/alif982/sot/main/channel/sot.jpg",
    "https://raw.githubusercontent.com/alif982/sot/main/channel/sot_academy.jpg"
  ];

  const isPreset = presets.includes(data.logoUrl || "");

  // Sync custom mode state when logo changes externally
  React.useEffect(() => {
    if (data.logoUrl && !isPreset) {
      setIsCustomMode(true);
    } else if (isPreset || !data.logoUrl) {
      setIsCustomMode(false);
    }
  }, [data.logoUrl, isPreset]);
  
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1.5 px-1">
        <ImageIcon size={10} className="text-blue-500" />
        লোগো নির্বাচন
      </label>
      <div className="relative group mb-2">
        <select 
          value={isCustomMode ? "other" : (data.logoUrl || "")}
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'other') {
              setIsCustomMode(true);
              // Don't clear immediately, let user upload
            } else {
              setIsCustomMode(false);
              onChange({...data, logoUrl: val});
            }
          }}
          className="w-full bg-white border border-gray-100 rounded-xl px-4 pr-10 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer appearance-none shadow-sm"
        >
          <option value="">লোগো নেই (No Logo)</option>
          <option value="https://raw.githubusercontent.com/alif982/sot/main/channel/sot.jpg">STUDY ON TELEGRAM</option>
          <option value="https://raw.githubusercontent.com/alif982/sot/main/channel/sot_academy.jpg">SOT ACADEMY</option>
          <option value="other">অন্যান্য (Upload Logo)</option>
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {(isCustomMode) && (
        <div className="space-y-2 animate-in fade-in zoom-in duration-200">
          <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1.5 px-1">
            <Upload size={10} className="text-blue-500" />
            কাস্টম লোগো আপলোড
          </label>
          <input 
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  if (event.target?.result) {
                    onChange({ ...data, logoUrl: event.target.result as string });
                  }
                };
                reader.readAsDataURL(file);
              }
            }}
            className="w-full file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer text-[10px] transition-all bg-blue-50/50 p-2 rounded-2xl border border-blue-100"
          />
        </div>
      )}
    </div>
  );
};
