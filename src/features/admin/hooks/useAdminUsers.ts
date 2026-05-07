import { useState, useEffect, useCallback } from 'react';
import { fetchAllUsers } from '../services/adminService';
import { useAuth } from '../../auth/hooks/useAuth';
import { AdminUser } from '../types';
import { filterUsers, getRegularUsersCount } from '../utils/adminUtils';

export function useAdminUsers() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadUsers = useCallback(async () => {
    if (isAdmin) {
      const data = await fetchAllUsers();
      setUsers(data);
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filteredUsers = filterUsers(users, searchTerm);
  const regularUsersCount = getRegularUsersCount(users);

  return {
    users,
    loading: authLoading || loading,
    searchTerm,
    setSearchTerm,
    filteredUsers,
    regularUsersCount,
    loadUsers
  };
}
