import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KeyRound, X, AlertTriangle } from 'lucide-react';
import { AdminUser } from '../../types';

interface ResetPasswordModalProps {
  user: AdminUser;
  onClose: () => void;
  onConfirm: (password: string) => Promise<boolean>;
  loading: boolean;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ user, onClose, onConfirm, loading }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    const success = await onConfirm(password);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Reset Password</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-sm font-medium text-slate-700 mb-2">
              Set new password for <span className="font-bold">{user.email}</span>
            </p>
            <input
              type="text"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter new password"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-800"
              required
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div className="flex bg-amber-50 border border-amber-200/60 rounded-xl p-3 mb-6">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 mr-2" />
            <p className="text-xs text-amber-800">
              The user's password will be changed immediately without any verification required.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 font-bold rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 font-bold rounded-xl text-white bg-amber-500 hover:bg-amber-600 shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
