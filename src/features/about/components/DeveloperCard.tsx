import React from 'react';
import { User, Mail, Github, Send } from 'lucide-react';

interface DeveloperCardProps {
  developer: any;
}

export default function DeveloperCard({ developer }: DeveloperCardProps) {
  if (!developer) return null;

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 mt-8">
      <div className="flex items-center gap-4 mb-6">
        {developer.logo ? (
          <img 
            src={developer.logo} 
            alt={developer.name} 
            className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 shadow-sm"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{developer.title}</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Creator & Maintainer</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center border border-slate-100">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Name</p>
            <a href="https://alif.mnr.bd/" target="_blank" rel="noopener noreferrer" className="text-base font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
              {developer.name}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center border border-slate-100">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Email</p>
            <a href={`mailto:${developer.email}`} className="text-base font-semibold text-blue-600 hover:underline">
              {developer.email}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center border border-slate-100">
            <Github className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">GitHub</p>
            <a href={developer.github} target="_blank" rel="noopener noreferrer" className="text-base font-semibold text-blue-600 hover:underline">
              {developer.github.replace('https://github.com/', '')}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center border border-slate-100">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Telegram</p>
            <a href={developer.telegram} target="_blank" rel="noopener noreferrer" className="text-base font-semibold text-blue-600 hover:underline">
              {developer.telegram.replace('https://t.me/', '@')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
