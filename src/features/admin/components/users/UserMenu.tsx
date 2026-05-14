import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Trash2, MoreVertical } from 'lucide-react';

interface UserMenuProps {
  userId: string;
  activeMenuId: string | null;
  setActiveMenuId: (id: string | null) => void;
  onManageAccess: () => void;
  onDelete: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ 
  userId, activeMenuId, setActiveMenuId, onManageAccess, onDelete 
}) => {
  const isOpen = activeMenuId === userId;

  return (
    <div className="relative">
      <button 
        onClick={() => setActiveMenuId(isOpen ? null : userId)}
        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
      >
        <MoreVertical className="w-5 h-5" />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 py-1 overflow-hidden"
            >
              <button 
                onClick={() => { onManageAccess(); setActiveMenuId(null); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Lock className="w-4 h-4 text-amber-500" />
                Manage Access
              </button>
              <div className="h-px bg-slate-100 my-1" />
              <button 
                onClick={() => { onDelete(); setActiveMenuId(null); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete User
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
