import React, { useState } from 'react';
import aboutDataBn from '../data/about.json';
import aboutDataEn from '../data/about_en.json';
import AboutSections from '../components/AboutSections';

export default function About() {
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const aboutData = lang === 'bn' ? aboutDataBn : aboutDataEn;

  return (
    <div className="max-w-4xl mx-auto w-full px-4 pt-2 pb-8 space-y-8 relative">
      {/* Language Toggle */}
      <div className="absolute top-0 right-4 flex items-center gap-2">
        <button 
          onClick={() => setLang('bn')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'bn' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
        >
          বাংলা
        </button>
        <button 
          onClick={() => setLang('en')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'en' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
        >
          English
        </button>
      </div>

      <AboutSections aboutData={aboutData} />
    </div>
  );
}
