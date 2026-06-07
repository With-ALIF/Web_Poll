import { useState } from 'react';
import { deleteUserByAdmin, createUserByAdmin, updateUserPermissions } from '../services/adminService';

export function useAdminActions(onSuccess: () => void) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUserByAdmin(userId);
      onSuccess();
    } catch (error) { alert('Failed to delete user.'); }
  };

  const handleCreateUser = async (data: any) => {
    setLoading(true);
    try {
      const user = await createUserByAdmin(data.email, data.name, data.password, data.permissions);
      onSuccess();
      return user;
    } catch (error: any) {
      alert(error.message || 'Failed to create user.');
      return null;
    } finally { setLoading(false); }
  };

  const handleSavePermissions = async (userId: string, permissions: string[]) => {
    setLoading(true);
    try {
      await updateUserPermissions(userId, permissions);
      onSuccess();
      return true;
    } catch (error) {
      alert('Failed to update permissions');
      return false;
    } finally { setLoading(false); }
  };

  return { loading, handleDelete, handleCreateUser, handleSavePermissions };
}
