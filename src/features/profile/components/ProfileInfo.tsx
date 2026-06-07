import React, { useState } from 'react';
import { Mail, Copy, Check } from 'lucide-react';

interface ProfileInfoProps {
  email: string | null;
  uid: string;
}

export default function ProfileInfo({ email, uid }: ProfileInfoProps) {
  const [copied, setCopied] = useState(false);

  const copyUid = () => {
    if (uid) {
      navigator.clipboard.writeText(uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-xl text-slate-500">
          <Mail className="w-5 h-5" />
          <span className="truncate">{email}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">User ID (UID)</label>
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl text-slate-400 text-xs font-mono border border-slate-100">
          <span className="truncate flex-1">{uid}</span>
          <button onClick={copyUid} className="p-1 hover:bg-slate-200 rounded transition-colors">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">This ID is unique to your account and stays same across devices.</p>
      </div>
    </>
  );
}
