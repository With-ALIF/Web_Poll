import React from 'react';
import { motion } from 'motion/react';
import { Shield } from 'lucide-react';

export const FeatureEmptyState: React.FC = () => {
  return (
    <motion.div
      key="empty-state"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-20"
    >
      <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Shield className="w-10 h-10 text-indigo-200" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">Select a Feature</h3>
      <p className="text-slate-500 max-w-xs mx-auto">Click on a feature badge above to see which users have access to it.</p>
    </motion.div>
  );
};
