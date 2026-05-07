import React from 'react';
import { ChevronDown, BookOpen, Map } from 'lucide-react';
import { EditorProps } from './types';
import { SUBJECT_OPTIONS } from '../../constants';

export const SubjectChapterSettings: React.FC<EditorProps> = ({ data, handleChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1.5 px-1">
          <BookOpen size={10} className="text-blue-500" />
          সাবজেক্ট
        </label>
        <div className="relative group">
          <select 
            name="subject"
            value={data.subject}
            onChange={handleChange}
            className="w-full bg-white border border-gray-100 rounded-xl px-4 pr-10 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer appearance-none shadow-sm transition-all"
          >
            <option value="" disabled>সাবজেক্ট নির্বাচন করুন</option>
            {SUBJECT_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
            <option value="অন্যান্য">অন্যান্য (নিজের মত লিখুন)</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>
      
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1.5 px-1">
          <Map size={10} className="text-emerald-500" />
          অধ্যায়
        </label>
        <input 
          name="chapter"
          value={data.chapter}
          onChange={handleChange}
          onFocus={(e) => e.target.select()}
          className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
          placeholder="চতুর্থ অধ্যায়"
        />
      </div>

      {(data.subject === 'অন্যান্য' || !SUBJECT_OPTIONS.includes(data.subject)) && data.subject !== "" && (
        <div className="space-y-1 md:col-span-2 pt-1 border-t border-gray-100 mt-1">
          <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">ম্যানুয়াল সাবজেক্ট নাম</label>
          <input 
            name="subject"
            value={data.subject === 'অন্যান্য' ? '' : data.subject}
            onChange={handleChange}
            onFocus={(e) => e.target.select()}
            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            placeholder="নিজের মত সাবজেক্ট নাম লিখুন"
          />
        </div>
      )}
    </div>
  );
};
