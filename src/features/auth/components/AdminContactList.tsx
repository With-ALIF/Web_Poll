import React from 'react';
import { motion } from 'motion/react';
import { Send, User } from 'lucide-react';
import { ADMINS } from '../constants/admins';
import { Admin } from '../types';

interface AdminContactListProps {
  onAdminClick: (admin: Admin) => void;
  showAdmins: boolean;
  setShowAdmins: (v: boolean) => void;
}

export default function AdminContactList({ onAdminClick, showAdmins, setShowAdmins }: AdminContactListProps) {
  if (!showAdmins) {
    return (
      <button 
        onClick={() => setShowAdmins(true)}
        className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] group"
      >
        <div className="bg-white/20 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
          <User className="w-5 h-5 text-white" />
        </div>
        Connect with Admin
      </button>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
      <div className="flex items-center justify-between px-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select Admin</p>
        <button 
          onClick={() => setShowAdmins(false)}
          className="text-[10px] bg-red-50 px-3 py-1 rounded-full text-red-500 hover:bg-red-100 font-bold uppercase transition-colors border border-red-100"
        >
          Hide
        </button>
      </div>
      {ADMINS.map((admin, idx) => (
        <AdminCard key={idx} admin={admin} idx={idx} onClick={() => onAdminClick(admin)} />
      ))}
    </motion.div>
  );
}

function AdminCard({ admin, idx, onClick }: any) {
  const colors = ['hover:border-blue-400 hover:bg-blue-50/30', 'hover:border-purple-400 hover:bg-purple-50/30', 'hover:border-indigo-400 hover:bg-indigo-50/30'];
  const iconColors = ['bg-blue-100 text-blue-600 border-blue-200', 'bg-purple-100 text-purple-600 border-purple-200', 'bg-indigo-100 text-indigo-600 border-indigo-200'];
  
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl transition-all group hover:shadow-lg ${colors[idx % colors.length]}`}>
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <img 
            src={admin.logo} 
            alt={admin.name} 
            className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-110 transition-transform" 
            referrerPolicy="no-referrer" 
          />
        </div>
        <div className="text-left">
          <div className="text-sm font-black text-slate-800 leading-tight group-hover:text-slate-900">{admin.name}</div>
          <div className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-widest mt-1">@{admin.username}</div>
        </div>
      </div>
      <div className={`p-2.5 rounded-xl border shadow-sm transition-all group-hover:scale-110 ${iconColors[idx % iconColors.length]}`}>
        <Send className="w-4 h-4" />
      </div>
    </button>
  );
}
