import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, UserPlus } from 'lucide-react';
import { CreateUserForm } from './CreateUserForm';
import { CreatedUserSuccess } from './CreatedUserSuccess';

interface CreateUserModalProps {
  onClose: () => void;
  onSubmit: (data: any) => Promise<any>;
  loading: boolean;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ onClose, onSubmit, loading }) => {
  const [createdUser, setCreatedUser] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleFormSubmit = async (data: any) => {
    const user = await onSubmit(data);
    if (user) setCreatedUser(user);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[80vh] flex flex-col overflow-hidden border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 rounded-lg"><UserPlus className="w-4 h-4 text-indigo-600" /></div>
            <h3 className="text-lg font-bold text-slate-800">{createdUser ? 'User Created Successfully' : 'Create New User'}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto">
          {createdUser ? <CreatedUserSuccess user={createdUser} onCopy={handleCopy} copiedField={copiedField} onClose={onClose} /> : <CreateUserForm onSubmit={handleFormSubmit} loading={loading} />}
        </div>
      </motion.div>
    </div>
  );
};
