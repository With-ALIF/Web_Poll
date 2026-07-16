import React from 'react';
import { X, FileSpreadsheet, CheckCircle } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileNameInput: string;
  setFileNameInput: (val: string) => void;
  onConfirm: () => void;
}

export default function DownloadModal({
  isOpen,
  onClose,
  fileNameInput,
  setFileNameInput,
  onConfirm
}: DownloadModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay with blur effect */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 relative z-10 transform scale-100 transition-all duration-300 animate-in fade-in zoom-in-95 duration-150">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          title="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-lg leading-tight">CSV ফাইল সংরক্ষণ করুন</h3>
            <p className="text-slate-400 text-xs font-bold mt-0.5">ডাউনলোড করার আগে ফাইলের নাম নির্ধারণ করুন</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-600 mb-1.5">ফাইলের নাম</label>
            <div className="relative">
              <input
                type="text"
                value={fileNameInput}
                onChange={(e) => setFileNameInput(e.target.value)}
                placeholder="ফাইলের নাম লিখুন..."
                className="w-full pl-3.5 pr-14 py-2.5 border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 rounded-xl focus:outline-none text-sm font-bold text-slate-700 bg-slate-50/50 hover:bg-white focus:bg-white transition-all shadow-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onConfirm();
                  }
                }}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 font-mono">
                .csv
              </span>
            </div>
          </div>
          
          <div className="bg-indigo-50/40 p-3 rounded-xl border border-indigo-100/50">
            <div className="flex items-center gap-2 text-indigo-900 text-xs font-black mb-1">
              <CheckCircle className="w-4 h-4 text-indigo-500" />
              ফাইল ডিরেক্টরি প্রিভিউ:
            </div>
            <p className="text-slate-500 text-[11px] font-mono font-bold truncate">
              {fileNameInput ? (fileNameInput.toLowerCase().endsWith('.csv') ? fileNameInput : `${fileNameInput}.csv`) : 'qbs_mcq_export.csv'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-black transition-all"
          >
            বাতিল করুন
          </button>
          <button
            onClick={onConfirm}
            disabled={!fileNameInput.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md hover:shadow-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ডাউনলোড নিশ্চিত করুন
          </button>
        </div>
      </div>
    </div>
  );
}
