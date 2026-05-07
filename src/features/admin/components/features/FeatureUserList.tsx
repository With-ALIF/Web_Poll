import React from 'react';
import { motion } from 'motion/react';
import { Search, Users, User as UserIcon } from 'lucide-react';
import { AVAILABLE_PAGES } from '../../constants';

interface Props {
  selectedFeature: string;
  usersWithFeature: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const FeatureUserList: React.FC<Props> = ({ selectedFeature, usersWithFeature, searchTerm, setSearchTerm }) => {
  const featureName = AVAILABLE_PAGES.find(p => p.id === selectedFeature)?.name;
  
  return (
    <motion.div key="user-list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          Users with <span className="text-indigo-600">"{featureName}"</span>
        </h2>
      </div>
      {usersWithFeature.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {usersWithFeature.map((user) => (
            <motion.div key={user.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100">
                {user.photoURL ? <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <UserIcon className="w-6 h-6 text-slate-300" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900 truncate">{user.displayName || 'Anonymous'}</div>
                <div className="text-xs text-slate-500 truncate">{user.email}</div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No users found for this feature.</p>
        </div>
      )}
    </motion.div>
  );
};
