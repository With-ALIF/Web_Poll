import React, { useState } from 'react';
import { Send, Trash2, Tag } from 'lucide-react';

interface QuizBulkActionsProps {
  totalQuestions: number;
  selectedCount: number;
  isAllSelected: boolean;
  handleSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendSelected: () => void;
  onDraftSelected: () => void;
  handleDeleteSelected: () => void;
  onSetTopic: (topic: string) => void;
}

export default function QuizBulkActions({
  totalQuestions,
  selectedCount,
  isAllSelected,
  handleSelectAll,
  onSendSelected,
  onDraftSelected,
  handleDeleteSelected,
  onSetTopic
}: QuizBulkActionsProps) {
  const [bulkTopic, setBulkTopic] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const onDeleteClick = () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      setTimeout(() => setIsConfirmingDelete(false), 3000);
      return;
    }
    handleDeleteSelected();
    setIsConfirmingDelete(false);
  };

  if (totalQuestions === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/80 backdrop-blur-sm p-3 px-4 rounded-2xl border border-slate-200/60 mb-4 shadow-sm gap-3">
      <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors">
        <input 
          type="checkbox" 
          checked={isAllSelected && totalQuestions > 0}
          onChange={handleSelectAll}
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        Select All
      </label>
      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 flex-1 sm:flex-none">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Topic..."
              value={bulkTopic}
              onChange={(e) => setBulkTopic(e.target.value)}
              className="bg-transparent text-sm outline-none w-24 flex-1"
            />
            <button
              onClick={() => {
                onSetTopic(bulkTopic);
                setBulkTopic('');
              }}
              disabled={!bulkTopic.trim()}
              className="text-xs font-semibold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-2 py-1 rounded disabled:opacity-50"
            >
              Set
            </button>
          </div>
          <button 
            onClick={onDraftSelected}
            className="text-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors"
          >
            Draft ({selectedCount})
          </button>
          <button 
            onClick={onSendSelected}
            className="text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-4 h-4" /> Send ({selectedCount})
          </button>
          {isConfirmingDelete ? (
            <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-100 shadow-sm">
              <span className="text-xs font-bold text-red-700 px-2">Delete {selectedCount}?</span>
              <button 
                onClick={() => setIsConfirmingDelete(false)}
                className="text-xs font-bold text-slate-600 hover:bg-white px-2 py-1 rounded transition-colors"
              >
                No
              </button>
              <button 
                onClick={() => {
                  handleDeleteSelected();
                  setIsConfirmingDelete(false);
                }}
                className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded transition-colors shadow-sm"
              >
                Yes
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsConfirmingDelete(true)}
              className="text-sm px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" /> Delete ({selectedCount})
            </button>
          )}
        </div>
      )}
    </div>
  );
}
