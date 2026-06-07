import React from 'react';
import { Trash2, Send, CheckSquare, Square, FileSpreadsheet } from 'lucide-react';

interface DraftToolbarProps {
  selectedCount: number;
  totalCount: number;
  onDeleteSelected: () => void;
  onSendSelected: () => void;
  onDownloadCsv: () => void;
  onToggleSelectAll: () => void;
  isAllSelected: boolean;
}

export default function DraftToolbar({
  selectedCount,
  totalCount,
  onDeleteSelected,
  onSendSelected,
  onDownloadCsv,
  onToggleSelectAll,
  isAllSelected
}: DraftToolbarProps) {
  if (totalCount === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
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
      </div>

      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
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
