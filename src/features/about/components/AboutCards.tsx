import React from 'react';
import { BookOpen, Settings, Send, Image as ImageIcon, CheckCircle2, MessageCircle, Download, Tag, User, Sparkles, FileText } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Settings,
  BookOpen,
  ImageIcon,
  Send,
  MessageCircle,
  Download,
  Tag,
  User,
  Sparkles,
  FileText
};

const themeMap: Record<string, { bg: string, text: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-600' }
};

interface AboutCardsProps {
  sections: any[];
}

export default function AboutCards({ sections }: AboutCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {sections.map((section: any) => {
        const IconComponent = iconMap[section.icon];
        const theme = themeMap[section.theme] || themeMap.blue;

        return (
          <div key={section.id} className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className={`w-12 h-12 ${theme.bg} ${theme.text} rounded-xl flex items-center justify-center mb-4`}>
              {IconComponent && <IconComponent className="w-6 h-6" />}
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-4">{section.title}</h2>
            <ul className="space-y-3 text-slate-600">
              {section.items.map((item: any, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> 
                  <span className="leading-relaxed" dangerouslySetInnerHTML={{ __html: item }} />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
