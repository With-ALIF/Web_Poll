import React, { useState } from 'react';
import { AVAILABLE_PAGES } from '../../constants';

interface CreateUserFormProps {
  onSubmit: (data: any) => void;
  loading: boolean;
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({ onSubmit, loading }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = `${username}@gmail.com`;
    onSubmit({ name, email, password, permissions });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" placeholder="Enter user name" required />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
        <div className="relative flex items-center">
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" placeholder="Enter username" required />
            <span className="absolute right-4 text-slate-400 font-medium">@gmail.com</span>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Permissions</label>
        <div className="grid grid-cols-2 gap-2">
          {AVAILABLE_PAGES.map(page => (
            <label key={page.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
              <input type="checkbox" checked={permissions.includes(page.id)} onChange={() => setPermissions(prev => prev.includes(page.id) ? prev.filter(id => id !== page.id) : [...prev, page.id])} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-xs font-medium text-slate-700">{page.name}</span>
            </label>
          ))}
        </div>
      </div>
      <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
        {loading ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
};
