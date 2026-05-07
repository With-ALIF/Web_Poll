import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, User as UserIcon, X, KeyRound } from 'lucide-react';
import { AdminUser } from '../../types';
import { AVAILABLE_PAGES } from '../../constants';
import { UserMenu } from './UserMenu';

interface UserCardProps {
  user: AdminUser;
  activeMenuId: string | null;
  setActiveMenuId: (id: string | null) => void;
  onManageAccess: (user: AdminUser) => void;
  onDelete: (userId: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ 
  user, activeMenuId, setActiveMenuId, onManageAccess, onDelete 
}) => {
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, newPassword })
      });
      if (response.ok) {
        alert('Password updated successfully');
        setShowResetModal(false);
        setNewPassword('');
      } else {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          errorMessage = errorData.details || errorData.error || errorMessage;
        } catch (e) {
          const text = await response.text();
          errorMessage = text || response.statusText;
        }
        alert('Failed to reset password: ' + errorMessage);
      }
    } catch (error) {
      alert('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
    >
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
              {user.photoURL ? <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <UserIcon className="w-7 h-7 text-slate-400" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg leading-tight">{user.displayName || 'Anonymous'}</h3>
              <p className="text-slate-500 text-xs font-medium">{user.email}</p>
            </div>
          </div>
          <UserMenu userId={user.id} activeMenuId={activeMenuId} setActiveMenuId={setActiveMenuId} onManageAccess={() => onManageAccess(user)} onResetPassword={() => setShowResetModal(true)} onDelete={() => onDelete(user.id)} />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm"><Shield className="w-4 h-4 text-indigo-500" />Assigned Features</div>
          <div className="flex flex-wrap gap-2">
            {user.permissions?.length > 0 ? user.permissions.map(perm => {
              const page = AVAILABLE_PAGES.find(p => p.id === perm);
              return <span key={perm} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full border border-indigo-100">{page ? page.name : perm}</span>;
            }) : <span className="text-slate-400 text-xs italic">Only Home Access</span>}
          </div>
        </div>
      </div>
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined {user.createdAt?.seconds ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>{user.role || 'user'}</span>
      </div>

      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2"><KeyRound className="w-5 h-5 text-indigo-500" />Reset Password</h3>
              <button onClick={() => setShowResetModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" className="w-full px-4 py-2 border border-slate-200 rounded-xl mb-4" />
            <button onClick={handleResetPassword} disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-2 rounded-xl">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
