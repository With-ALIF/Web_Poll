import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Layout, Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { AVAILABLE_PAGES } from '../constants';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../backend/firebase';

export default function AdminStats() {
  const { loading, regularUsersCount } = useAdminUsers();
  const featuresCount = AVAILABLE_PAGES.length;

  // Sync user count to global stats
  useEffect(() => {
    if (!loading && regularUsersCount > 0) {
      const syncStats = async () => {
        try {
          await setDoc(doc(db, 'system', 'stats'), {
            userCount: regularUsersCount
          }, { merge: true });
        } catch (error) {
          console.error("Failed to sync stats", error);
        }
      };
      syncStats();
    }
  }, [loading, regularUsersCount]);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center"
        >
          <div className="p-4 bg-blue-50 rounded-2xl mb-6">
            <Users className="w-10 h-10 text-blue-600" />
          </div>
          <div className="text-5xl font-black text-slate-900 mb-2">{regularUsersCount}</div>
          <div className="text-lg font-bold text-slate-500 uppercase tracking-widest">Total Members</div>
          <p className="mt-4 text-slate-400 text-sm">Registered active users in the system</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center"
        >
          <div className="p-4 bg-indigo-50 rounded-2xl mb-6">
            <Layout className="w-10 h-10 text-indigo-600" />
          </div>
          <div className="text-5xl font-black text-slate-900 mb-2">{featuresCount}</div>
          <div className="text-lg font-bold text-slate-500 uppercase tracking-widest">Total Features</div>
          <p className="mt-4 text-slate-400 text-sm">Accessible modules and pages</p>
        </motion.div>
      </div>
    </div>
  );
}
