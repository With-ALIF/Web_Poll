import React from 'react';
import { Shield, Check, Copy } from 'lucide-react';

interface CreatedUserSuccessProps {
  user: { email: string; password: string; displayName: string };
  onCopy: (text: string, field: string) => void;
  copiedField: string | null;
  onClose: () => void;
}

export const CreatedUserSuccess: React.FC<CreatedUserSuccessProps> = ({ 
  user, onCopy, copiedField, onClose 
}) => {
  const fields = [
    { label: 'Name', value: user.displayName, id: 'name' },
    { label: 'Email', value: user.email, id: 'email' },
    { label: 'Password', value: user.password, id: 'password', mono: true }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2"><Shield className="w-6 h-6 text-green-600" /></div>
        <p className="text-sm text-slate-600">The user has been created. Please share this information with them.</p>
      </div>
      <div className="space-y-4">
        {fields.map(f => (
          <div key={f.id} className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{f.label}</label>
            <div className="flex gap-2">
              <div className={`flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 ${f.mono ? 'font-mono font-bold tracking-wider text-indigo-700' : 'font-medium'}`}>{f.value}</div>
              <button onClick={() => onCopy(f.value, f.id)} className={`p-2.5 bg-white border rounded-xl transition-all shadow-sm ${copiedField === f.id ? 'text-green-600 border-green-200 bg-green-50' : 'text-slate-500 border-slate-200 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50'}`}>
                {copiedField === f.id ? <Check className="w-[18px] h-[18px]" /> : <Copy className="w-[18px] h-[18px]" />}
              </button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={onClose} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 active:scale-[0.98]">Close</button>
    </div>
  );
};
