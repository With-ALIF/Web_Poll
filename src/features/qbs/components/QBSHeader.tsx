import React from 'react';
import { Database } from 'lucide-react';

export default function QBSHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-200">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
          <Database className="w-6 h-6 text-indigo-600 animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">QBS HTML to MCQ CSV Converter</h1>
          <p className="text-slate-500 font-medium text-sm">বাংলা MCQ সমৃদ্ধ HTML সোর্স কোড থেকে নির্ভুল এবং ইনস্ট্যান্ট CSV জেনারেটর</p>
        </div>
      </div>
    </div>
  );
}
