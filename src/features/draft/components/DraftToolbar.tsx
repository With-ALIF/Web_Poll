import React, { useState } from 'react';
import { Trash2, Send, CheckSquare, Square, FileSpreadsheet, Tag } from 'lucide-react';
import { QUIZ_TOPICS } from '../../quiz/constants';

interface DraftToolbarProps {
  selectedCount: number;
  totalCount: number;
  onDeleteSelected: () => void;
  onSendSelected: () => void;
  onDownloadCsv: () => void;
  onToggleSelectAll: () => void;
  isAllSelected: boolean;
  onSetTopic?: (topic: string) => void;
}

export default function DraftToolbar({
  selectedCount,
  totalCount,
  onDeleteSelected,
  onSendSelected,
  onDownloadCsv,
  onToggleSelectAll,
  isAllSelected,
  onSetTopic
}: DraftToolbarProps) {
  const [bulkTopic, setBulkTopic] = useState('');

  if (totalCount === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSelectAll}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            {isAllSelected ? (
              <CheckSquare className="w-5 h-5 text-blue-600" />
            ) : (
              <Square className="w-5 h-5" />
            )}
            Select All
          </button>
          {selectedCount > 0 && (
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {selectedCount} Selected
            </span>
          )}
        </div>

        {selectedCount > 0 && onSetTopic && (
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 w-full sm:w-auto">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={bulkTopic}
              onChange={(e) => setBulkTopic(e.target.value)}
              className="bg-transparent text-sm outline-none w-32 flex-1 cursor-pointer font-semibold text-slate-700"
            >
              <option value="">Set Topic...</option>
              {QUIZ_TOPICS.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
            <button
              onClick={() => {
                if (bulkTopic) {
                  onSetTopic(bulkTopic);
                  setBulkTopic('');
                }
              }}
              disabled={!bulkTopic}
              className="text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1 rounded-md disabled:opacity-50 transition-all shadow-sm shadow-indigo-100"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 mt-4">
          <button
            onClick={onSendSelected}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Send className="w-4 h-4" />
            Send Selected
          </button>
          <button
            onClick={onDownloadCsv}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Download CSV
          </button>
          <button
            onClick={onDeleteSelected}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-100 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected
          </button>
        </div>
      )}
    </div>
  );
}
