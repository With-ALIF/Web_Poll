import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { useAdminActions } from '../hooks/useAdminActions';
import { AdminHeader } from '../components/layout/AdminHeader';
import { UserSearch } from '../components/users/UserSearch';
import { UserDirectory } from '../components/users/UserDirectory';
import { CreateUserModal } from '../components/management/CreateUserModal';
import { PermissionModal } from '../components/management/PermissionModal';
import { AdminUser } from '../types';
import { generateGlobalUserReportPDF } from '../utils/pdfExport';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { loading, searchTerm, setSearchTerm, filteredUsers, regularUsersCount, loadUsers } = useAdminUsers();
  const { loading: actionLoading, handleDelete, handleCreateUser, handleSavePermissions } = useAdminActions(loadUsers);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadGlobalPDF = () => {
    setIsExporting(true);
    try {
      generateGlobalUserReportPDF(filteredUsers);
    } catch (error) {
      console.error('Error generating global PDF:', error);
      alert('Failed to generate user list PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenPermissions = (user: AdminUser) => {
    setSelectedUser(user);
    setUserPermissions(user.permissions || []);
    setShowPermissionModal(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 pt-2 pb-8">
      <AdminHeader onCreateClick={() => setShowCreateModal(true)} />

      <UserSearch 
        value={searchTerm} 
        onChange={setSearchTerm} 
        onDownloadPDF={handleDownloadGlobalPDF} 
        isDownloading={isExporting}
      />
      
      <UserDirectory 
        users={filteredUsers} 
        activeMenuId={activeMenuId} 
        setActiveMenuId={setActiveMenuId} 
        onManageAccess={handleOpenPermissions} 
        onDelete={handleDelete} 
      />
      
      {showCreateModal && <CreateUserModal onClose={() => setShowCreateModal(false)} onSubmit={handleCreateUser} loading={actionLoading} />}
      {showPermissionModal && selectedUser && (
        <PermissionModal 
          user={selectedUser} permissions={userPermissions} 
          onToggle={(id) => setUserPermissions(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])}
          onSave={() => handleSavePermissions(selectedUser.id, userPermissions).then(success => success && setShowPermissionModal(false))}
          onClose={() => setShowPermissionModal(false)} loading={actionLoading}
        />
      )}
    </div>
  );
}
