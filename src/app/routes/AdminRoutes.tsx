import React from 'react';
import { Route } from 'react-router-dom';
import AdminDashboard from '../../features/admin/pages/AdminDashboard';
import AdminStats from '../../features/admin/pages/AdminStats';
import FeatureDirectory from '../../features/admin/pages/FeatureDirectory';
import ProtectedRoute from '../../components/ProtectedRoute';

interface AdminRoutesProps {
  isAdmin: boolean;
}

export const useAdminRoutes = ({ isAdmin }: AdminRoutesProps) => {
  return (
    <>
      <Route 
        path="/system-stats" 
        element={
          <ProtectedRoute>
            {isAdmin ? <AdminStats /> : <div className="p-8 text-center">Access Denied</div>}
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/features" 
        element={
          <ProtectedRoute>
            {isAdmin ? <FeatureDirectory /> : <div className="p-8 text-center">Access Denied</div>}
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            {isAdmin ? <AdminDashboard /> : <div className="p-8 text-center">Access Denied</div>}
          </ProtectedRoute>
        } 
      />
    </>
  );
};
