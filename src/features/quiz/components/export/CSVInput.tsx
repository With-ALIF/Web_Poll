import React from 'react';

interface CSVInputProps {
  csvText: string;
  setCsvText: (text: string) => void;
}

export default function CSVInput({ csvText, setCsvText }: CSVInputProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">Raw CSV Text</label>
      <textarea
        value={csvText}
        onChange={(e) => setCsvText(e.target.value)}
        placeholder="Paste your CSV text here..."
        className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-all text-slate-800 text-sm font-mono"
      />
    </div>
  );
}
