import React, { useState } from 'react';
import { FileSpreadsheet, FileJson, Send } from 'lucide-react';
import { QuizQuestion } from '../../../../types';
import { exportToCSV } from '../../services/csvExportService';
import { exportToJSON } from '../../../../lib/jsonExport';
import { AnimatePresence } from 'motion/react';
import CsvExportModal from './CsvExportModal';

interface QuizExportSectionProps {
  questions: QuizQuestion[];
  selectedCount?: number;
  onSendToTelegram?: () => void;
}

export default function QuizExportSection({ 
  questions, 
  selectedCount = 0,
  onSendToTelegram 
}: QuizExportSectionProps) {
  const [showCsvPrompt, setShowCsvPrompt] = useState(false);
  const [csvSuffix, setCsvSuffix] = useState('1');
  const [filename, setFilename] = useState('');

  if (questions.length === 0) return null;

  const buttonSuffix = selectedCount > 0 ? `Selected (${selectedCount})` : `All (${questions.length})`;

  const handleCsvExport = () => {
    exportToCSV(questions, csvSuffix, filename);
    setShowCsvPrompt(false);
  };

  return (
    <>
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col xl:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">💾 Export Data</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Download your quizzes in CSV or JSON format for external use.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 w-full xl:w-auto">

          <button
            onClick={() => setShowCsvPrompt(true)}
            className="flex-1 sm:flex-none flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 justify-center"
          >
            <FileSpreadsheet className="w-4 h-4" />
            CSV {buttonSuffix}
          </button>
          <button
            onClick={() => exportToJSON(questions)}
            className="flex-1 sm:flex-none flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 justify-center"
          >
            <FileJson className="w-4 h-4" />
            JSON {buttonSuffix}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showCsvPrompt && (
          <CsvExportModal
            csvSuffix={csvSuffix}
            setCsvSuffix={setCsvSuffix}
            filename={filename}
            setFilename={setFilename}
            onClose={() => setShowCsvPrompt(false)}
            onExport={handleCsvExport}
          />
        )}
      </AnimatePresence>
    </>
  );
}
