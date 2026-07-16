import React, { useState } from 'react';
import { MCQData } from '../types';
import { parseHtmlToMcqs, generateCsvFromMcqs } from '../utils/parser';
import QBSHeader from '../components/QBSHeader';
import HTMLInputPanel from '../components/HTMLInputPanel';
import CSVOutputPanel from '../components/CSVOutputPanel';
import DownloadModal from '../components/DownloadModal';

export default function QBSPage() {
  const [htmlInput, setHtmlInput] = useState('');
  const [csvOutput, setCsvOutput] = useState('');
  const [parsedData, setParsedData] = useState<MCQData[]>([]);
  const [activeTab, setActiveTab] = useState<'csv' | 'preview'>('csv');
  const [copied, setCopied] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [fileNameInput, setFileNameInput] = useState('');

  const handleConvert = () => {
    if (!htmlInput.trim()) return;

    try {
      const results = parseHtmlToMcqs(htmlInput);
      setParsedData(results);
      
      const finalCSV = generateCsvFromMcqs(results);
      setCsvOutput(finalCSV);
    } catch (e: any) {
      console.error(e);
      alert('HTML পার্স করতে সমস্যা হয়েছে। দয়া করে ইনপুট চেক করুন।');
    }
  };

  const handleUpdateMCQ = (index: number, updatedItem: MCQData) => {
    const updatedList = [...parsedData];
    updatedList[index] = updatedItem;
    setParsedData(updatedList);
    
    const finalCSV = generateCsvFromMcqs(updatedList);
    setCsvOutput(finalCSV);
  };

  const handleDeleteMCQ = (index: number) => {
    const updatedList = parsedData.filter((_, idx) => idx !== index);
    setParsedData(updatedList);
    
    const finalCSV = generateCsvFromMcqs(updatedList);
    setCsvOutput(finalCSV);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(csvOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const defaultPaper = parsedData.find(item => item.paper_id)?.paper_id;
    const defaultName = defaultPaper ? `qbs_${defaultPaper}` : `qbs_mcq_export_${new Date().getTime()}`;
    setFileNameInput(defaultName);
    setIsDownloadModalOpen(true);
  };

  const triggerDownload = () => {
    if (!fileNameInput.trim()) return;
    
    let finalFileName = fileNameInput.trim();
    if (!finalFileName.toLowerCase().endsWith('.csv')) {
      finalFileName += '.csv';
    }
    
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', finalFileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsDownloadModalOpen(false);
  };

  const clearAll = () => {
    setHtmlInput('');
    setCsvOutput('');
    setParsedData([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Panel */}
      <QBSHeader />

      {/* Main Grid: Input and Output Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Input Panel: HTML Code */}
        <div className="lg:col-span-5 flex flex-col gap-4 h-full">
          <HTMLInputPanel 
            htmlInput={htmlInput}
            setHtmlInput={setHtmlInput}
            onConvert={handleConvert}
            onClear={clearAll}
          />
        </div>

        {/* Right Output Panel: CSV and Previews */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <CSVOutputPanel 
            csvOutput={csvOutput}
            parsedData={parsedData}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            copied={copied}
            onCopy={handleCopy}
            onDownload={handleDownload}
            onUpdateMCQ={handleUpdateMCQ}
            onDeleteMCQ={handleDeleteMCQ}
          />
        </div>
      </div>

      {/* Beautiful File Name Dialog Modal */}
      <DownloadModal 
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        fileNameInput={fileNameInput}
        setFileNameInput={setFileNameInput}
        onConfirm={triggerDownload}
      />
    </div>
  );
}
