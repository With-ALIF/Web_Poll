import React, { useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import CSVInput from './CSVInput';
import CSVProcessor from './CSVProcessor';
import CSVOutput from './CSVOutput';
import ClearButton from '../editor/Clear';

export default function CSVModifier() {
  const [csvText, setCsvText] = useState('');
  const [suffix, setSuffix] = useState('1');
  const [filename, setFilename] = useState('');
  const [modifiedCsv, setModifiedCsv] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleModify = () => {
    setError(null);
    if (!csvText.trim()) {
      setError('Please enter CSV text.');
      return;
    }

    try {
      const sectionValue = suffix.trim() || '1';
      const lines = csvText.split(/\r?\n/);
      const modifiedLines = lines.map((line, index) => {
        const trimmedLine = line.trimEnd();
        if (!trimmedLine) return line;
        
        // Skip header if it looks like one
        if (index === 0 && trimmedLine.toLowerCase().includes('questions')) {
          return trimmedLine;
        }

        // Find the last two positions to update type and section
        const lastCommaIndex = trimmedLine.lastIndexOf(',');
        if (lastCommaIndex === -1) return trimmedLine;

        const secondToLastCommaIndex = trimmedLine.substring(0, lastCommaIndex).lastIndexOf(',');
        
        let qType: any = 1;
        let qSection: any = sectionValue;

        if (sectionValue.toLowerCase() === 'bm' || sectionValue.toLowerCase() === 'm') {
          qType = sectionValue;
          qSection = '';
        }

        const escapeVal = (val: any) => {
          if (val === '') return '';
          return isNaN(Number(val)) ? `"${String(val).replace(/"/g, '""')}"` : val;
        };

        if (secondToLastCommaIndex === -1) {
          const prefix = trimmedLine.substring(0, lastCommaIndex);
          return prefix + ',' + escapeVal(qSection);
        }

        const prefix = trimmedLine.substring(0, secondToLastCommaIndex);
        return `${prefix},${escapeVal(qType)},${escapeVal(qSection)}`;
      });

      setModifiedCsv(modifiedLines.join('\r\n'));
    } catch (err) {
      setError('Error processing CSV. Please check the format.');
      console.error(err);
    }
  };

  const handleDownload = () => {
    if (!modifiedCsv) return;
    const blob = new Blob(['\uFEFF' + modifiedCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    const finalFilename = filename.trim() 
      ? `${filename.trim().replace(/\s+/g, '_')}.csv` 
      : `modified_export_${Math.floor(Date.now() / 1000)}.csv`;
      
    link.setAttribute('download', finalFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = () => {
    if (!modifiedCsv) return;
    navigator.clipboard.writeText(modifiedCsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full p-4 sm:p-6 space-y-8 sm:space-y-12">
      <div className="space-y-6 sm:space-y-8 p-4 sm:p-8 border border-slate-200 rounded-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 p-2 rounded-xl">
              <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">CSV Suffix Modifier</h2>
          </div>
          {csvText && (
            <ClearButton onClick={() => setCsvText('')} />
          )}
        </div>

        <div className="space-y-6">
          <CSVInput csvText={csvText} setCsvText={setCsvText} />
          
          <CSVProcessor 
            suffix={suffix} 
            setSuffix={setSuffix} 
            filename={filename}
            setFilename={setFilename}
            onModify={handleModify} 
            error={error} 
          />
        </div>
      </div>

      <CSVOutput 
        modifiedCsv={modifiedCsv} 
        onCopy={handleCopy} 
        onDownload={handleDownload} 
        copied={copied} 
      />
    </div>
  );
}
