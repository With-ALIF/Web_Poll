import { useState } from 'react';
import { deleteUserByAdmin, createUserByAdmin, updateUserPermissions, resetUserPassword } from '../services/adminService';

export function useAdminActions(onSuccess: () => void) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async (userId: string) => {
    setLoading(true);
    try {
      await deleteUserByAdmin(userId);
      onSuccess();
      return true;
    } catch (error) {
      alert('Failed to delete user.');
      return false;
    } finally {
      setLoading(false);
    }
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

  const handleResetPassword = async (userId: string, newPassword: string) => {
    setLoading(true);
    try {
      await resetUserPassword(userId, newPassword);
      return true;
    } catch (error: any) {
      alert(error.message || 'Failed to reset password');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, handleDelete, handleCreateUser, handleSavePermissions, handleResetPassword };
}
