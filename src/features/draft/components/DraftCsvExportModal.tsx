import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileSpreadsheet, X, Download } from 'lucide-react';
import { QuizQuestion } from '../../../types';
import { exportToCSV } from '../../quiz/services/csvExportService';

interface DraftCsvExportModalProps {
  selectedDrafts: QuizQuestion[];
  onClose: () => void;
}

export default function DraftCsvExportModal({ selectedDrafts, onClose }: DraftCsvExportModalProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-CA');  
  const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).replace(/:/g, '-');  
  const [filename, setFilename] = useState(`drafts_export_${dateStr}_${timeStr}`);
  const [csvSuffix, setCsvSuffix] = useState('1');

  const handleExport = () => {
    if (selectedDrafts.length === 0) return;
    exportToCSV(selectedDrafts, csvSuffix, filename);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Export Selected Drafts</h3>
                <p className="text-xs text-slate-500">Download {selectedDrafts.length} polls as CSV</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                File Name
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="Enter filename"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Suffix / Category
              </label>
              <input
                type="text"
                value={csvSuffix}
                onChange={(e) => setCsvSuffix(e.target.value)}
                placeholder="e.g., p, c, bm, m"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
