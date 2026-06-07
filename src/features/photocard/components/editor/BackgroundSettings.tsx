import React from 'react';
import { EditorProps } from './types';

export const BackgroundSettings: React.FC<EditorProps> = ({ data, handleChange }) => {
  const colors = ["#ffffff", "#f3f4f6", "#fff1f2", "#fff7ed", "#fef9c3", "#ecfdf5", "#eff6ff", "#f5f3ff"];
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-gray-950 uppercase tracking-[0.2em] px-1">Background Color</label>
      <div className="flex flex-wrap gap-2 items-center">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              handleChange({ target: { name: 'backgroundColor', value: c } } as any);
            }}
            className={`w-8 h-8 rounded-full border-2 ${data.backgroundColor === c ? 'border-indigo-600 scale-110' : 'border-slate-200'}`}
            style={{ backgroundColor: c }}
            aria-label={`Select color ${c}`}
          />
        ))}
        <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-slate-200">
             <input
                type="color"
                value={data.backgroundColor || "#ffffff"}
                onChange={(e) => handleChange({ target: { name: 'backgroundColor', value: e.target.value } } as any)}
                className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
             />
        </div>
      </div>
    </div>
  );
};
