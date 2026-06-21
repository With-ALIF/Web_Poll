import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Layout, Shield, FileQuestion } from 'lucide-react';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { AVAILABLE_PAGES } from '../constants';
import { supabase } from '../../../lib/supabase';

export default function AdminStats() {
  const { loading, regularUsersCount, users } = useAdminUsers();
  const featuresCount = AVAILABLE_PAGES.length;

  const totalPollsGenerated = users.reduce((sum, user) => sum + (user.stats?.generated || 0), 0);
  const totalPollsSent = users.reduce((sum, user) => sum + (user.stats?.sent || 0), 0);

  // Sync user count and poll count to global stats
  useEffect(() => {
    if (!loading && regularUsersCount > 0) {
      const syncStats = async () => {
        try {
          await supabase
            .from('system_stats')
            .upsert({
              key: 'stats',
              value: {
                userCount: regularUsersCount,
                totalPollsGenerated,
                totalPollsSent
              },
              updated_at: new Date().toISOString()
            });
        } catch (error) {
          console.error("Failed to sync stats", error);
        }
      };
      syncStats();
    }
  }, [loading, regularUsersCount, totalPollsGenerated, totalPollsSent]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 pt-2 pb-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Shield className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:border-blue-200 transition-all"
        >
          <div className="p-3 md:p-4 bg-blue-50 rounded-2xl mb-3 md:mb-4 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
          </div>
          <div className="text-3xl md:text-4xl font-black text-slate-900 mb-1">{regularUsersCount}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Members</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:border-indigo-200 transition-all"
        >
          <div className="p-3 md:p-4 bg-indigo-50 rounded-2xl mb-3 md:mb-4 group-hover:scale-110 transition-transform">
            <Layout className="w-6 h-6 md:w-8 md:h-8 text-indigo-600" />
          </div>
          <div className="text-3xl md:text-4xl font-black text-slate-900 mb-1">{featuresCount}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Features</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:border-emerald-200 transition-all"
        >
          <div className="p-3 md:p-4 bg-emerald-50 rounded-2xl mb-3 md:mb-4 group-hover:scale-110 transition-transform">
            <FileQuestion className="w-6 h-6 md:w-8 md:h-8 text-emerald-600" />
          </div>
          <div className="text-3xl md:text-4xl font-black text-slate-900 mb-1">{totalPollsGenerated}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Polls Generated</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:border-amber-200 transition-all"
        >
          <div className="p-3 md:p-4 bg-amber-50 rounded-2xl mb-3 md:mb-4 group-hover:scale-110 transition-transform">
            <Shield className="w-6 h-6 md:w-8 md:h-8 text-amber-600" />
          </div>
          <div className="text-3xl md:text-4xl font-black text-slate-900 mb-1">{totalPollsSent}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Sent</div>
        </motion.div>
      </div>
    </div>
  );
}
