import React from 'react';
import { CheckCircle, AlertTriangle, Check, Copy, Download, FileSpreadsheet, Eye } from 'lucide-react';
import { MCQData } from '../types';
import MCQPreviewCard from './MCQPreviewCard';

interface CSVOutputPanelProps {
  csvOutput: string;
  parsedData: MCQData[];
  activeTab: 'csv' | 'preview';
  setActiveTab: (tab: 'csv' | 'preview') => void;
  copied: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onUpdateMCQ: (index: number, updatedItem: MCQData) => void;
  onDeleteMCQ: (index: number) => void;
}

export default function CSVOutputPanel({
  csvOutput,
  parsedData,
  activeTab,
  setActiveTab,
  copied,
  onCopy,
  onDownload,
  onUpdateMCQ,
  onDeleteMCQ
}: CSVOutputPanelProps) {
  if (!csvOutput) {
    return (
      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mb-4">
          <FileSpreadsheet className="w-8 h-8" />
        </div>
        <p className="text-slate-600 font-bold text-sm mb-1">CSV রূপান্তর করার জন্য প্রস্তুত</p>
        <p className="text-slate-400 text-xs max-w-sm">
          বামে HTML কোড পেস্ট করে রূপান্তর বোতামে ক্লিক করুন। রূপান্তর সম্পন্ন হওয়ার পর এখানে পূর্ণাঙ্গ CSV কোড ও ইন্টারেক্টিভ MCQ প্রিভিউ দেখতে পাবেন।
        </p>
      </div>
    );
  }

  const hasMissingAnswers = parsedData.some(row => !row.correct_options);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col min-h-[500px] w-full">
      {/* Header with Stats & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl border border-emerald-100 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-base">পার্স করা সম্পন্ন হয়েছে</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded text-[11px] border border-indigo-100">
                মোট প্রশ্ন: {parsedData.length} টি
              </span>
              {hasMissingAnswers && (
                <span className="bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded text-[11px] border border-rose-100 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> উত্তরবিহীন প্রশ্ন রয়েছে!
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black border transition-all ${
              copied 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:border-slate-300'
            }`}
            id="btn-copy-csv"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'কপি হয়েছে' : 'CSV কপি করুন'}
          </button>
          <button
            onClick={onDownload}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md hover:shadow-indigo-100 transition-all transform hover:-translate-y-0.5"
            id="btn-download-csv"
          >
            <Download className="w-4 h-4" />
            CSV ডাউনলোড করুন
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-100 pb-3 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('csv')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black border-2 transition-all whitespace-nowrap ${
            activeTab === 'csv'
              ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="tab-csv-raw"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Raw CSV টেক্সট
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black border-2 transition-all whitespace-nowrap ${
            activeTab === 'preview'
              ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="tab-csv-preview"
        >
          <Eye className="w-4 h-4" />
          MCQ কার্ড প্রিভিউ
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 flex flex-col">
        {activeTab === 'csv' && (
          <div className="flex-1 flex flex-col bg-slate-900 border border-slate-950 rounded-xl overflow-hidden p-3 min-h-[350px]">
            <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-800 mb-2">
              <span className="text-[10px] font-mono font-bold text-slate-500 tracking-wider uppercase">output.csv</span>
              <span className="text-[10px] font-mono text-indigo-400">RFC 4180 Format</span>
            </div>
            <textarea
              readOnly
              value={csvOutput}
              className="w-full flex-1 bg-transparent text-indigo-200 font-mono text-[11px] focus:outline-none resize-none leading-relaxed overflow-auto min-h-[300px] p-2"
              id="textarea-csv-output"
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
            {parsedData.map((item, index) => (
              <MCQPreviewCard 
                key={index} 
                item={item} 
                index={index} 
                onUpdate={onUpdateMCQ} 
                onDelete={onDeleteMCQ} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
