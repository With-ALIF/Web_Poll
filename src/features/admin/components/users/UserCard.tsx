import React from 'react';
import { motion } from 'motion/react';
import { Shield, User as UserIcon, BarChart3, Send } from 'lucide-react';
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
  return (
    <motion.div 
      layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col relative"
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
          <UserMenu 
            userId={user.id} 
            activeMenuId={activeMenuId} 
            setActiveMenuId={setActiveMenuId} 
            onManageAccess={() => onManageAccess(user)} 
            onDelete={() => onDelete(user.id)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-col">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-tight">Generated</span>
            </div>
            <div className="text-xl font-black text-indigo-900">{user.stats?.generated || 0}</div>
          </div>
          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex flex-col">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <Send className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-tight">Sent</span>
            </div>
            <div className="text-xl font-black text-emerald-900">{user.stats?.sent || 0}</div>
          </div>
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

    </motion.div>
  );
};
