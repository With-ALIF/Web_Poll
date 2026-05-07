import React from 'react';
import { motion } from 'motion/react';
import { X, Lock } from 'lucide-react';
import { AdminUser } from '../../types';
import { AVAILABLE_PAGES } from '../../constants';

interface PermissionModalProps {
  user: AdminUser;
  permissions: string[];
  onToggle: (id: string) => void;
  onSave: () => void;
  onClose: () => void;
  loading: boolean;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({ 
  user, permissions, onToggle, onSave, onClose, loading 
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 rounded-lg"><Lock className="w-4 h-4 text-amber-600" /></div>
            <h3 className="text-lg font-bold text-slate-800">Manage Access</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 flex flex-col flex-1 overflow-hidden gap-6">
          <div className="flex flex-col flex-1 overflow-hidden">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Select accessible pages for {user.displayName}</p>
            <div className="space-y-2 overflow-y-auto flex-1 pr-2 min-h-0">
              {AVAILABLE_PAGES.map(page => (
                <label key={page.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input type="checkbox" checked={permissions.includes(page.id)} onChange={() => onToggle(page.id)} className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  <span className="font-medium text-slate-700">{page.name}</span>
                </label>
              ))}
            </div>
          </div>
          <button onClick={onSave} disabled={loading} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 active:scale-[0.98]">
            {loading ? 'Saving...' : 'Save Permissions'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
