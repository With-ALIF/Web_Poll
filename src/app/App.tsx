import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { InstallPrompt } from '../components/InstallPrompt';
import AppRoutes from './AppRoutes';
import { useApp } from '../context/AppContext';
import { useAuth } from '../features/auth/hooks/useAuth';
import { AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const appState = useApp();
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showQuotaAlert, setShowQuotaAlert] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) {
      if (location.pathname === '/auth' || location.pathname === '/') {
        navigate('/system-stats');
      }
    }
  }, [user, isAdmin, loading, navigate, location.pathname]);

  useEffect(() => {
    const handleQuotaExceeded = () => {
      setShowQuotaAlert(true);
      // Auto hide after 10 seconds
      setTimeout(() => setShowQuotaAlert(false), 10000);
    };

    window.addEventListener('firestore-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('firestore-quota-exceeded', handleQuotaExceeded);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] font-sans flex flex-col">
      <AnimatePresence>
        {showQuotaAlert && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-500 text-white px-4 py-2 flex items-center justify-between text-sm font-medium overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>Firestore Quota Exceeded. Using cached data. Reset in ~BST 2:00 PM.</span>
            </div>
            <button 
              onClick={() => setShowQuotaAlert(false)}
              className="p-1 hover:bg-red-600 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <MainLayout>
        <AppRoutes appState={appState} />
      </MainLayout>

      <InstallPrompt />
    </div>
  );
}
