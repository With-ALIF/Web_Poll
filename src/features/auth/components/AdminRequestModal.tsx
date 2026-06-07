import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Send, X } from 'lucide-react';
import { Admin } from '../types';

interface AdminRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAdmin: Admin | null;
  form: { name: string; telegramUsername: string; purpose: string };
  setForm: (form: any) => void;
}

export default function AdminRequestModal({ isOpen, onClose, selectedAdmin, form, setForm }: AdminRequestModalProps) {
  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    const msg = `Hello Sir,\nI would like to request an account for TeleQuiz.\n\n   Name: ${form.name}\n   Telegram Username: @${form.telegramUsername.replace('@', '')}\n   Purpose: ${form.purpose}\n\nKindly review my request and create an account if approved.\nThank you`;
    window.open(`https://t.me/${selectedAdmin.username}?text=${encodeURIComponent(msg)}`, '_blank');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-6">
              <Header selectedAdmin={selectedAdmin} onClose={onClose} />
              <form onSubmit={handleSendRequest} className="space-y-4">
                <FormInput label="Full Name" value={form.name} onChange={(v) => setForm({...form, name: v})} placeholder="Your real name" />
                <FormInput label="Your Telegram Username" value={form.telegramUsername} onChange={(v) => setForm({...form, telegramUsername: v})} placeholder="e.g. username" />
                <FormTextArea label="Purpose" value={form.purpose} onChange={(v) => setForm({...form, purpose: v})} placeholder="Why do you need an account?" />
                <SubmitButton />
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Header({ selectedAdmin, onClose }: any) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm flex-shrink-0">
          {selectedAdmin?.logo ? <img src={selectedAdmin.logo} alt={selectedAdmin.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <div className="w-full h-full bg-blue-50 flex items-center justify-center"><User className="w-6 h-6 text-blue-600" /></div>}
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-800 leading-none mb-1">Request Access</h3>
          <p className="text-xs text-slate-500 font-medium">To @{selectedAdmin?.username}</p>
        </div>
      </div>
      <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors group"><X className="w-5 h-5 text-slate-400 group-hover:text-red-500" /></button>
    </div>
  );
}

function FormInput({ label, value, onChange, placeholder }: any) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">{label}</label>
      <input type="text" required value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium" />
    </div>
  );
}

function FormTextArea({ label, value, onChange, placeholder }: any) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">{label}</label>
      <textarea required value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none font-medium" />
    </div>
  );
}

function SubmitButton() {
  return (
    <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 transition-all mt-4">
      <Send className="w-4 h-4" /> Send Message in Telegram
    </button>
  );
}
