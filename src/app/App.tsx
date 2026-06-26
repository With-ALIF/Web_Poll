import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import AppRoutes from './AppRoutes';
import { useApp } from '../context/AppContext';
import { useAuth } from '../features/auth/hooks/useAuth';

export default function App() {
  const appState = useApp();
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user && isAdmin) {
      if (location.pathname === '/auth' || location.pathname === '/') {
        navigate('/system-stats');
      }
    }
  }, [user, isAdmin, loading, navigate, location.pathname]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] font-sans flex flex-col">
      <MainLayout>
        <AppRoutes appState={appState} />
      </MainLayout>
    </div>
  );
}
