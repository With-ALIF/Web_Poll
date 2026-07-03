import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { saveAppConfig } from '../services/adminSettingsService';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminSuffixSettings() {
  const { appConfig, user } = useAuth();
  const [localSuffix, setLocalSuffix] = useState('');
  const [isSavingSuffix, setIsSavingSuffix] = useState(false);
  const [suffixSuccessMsg, setSuffixSuccessMsg] = useState('');

  useEffect(() => {
    if (appConfig?.default_suffix !== undefined) {
      setLocalSuffix(appConfig.default_suffix);
    }
  }, [appConfig?.default_suffix]);

  const handleSaveSuffix = async () => {
    setSuffixSuccessMsg('');
    const currentSuffix = appConfig?.default_suffix || '';
    if (localSuffix === currentSuffix) {
      const lastSavedTime = appConfig?.updated_at 
        ? new Date(appConfig.updated_at.seconds ? appConfig.updated_at.seconds * 1000 : appConfig.updated_at).toLocaleString()
        : new Date().toLocaleString();
      setSuffixSuccessMsg(`কোনো পরিবর্তন করা হয়নি, ইতিমধ্যেই সেভ করা আছে! (সর্বশেষ সেভ: ${lastSavedTime})`);
      setTimeout(() => setSuffixSuccessMsg(''), 5000);
      return;
    }

    setIsSavingSuffix(true);
    try {
      const now = new Date();
      const success = await saveAppConfig({
        default_suffix: localSuffix,
        updated_at: now,
        updated_by: user?.email || 'admin'
      });
      if (success) {
        setSuffixSuccessMsg(`সফলভাবে গ্লোবাল সাফিক্স সেভ করা হয়েছে! (সেভের সময়: ${now.toLocaleTimeString()})`);
        setTimeout(() => setSuffixSuccessMsg(''), 5000);
      } else {
        alert('Failed to save suffix.');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('An error occurred while saving.');
    } finally {
      setIsSavingSuffix(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-4 pb-8 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-6"
      >
        <div className="border-b border-gray-100 pb-5">
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-3">
            <Settings className="w-6 h-6 text-indigo-600" />
            গ্লোবাল সাফিক্স সেটআপ (System Default Suffix)
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-bold">
            Admin Workspace Configurator
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-gray-700">
              সাফিক্স টেক্সট (Max 200 chars)
            </label>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${localSuffix.length > 200 ? 'bg-red-50 text-red-500 font-extrabold' : 'bg-gray-50 text-gray-400'}`}>
              {localSuffix.length} / 200
            </span>
          </div>
          
          <textarea
            value={localSuffix}
            onChange={(e) => setLocalSuffix(e.target.value)}
            placeholder="এখানে আপনার ডিফল্ট সাফিক্স লিখুন..."
            rows={6}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm focus:bg-white transition-all outline-none resize-y font-medium text-gray-800"
          />
          {localSuffix.length > 200 && (
            <p className="text-xs text-red-500 mt-1 font-semibold flex items-center gap-1">
              ⚠️ টেলিগ্রাম পোল ফিডব্যাক মেকানিজম অনুযায়ী সাফিক্স ২০০ ক্যারেক্টারের নিচে রাখা বাঞ্ছনীয়।
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100 flex-col sm:flex-row">
          <div className="text-xs text-gray-400">
            {appConfig?.updated_at && (
              <p className="font-medium">
                সর্বশেষ আপডেট: {new Date(appConfig.updated_at.seconds ? appConfig.updated_at.seconds * 1000 : appConfig.updated_at).toLocaleString()} ({appConfig.updated_by || 'System'})
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setLocalSuffix(appConfig?.default_suffix || '')}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-all cursor-pointer hover:shadow-sm"
            >
              রিসেট করুন
            </button>
            
            <button
              type="button"
              onClick={handleSaveSuffix}
              disabled={isSavingSuffix || localSuffix.length > 200}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSavingSuffix ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  সেভ করা হচ্ছে...
                </>
              ) : (
                'সাফিক্স সেভ ও সেট করুন'
              )}
            </button>
          </div>
        </div>

         <AnimatePresence>
          {suffixSuccessMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`${
                suffixSuccessMsg.includes('ইতিমধ্যেই') 
                  ? 'bg-amber-50 border border-amber-100 text-amber-800' 
                  : 'bg-emerald-50 border border-emerald-100 text-emerald-800'
              } p-4 rounded-xl text-xs font-bold leading-relaxed text-center flex items-center justify-center gap-2 mt-4 shadow-sm`}
            >
              {suffixSuccessMsg.includes('ইতিমধ্যেই') ? (
                <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {suffixSuccessMsg}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
