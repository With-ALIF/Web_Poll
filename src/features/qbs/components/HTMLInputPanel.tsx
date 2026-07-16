import React, { useState, useRef } from 'react';
import { Code, Trash2, Upload, Play } from 'lucide-react';

interface HTMLInputPanelProps {
  htmlInput: string;
  setHtmlInput: (val: string) => void;
  onConvert: () => void;
  onClear: () => void;
}

export default function HTMLInputPanel({
  htmlInput,
  setHtmlInput,
  onConvert,
  onClear
}: HTMLInputPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setHtmlInput(text);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === 'text/html' || file.name.endsWith('.html') || file.name.endsWith('.txt'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setHtmlInput(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col flex-1 min-h-[500px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-indigo-600" />
          <h2 className="font-bold text-slate-800 text-base">HTML সোর্স কোড ইনপুট</h2>
        </div>
        {htmlInput && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-red-500 hover:text-red-600 text-xs font-bold transition-all"
            id="btn-clear"
          >
            <Trash2 className="w-4 h-4" />
            মুছে ফেলুন
          </button>
        )}
      </div>

      {/* Separate File Upload System */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-5 mb-5 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group ${
          isDragging 
            ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99] shadow-inner' 
            : 'border-slate-200 bg-slate-50/60 hover:bg-indigo-50/20 hover:border-indigo-300 hover:shadow-sm'
        }`}
      >
        <Upload className={`w-7 h-7 mb-2 text-indigo-500 transition-transform duration-200 group-hover:scale-110 ${isDragging ? 'animate-bounce' : ''}`} />
        <p className="text-slate-700 font-bold text-xs mb-0.5">HTML ফাইল ড্র্যাগ অ্যান্ড ড্রপ করুন অথবা ক্লিক করুন</p>
        <p className="text-slate-400 text-[10px] font-medium">সমর্থিত ফরম্যাট: .html, .txt</p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".html,.txt"
          className="hidden"
        />
      </div>

      {/* Separate Text Box with Beautiful Borders */}
      <div className="flex-1 flex flex-col relative">
        <textarea
          value={htmlInput}
          onChange={(e) => setHtmlInput(e.target.value)}
          placeholder="অথবা এখানে সরাসরি HTML সোর্স কোড পেস্ট করুন..."
          className="w-full flex-1 p-4 resize-none border-2 border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 rounded-xl focus:outline-none text-slate-700 font-mono text-xs bg-slate-50/30 hover:bg-white focus:bg-white transition-all leading-relaxed min-h-[300px] shadow-sm focus:shadow-indigo-50"
          id="textarea-html-input"
        />
      </div>

      <button
        onClick={onConvert}
        disabled={!htmlInput.trim()}
        className={`w-full mt-4 py-4 flex items-center justify-center gap-2 rounded-xl text-sm font-black transition-all shadow-md ${
          htmlInput.trim()
            ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-100 text-white transform hover:-translate-y-0.5'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
        }`}
        id="btn-convert"
      >
        <Play className="w-4 h-4 fill-current" />
        MCQ নিষ্কাশন এবং CSV রূপান্তর করুন
      </button>
    </div>
  );
}
