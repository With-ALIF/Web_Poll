import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [browserType, setBrowserType] = useState<'chromium' | 'firefox' | 'ios' | 'other'>('other');

  useEffect(() => {
    // Detect browser
    const ua = navigator.userAgent.toLowerCase();
    const isFirefox = ua.indexOf('firefox') > -1;
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isStandalone) {
      setIsVisible(false);
      return;
    }

    if (isIos) {
      setBrowserType('ios');
      // On iOS, we show the prompt after a short delay since there's no event
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    } else if (isFirefox) {
      setBrowserType('firefox');
      // On Firefox mobile, show the prompt
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setBrowserType('chromium');
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  const getInstructions = () => {
    if (browserType === 'ios') {
      return "Safari মেনু থেকে 'Add to Home Screen' ক্লিক করুন";
    }
    if (browserType === 'firefox') {
      return "মেনু (তিনটি ডট) থেকে 'Install' বা 'Add to Home Screen' ক্লিক করুন";
    }
    return "এই অ্যাপটি আপনার ডিভাইসে ইনস্টল করুন দ্রুত ব্যবহারের জন্য";
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-4 right-4 z-50 md:left-auto md:right-6 md:w-96"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-900">Install TeleQuiz</h3>
            <p className="text-[10px] sm:text-xs text-slate-500 leading-tight">
              {getInstructions()}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {(browserType === 'chromium' && deferredPrompt) && (
              <button
                onClick={handleInstallClick}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
              >
                ইনস্টল করুন
              </button>
            )}
            <button
              onClick={() => setIsVisible(false)}
              className={`${(browserType === 'chromium' && deferredPrompt) ? 'text-slate-400' : 'bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-xs font-bold'} hover:text-slate-900 flex items-center justify-center transition-colors`}
            >
              {(browserType === 'chromium' && deferredPrompt) ? <X className="w-4 h-4" /> : 'বুঝতে পেরেছি'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
