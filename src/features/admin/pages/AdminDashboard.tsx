import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { useAdminActions } from '../hooks/useAdminActions';
import { AdminHeader } from '../components/layout/AdminHeader';
import { UserSearch } from '../components/users/UserSearch';
import { UserDirectory } from '../components/users/UserDirectory';
import { CreateUserModal } from '../components/management/CreateUserModal';
import { PermissionModal } from '../components/management/PermissionModal';
import { DeleteConfirmModal } from '../components/management/DeleteConfirmModal';
import { ResetPasswordModal } from '../components/management/ResetPasswordModal';
import { AdminUser } from '../types';
import { generateGlobalUserReportPDF } from '../utils/pdfExport';
import { Users, CheckSquare, Sparkles } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { loading, searchTerm, setSearchTerm, filteredUsers, regularUsersCount, loadUsers } = useAdminUsers();
  const { loading: actionLoading, handleDelete, handleCreateUser, handleSavePermissions, handleResetPassword } = useAdminActions(loadUsers);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [userToResetPassword, setUserToResetPassword] = useState<AdminUser | null>(null);

  const handleInitiateDelete = (userId: string) => {
    const user = filteredUsers.find(u => u.id === userId);
    if (user) {
      setUserToDelete(user);
    }
  };

  const handleInitiateResetPassword = (user: AdminUser) => {
    setUserToResetPassword(user);
  };

  const handleDownloadGlobalPDF = () => {
    setIsExporting(true);
    try {
      const usersToExport = (Array.isArray(selectedUserIds) && selectedUserIds.length > 0)
        ? filteredUsers.filter(u => selectedUserIds.includes(u.id))
        : filteredUsers;
      generateGlobalUserReportPDF(usersToExport);
    } catch (error) {
      console.error('Error generating global PDF:', error);
      alert('Failed to generate user list PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleToggleSelectUser = (id: string) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    const allFilteredIds = filteredUsers.map(u => u.id);
    const areAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedUserIds.includes(id));
    
    if (areAllSelected) {
      setSelectedUserIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedUserIds(prev => {
        const unique = new Set([...prev, ...allFilteredIds]);
        return Array.from(unique);
      });
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
        selectedCount={Array.isArray(selectedUserIds) ? selectedUserIds.length : 0}
      />

      {/* Selection Control Bar */}
      <div className={`mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 py-4 rounded-2xl border transition-all duration-300 shadow-sm ${
        (Array.isArray(selectedUserIds) && selectedUserIds.length > 0)
          ? 'bg-emerald-50/70 border-emerald-200/80 backdrop-blur-sm' 
          : 'bg-slate-50/80 border-slate-200/70'
      }`}>
        <div className="flex items-start sm:items-center gap-3.5">
          <label className="flex items-center h-full cursor-pointer select-none">
            <input
              type="checkbox"
              checked={Array.isArray(filteredUsers) && filteredUsers.length > 0 && filteredUsers.every(u => selectedUserIds.includes(u.id))}
              onChange={handleToggleAll}
              className="w-5 h-5 text-indigo-600 bg-white border-slate-300 rounded-lg focus:ring-indigo-500 focus:ring-2 cursor-pointer transition-all"
            />
          </label>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-slate-800 text-sm font-bold flex items-center gap-1.5">
                {(Array.isArray(selectedUserIds) && selectedUserIds.length === 0) ? (
                  <>
                    <Users className="w-4 h-4 text-slate-500" />
                    Global Mode: All Records Active
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    Targeted Mode: {Array.isArray(selectedUserIds) ? selectedUserIds.length : 0} profile{Array.isArray(selectedUserIds) && selectedUserIds.length > 1 ? 's' : ''} compiled
                  </>
                )}
              </span>
              <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                (Array.isArray(selectedUserIds) && selectedUserIds.length === 0) 
                  ? 'bg-slate-200/70 text-slate-600' 
                  : 'bg-emerald-200/60 text-emerald-800'
              }`}>
                {(Array.isArray(selectedUserIds) && selectedUserIds.length === 0) ? 'Batch All' : 'Custom Subset'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {(Array.isArray(selectedUserIds) && selectedUserIds.length === 0) 
                ? "Checking the select-all box above or ticking individual list boxes compiles a tailored report document."
                : `Export parameters locked onto selected user files. Press the export button to generate your polished PDF list download.`}
            </p>
          </div>
        </div>
        
        {(Array.isArray(selectedUserIds) && selectedUserIds.length > 0) && (
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button 
              onClick={() => setSelectedUserIds([])}
              className="text-xs font-bold text-slate-600 hover:text-slate-800 bg-white px-3.5 py-2 border border-slate-200 rounded-xl hover:border-slate-300 transition-all active:scale-95 shadow-sm hover:shadow cursor-pointer"
            >
              Clear Selection
            </button>
            <button 
              onClick={handleToggleAll}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3.5 py-2 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-all active:scale-95 cursor-pointer"
            >
              Select All Filtered
            </button>
          </div>
        )}
      </div>
      
      <UserDirectory 
        users={filteredUsers} 
        activeMenuId={activeMenuId} 
        setActiveMenuId={setActiveMenuId} 
        onManageAccess={handleOpenPermissions} 
        onDelete={handleInitiateDelete} 
        onResetPassword={handleInitiateResetPassword}
        selectedUserIds={selectedUserIds}
        onToggleSelectUser={handleToggleSelectUser}
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
      {userToDelete && (
        <DeleteConfirmModal 
          user={userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={() => handleDelete(userToDelete.id).then(success => success && setUserToDelete(null))}
          loading={actionLoading}
        />
      )}
      {userToResetPassword && (
        <ResetPasswordModal
          user={userToResetPassword}
          onClose={() => setUserToResetPassword(null)}
          onConfirm={async (password) => {
            const success = await handleResetPassword(userToResetPassword.id, password);
            if (success) {
              setUserToResetPassword(null);
            }
            return success;
          }}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
