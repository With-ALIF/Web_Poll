import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Trash2, X, ShieldAlert } from 'lucide-react';
import { AdminUser } from '../../types';

interface DeleteConfirmModalProps {
  user: AdminUser;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ 
  user, onClose, onConfirm, loading 
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
      >
        {/* Header decoration */}
        <div className="px-6 py-4 border-b border-red-50 flex justify-between items-center bg-red-50/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-100 text-red-650 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Confirm User Deletion</h3>
          </div>
          <button 
            onClick={onClose} 
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-100 rounded-2xl text-rose-600 shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Are you sure?
              </h2>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                You are about to permanently delete the profile of <strong>{user.displayName || 'Anonymous'}</strong>. All data, settings, and stats records associated with this user will be forever purged and cannot be recovered.
              </p>
            </div>
          </div>

          {/* User Preview Box */}
          <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-slate-600 border-2 border-white shadow-sm">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                user.displayName ? user.displayName.substring(0, 1).toUpperCase() : 'U'
              )}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-slate-800 truncate">{user.displayName || 'Anonymous'}</div>
              <div className="text-xs text-slate-550 truncate font-medium">{user.email}</div>
            </div>
          </div>
          
          <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-2.5 flex items-center gap-2">
            <span>⚠️</span> 
            <span>Warning: This action is irreversible and cannot be undone!</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-rose-100 text-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete User
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
