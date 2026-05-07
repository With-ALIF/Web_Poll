import React from 'react';
import { Database, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function QBSPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mb-8 relative"
      >
        <Database className="w-12 h-12 text-blue-600" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1 -right-1"
        >
          <div className="bg-amber-400 p-2 rounded-xl shadow-lg border-2 border-white">
            <Clock className="w-4 h-4 text-white" />
          </div>
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl font-black text-slate-800 mb-4 tracking-tight"
      >
        QBS Integration
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-lg text-slate-500 max-w-md mx-auto mb-10 font-medium"
      >
        Question Bank System is coming soon.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="px-8 py-3 bg-slate-100 rounded-2xl border border-slate-200"
      >
        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">
          Status: Development in Progress
        </span>
      </motion.div>
    </div>
  );
}
