import React from 'react';
import AboutCards from './AboutCards';
import DeveloperCard from './DeveloperCard';

interface AboutSectionsProps {
  aboutData: any;
}

export default function AboutSections({ aboutData }: AboutSectionsProps) {
  return (
    <>
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 mt-10 md:mt-2">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">{aboutData.header.title}</h1>
        <p className="text-slate-600 leading-relaxed text-base md:text-lg">
          {aboutData.header.description}
        </p>
      </div>

      <AboutCards sections={aboutData.sections} />

      <div className="bg-blue-50 p-5 md:p-6 rounded-2xl border border-blue-100 text-blue-900">
        <h3 className="font-bold text-lg mb-2">{aboutData.footerNote.title}</h3>
        <p className="leading-relaxed">
          {aboutData.footerNote.description}
        </p>
      </div>

      <DeveloperCard developer={aboutData.developer} />
    </>
  );
}
