import React from 'react';
import { motion } from 'motion/react';
import { Users } from 'lucide-react';
import { AVAILABLE_PAGES } from '../../constants';

interface Props {
  users: any[];
  selectedFeature: string | null;
  setSelectedFeature: (id: string | null) => void;
}

export const FeatureGrid: React.FC<Props> = ({ users, selectedFeature, setSelectedFeature }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      {AVAILABLE_PAGES.map((page) => {
        const isActive = selectedFeature === page.id;
        const userCount = users.filter(u => u.permissions?.includes(page.id)).length;
        return (
          <motion.button
            key={page.id} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedFeature(isActive ? null : page.id)}
            className={`p-4 rounded-2xl border transition-all text-left relative overflow-hidden ${isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/30'}`}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}>
                  {page.icon && <page.icon className="w-5 h-5" />}
                </div>
              </div>
              <div className="font-bold text-lg leading-tight mb-2">{page.name}</div>
              <div className={`flex items-center gap-1.5 text-xs font-bold ${isActive ? 'text-indigo-200' : 'text-indigo-600'}`}>
                <Users className="w-3.5 h-3.5" />{userCount} Users
              </div>
            </div>
            {isActive && <motion.div layoutId="active-glow" className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />}
          </motion.button>
        );
      })}
    </div>
  );
};
