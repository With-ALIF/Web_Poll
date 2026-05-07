import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, permission }: { children: React.ReactNode, permission?: string }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (permission && !isAdmin) {
    const permissions = user.permissions || [];
    const hasAccess = permissions.includes(permission);

    if (!hasAccess) {
      return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6 p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-10 h-10 text-amber-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
            <p className="text-slate-500">
              You don't have permission to access this page. Please contact your administrator to request access.
            </p>
          </div>
          <div className="pt-4">
            <button 
              onClick={() => window.location.href = '/profile'}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              Go to Profile
            </button>
          </div>
        </div>
      </div>
    );
    }
  }

  return children;
}
