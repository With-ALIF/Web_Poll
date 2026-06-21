import React from 'react';
import { Search, FileDown } from 'lucide-react';

interface UserSearchProps {
  value: string;
  onChange: (value: string) => void;
  onDownloadPDF: () => void;
  isDownloading?: boolean;
  selectedCount?: number;
}

export const UserSearch: React.FC<UserSearchProps> = ({ 
  value, 
  onChange, 
  onDownloadPDF, 
  isDownloading,
  selectedCount = 0
}) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">User Directory</h2>
        <p className="text-xs text-slate-500 mt-0.5">Manage users, adjust access permissions, and generate analytical PDF reports.</p>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
        <div className="relative flex-1 sm:flex-none">
          <Search className="w-4.5 h-4.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name/email..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-9.5 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-72 shadow-inner transition-all placeholder:text-slate-400 font-medium"
          />
        </div>
        <button
          onClick={onDownloadPDF}
          disabled={isDownloading}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap shadow-sm hover:shadow-md cursor-pointer ${
            selectedCount > 0 
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-500/10'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-500/10'
          }`}
        >
          <FileDown className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
          {isDownloading 
            ? 'Generating Report...' 
            : selectedCount > 0 
              ? `Download Selected PDF (${selectedCount})` 
              : 'Export All to PDF'}
        </button>
      </div>
    </div>
  );
};
