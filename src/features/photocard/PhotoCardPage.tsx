import React, { useState } from 'react';
import { toPng } from 'html-to-image';
import { Download, Layout } from 'lucide-react';
import PhotoCardPreview from './components/PhotoCardPreview';
import PhotoCardEditor from './components/PhotoCardEditor';
import { PhotoCardData } from './types';
import { motion } from 'motion/react';
import { SUBJECT_BG_COLOR_MAP, DEFAULT_BG_COLOR } from './constants';

const INITIAL_DATA: PhotoCardData = {
  logoUrl: "https://raw.githubusercontent.com/alif982/sot/main/channel/sot.jpg",
  headerTitle: "প্রিমিয়াম কোর্স এ ভর্তি চলছে..",
  subject: "রসায়ন প্রথম পত্র",
  chapter: "চতুর্থ অধ্যায় - রাসায়নিক পরিবর্তন",
  question: "কোনটি উভমুখী বিক্রিয়া নির্দেশ করে?",
  options: {
    a: "H₂ + O₂ = H₂O",
    b: "N₂ + 3H₂ ⇌ 2NH₃",
    c: "NaOH + HCl = NaCl + H₂O",
    d: "C + O₂ = CO₂"
  },
  leftLabel: "অনুশীলনী",
  leftHighlightedBox: "সলভ কোর্স :",
  rightHighlightedFeatures: "ক্লাস, পিডিএফ, পোল",
  rightPriceBox: "৳ ৪৫০",
  showMarketing: false,
  telegramName: "Telegram",
  facebookName: "Facebook"
};

const PhotoCardPage: React.FC = () => {
  const [data, setData] = useState<PhotoCardData>(INITIAL_DATA);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    const el = document.getElementById('photocard-preview');
    if (!el) {
      alert("এক্সপোর্ট করার জন্য প্রিভিউ এলিমেন্ট পাওয়া যায়নি।");
      return;
    }
    
    setIsExporting(true);
    try {
      // 1. Ensure fonts are loaded
      await document.fonts.ready;
      
      // 2. Prepare images: convert only external images to base64 if needed
      const images = Array.from(el.getElementsByTagName('img'));
      
      await Promise.all(images.map(img => {
        if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = () => resolve(true);
          img.onerror = () => {
            console.warn('Image failed to load:', img.src);
            img.style.visibility = 'hidden'; // Mark for filtering
            resolve(false);
          };
          // Trigger reload with CORS if it's external and hasn't loaded yet
          if (img.src && img.src.startsWith('http')) {
            const currentSrc = img.src;
            img.src = '';
            img.crossOrigin = 'anonymous';
            img.src = currentSrc;
          }
        });
      }));

      // 3. Small delay for layout stability
      await new Promise(resolve => setTimeout(resolve, 600));

      // 4. Capture using toPng with robust options
      const bgColor = SUBJECT_BG_COLOR_MAP[data.subject] || DEFAULT_BG_COLOR;

      const dataUrl = await toPng(el, { 
        cacheBust: true,
        pixelRatio: 2.5, // High quality but not too crazy
        backgroundColor: bgColor,
        filter: (node) => {
          if (node instanceof HTMLImageElement && node.style.visibility === 'hidden') {
            return false;
          }
          return true;
        },
        style: {
          borderRadius: '0px',
          transform: 'none'
        }
      })
      .catch(e => {
        console.error('Inner toPng error:', e);
        const bgColorFallback = SUBJECT_BG_COLOR_MAP[data.subject] || DEFAULT_BG_COLOR;
        // Try one more time without pixelRatio if it failed
        return toPng(el, { cacheBust: true, backgroundColor: bgColorFallback });
      });

      if (!dataUrl || dataUrl.length < 500) {
        throw new Error("তৈরি করা ইমেজটি অত্যন্ত ছোট বা খালি।");
      }

      const link = document.createElement('a');
      link.download = `photocard-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.error('Export failed Detail:', err);
      let errorMsg = "Unknown error";
      if (err instanceof Error) errorMsg = err.message;
      if (typeof err === 'string') errorMsg = err;
      
      // Specific check for CORS/fetch errors which often show up as "Event" or "failed to fetch"
      if (errorMsg.includes('failed to fetch') || errorMsg === '[object Event]') {
        errorMsg = "ইমেজ লোড করতে সমস্যা হয়েছে (CORS settings)। দয়া করে লোগোটি অন্যভাবে আপলোড করুন বা বাদ দিন।";
      }
      
      alert(`ডাউনলোড করতে সমস্যা হয়েছে। (${errorMsg})\nদয়া করে আবার চেষ্টা করুন।`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest">Workspace</h2>
          <p className="text-xs text-gray-500">Design and export your photocard in high resolution.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownload}
            disabled={isExporting}
            className="flex items-center gap-2 bg-gray-950 hover:bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <Download className={`w-4 h-4 transition-transform ${isExporting ? 'animate-bounce' : 'group-hover:-translate-y-1'}`} />
            {isExporting ? 'তৈরি...' : 'Download Card'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-[1400px] mx-auto">
        
        {/* Left Column: Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-[32px] p-2 sm:p-4 border border-gray-100 shadow-sm relative overflow-visible flex flex-col items-center justify-start pt-2 sm:pt-6">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none overflow-hidden h-full w-full">
              <Layout className="w-48 h-48 text-gray-950 absolute top-8 right-8" />
            </div>
            
            <div className="relative z-10 w-full flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-6 max-w-[550px] px-2 text-blue-600">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-blue-50 px-4 py-1.5 rounded-full">
                  Live Preview (1:1)
                </span>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
              </div>
              
              <div className="w-[85%] sm:w-full max-w-[550px] mb-4 sm:mb-8">
                <PhotoCardPreview data={data} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editor */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="xl:sticky xl:top-24 h-fit"
        >
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Card Configuration</h2>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <PhotoCardEditor data={data} onChange={setData} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PhotoCardPage;
