import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Shield } from 'lucide-react';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { FeatureGrid } from '../components/features/FeatureGrid';
import { FeatureUserList } from '../components/features/FeatureUserList';
import { FeatureEmptyState } from '../components/features/FeatureEmptyState';

export default function FeatureDirectory() {
  const { loading, users } = useAdminUsers();
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>
  );

  const usersWithFeature = selectedFeature 
    ? users.filter(user => 
        user.permissions?.includes(selectedFeature) &&
        (user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
         user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 pt-2 pb-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg"><Shield className="w-6 h-6 text-indigo-600" /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Feature Panel</h1>
            <p className="text-slate-500 text-sm"></p>
          </div>
        </div>
      </div>
      <FeatureGrid users={users} selectedFeature={selectedFeature} setSelectedFeature={setSelectedFeature} />
      <AnimatePresence mode="wait">
        {selectedFeature ? (
          <FeatureUserList selectedFeature={selectedFeature} usersWithFeature={usersWithFeature} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        ) : <FeatureEmptyState />}
      </AnimatePresence>
    </div>
  );
}
