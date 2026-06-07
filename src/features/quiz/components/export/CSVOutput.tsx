import React from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface CSVOutputProps {
  modifiedCsv: string;
  onCopy: () => void;
  onDownload: () => void;
  copied: boolean;
}

export default function CSVOutput({ modifiedCsv, onCopy, onDownload, copied }: CSVOutputProps) {
  if (!modifiedCsv) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-4 sm:p-8 border border-slate-200 rounded-2xl sm:rounded-3xl"
    >
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Modified Result</h3>
        <button
          onClick={onCopy}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-all"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={onDownload}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm"
        >
          <Download className="w-4 h-4" />
          Download CSV
        </button>
      </div>
      <textarea
        readOnly
        value={modifiedCsv}
        className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none resize-none text-slate-800 text-sm font-mono"
      />
    </motion.div>
  );
}
