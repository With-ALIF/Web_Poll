/* src/features/exam-paper/components/ExamPaperRenderer.tsx */
import React, { useRef, useMemo } from 'react';
import { ExamPaper } from '../types';
import { motion } from 'motion/react';
import { Download, Loader2 } from 'lucide-react';
import { Header, Footer, Watermark, QuestionItem } from './';
import { usePDFExport } from '../hooks/usePDFExport';
import { paginateMCQs } from '../utils/paginateMCQ';
import '../styles/printStyles.css';

interface ExamPaperRendererProps {
  paper: ExamPaper;
  includeExplanation: boolean;
  questionsPerPage: number;
  showTime: boolean;
  showMarks: boolean;
  watermark?: any;
}

export default function ExamPaperRenderer({ paper, includeExplanation, questionsPerPage, showTime, showMarks, watermark }: ExamPaperRendererProps) {
  const paperRef = useRef<HTMLDivElement>(null);
  const { downloadPDF, isDownloading } = usePDFExport(paperRef, paper.meta.title);
  
  const mcqPages = useMemo(() => 
    paginateMCQs(paper.questions || [], questionsPerPage),
    [paper.questions, questionsPerPage]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end gap-3 no-print">
        <button onClick={downloadPDF} disabled={isDownloading} className="flex items-center gap-2 px-6 py-2.5 bg-[#2C4B9B] text-white rounded-xl font-semibold hover:bg-[#1e3675] shadow-lg disabled:opacity-50">
          {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          Download PDF
        </button>
      </div>

      <div className="w-full overflow-x-auto pb-8 no-print -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        <motion.div ref={paperRef} data-paper-content="true" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-[210mm] min-w-[210mm] mx-auto space-y-4 print:space-y-0 text-[13px] font-bengali">
          {mcqPages.map((page, pageIdx) => (
            <div key={pageIdx} className="paper-page bg-white p-[20mm] pb-[25mm] shadow-xl relative flex flex-col">
              <Watermark watermark={watermark} />
              {pageIdx === 0 && <Header meta={paper.meta} showTime={showTime} showMarks={showMarks} />}
              {pageIdx > 0 && <div className="text-center font-bold mb-3 border-b pb-1 text-sm">{paper.meta.title} (Contd.)</div>}
              <div className="relative z-10 grid grid-cols-2 gap-x-10 paper-grid">
                <div className="absolute left-1/2 top-0 bottom-0 border-l border-black -ml-px vertical-divider"></div>
                <div className="space-y-3 pr-2">{page.left.map(q => <QuestionItem key={q.number} question={q} includeExplanation={includeExplanation} />)}</div>
                <div className="space-y-3 pl-2">{page.right.map(q => <QuestionItem key={q.number} question={q} includeExplanation={includeExplanation} />)}</div>
              </div>
              
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
