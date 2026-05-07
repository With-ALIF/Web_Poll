import React, { useState } from 'react';
import { FileSpreadsheet, FileJson } from 'lucide-react';
import { QuizQuestion } from '../../../../types';
import { exportToCSV } from '../../services/csvExportService';
import { exportToJSON } from '../../../../lib/jsonExport';
import { AnimatePresence } from 'motion/react';
import CsvExportModal from './CsvExportModal';

interface QuizExportSectionProps {
  questions: QuizQuestion[];
  selectedCount?: number;
}

export default function QuizExportSection({ questions, selectedCount = 0 }: QuizExportSectionProps) {
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
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Export Quizzes</h3>
          <p className="text-xs text-slate-500 mt-1">
            {selectedCount > 0 
              ? `Download your ${selectedCount} selected quizzes.` 
              : `Download all ${questions.length} quizzes in the current view.`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowCsvPrompt(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-sm font-medium transition-colors w-full sm:w-auto justify-center"
          >
            <FileSpreadsheet className="w-4 h-4" />
            CSV {buttonSuffix}
          </button>
          <button
            onClick={() => exportToJSON(questions)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-sm font-medium transition-colors w-full sm:w-auto justify-center"
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
