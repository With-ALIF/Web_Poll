import React from 'react';
import { Wand2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function QuizEmptyState() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500"
    >
      <Wand2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
      <p>No quizzes generated yet.</p>
      <p className="text-sm mt-1">Paste some text on the left and click Generate.</p>
    </motion.div>
  );
}
