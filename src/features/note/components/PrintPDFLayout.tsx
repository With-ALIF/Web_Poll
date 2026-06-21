import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Note } from '../../../types';

interface PrintPDFLayoutProps {
  activeNote: Note | null;
  userDisplayName: string;
  printRef: React.RefObject<HTMLDivElement | null>;
}

export function PrintPDFLayout({ activeNote, userDisplayName, printRef }: PrintPDFLayoutProps) {
  return (
    <div 
      className="fixed top-0 pointer-events-none z-[-9999]" 
      style={{ left: '-9999px', opacity: 1 }} 
      aria-hidden="true"
    >
      <div 
        ref={printRef} 
        className="p-12 bg-white text-slate-900 w-[794px] flex flex-col justify-between font-sans shadow-none rounded-none"
        style={{ fontFamily: "'Kalpurush', 'Hind Siliguri', 'Inter', sans-serif" }}
      >
        <div>
          <div className="mb-6 bg-slate-50 border border-slate-100/80 rounded-2xl p-6 flex flex-col gap-1.5">
            <span className="text-[10px] text-indigo-600 font-black uppercase tracking-wider">Note Title</span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{activeNote?.title}</h1>
            <div className="flex items-center gap-6 mt-3 pt-3 border-t border-slate-200/50 text-[10px] text-slate-400 font-bold font-mono">
              <div><span>CREATED BY:</span> <span className="text-slate-600">{userDisplayName}</span></div>
              <div><span>DATE:</span> <span className="text-slate-600">{new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
            </div>
          </div>
          <div className="markdown-body text-base leading-relaxed text-slate-800 pr-2">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
              {activeNote?.formattedContent || ''}
            </ReactMarkdown>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-5 mt-12 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">
          <span>Power by TELEQUIZ</span><span>Generated on {new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
