import React from 'react';
import { AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface CSVProcessorProps {
  suffix: string;
  setSuffix: (suffix: string) => void;
  filename: string;
  setFilename: (filename: string) => void;
  onModify: () => void;
  error: string | null;
}

export default function CSVProcessor({ suffix, setSuffix, filename, setFilename, onModify, error }: CSVProcessorProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">New Suffix (Section)</label>
            <input
              type="text"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              placeholder="e.g. p, c, b, m"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">File Name (Optional)</label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter filename"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
        <button
          onClick={onModify}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-200 shadow-sm"
        >
          Modify CSV
        </button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 text-sm border border-red-100"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </motion.div>
      )}
    </div>
  );
}
