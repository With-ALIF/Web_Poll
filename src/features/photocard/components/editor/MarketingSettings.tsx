import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EditorProps } from './types';
import { ShoppingCart, CheckCircle, Tag, Layers, ToggleLeft, ToggleRight, ChevronDown } from 'lucide-react';

export const MarketingSettings: React.FC<EditorProps> = ({ data, onChange, handleChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-expand when enabled, collapse when disabled
  useEffect(() => {
    if (data.showMarketing) {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
  }, [data.showMarketing]);

  return (
    <div className="pt-6 border-t border-gray-100 space-y-4">
      <div 
        className="flex items-center justify-between p-1 cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-105">
            <ShoppingCart size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 leading-none mb-1">Marketing Promotion</h3>
            <p className="text-[10px] text-gray-500 font-medium">Add offers below the options</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const newValue = !data.showMarketing;
              onChange({ ...data, showMarketing: newValue });
              if (newValue) setIsExpanded(true);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
              data.showMarketing 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                : 'bg-white text-gray-400 border border-gray-100'
            }`}
          >
            {data.showMarketing ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
            {data.showMarketing ? 'চালু (Enabled)' : 'বন্ধ (Disabled)'}
          </button>
          <ChevronDown 
            size={18} 
            className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
          />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-2 pb-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1.5 px-1">
                    <CheckCircle size={10} className="text-blue-500" />
                    বাম লেবেল (Bold)
                  </label>
                  <div className="relative group">
                    <input 
                      name="leftLabel" 
                      value={data.leftLabel} 
                      onChange={handleChange} 
                      onFocus={(e) => e.target.select()} 
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm" 
                      placeholder="যেমন: সলভ কোর্স :"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1.5 px-1">
                    <Layers size={10} className="text-amber-500" />
                    Secondary Box
                  </label>
                  <input 
                    name="leftHighlightedBox" 
                    value={data.leftHighlightedBox} 
                    onChange={handleChange} 
                    onFocus={(e) => e.target.select()} 
                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm" 
                    placeholder="যেমন: সলভ কোর্স :"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1.5 px-1">
                    <Tag size={10} className="text-blue-500" />
                    Additional Features
                  </label>
                  <input 
                    name="rightHighlightedFeatures" 
                    value={data.rightHighlightedFeatures} 
                    onChange={handleChange} 
                    onFocus={(e) => e.target.select()} 
                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm" 
                    placeholder="যেমন: ক্লাস, পিডিএফ, পোল"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1.5 px-1">
                    <Tag size={10} className="text-emerald-500" />
                    Price Label
                  </label>
                  <div className="relative">
                    <input 
                      name="rightPriceBox" 
                      value={data.rightPriceBox} 
                      onChange={handleChange} 
                      onFocus={(e) => e.target.select()} 
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm" 
                      placeholder="যেমন: ৳ ৪৫০"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
