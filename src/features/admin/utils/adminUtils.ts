import { AdminUser } from '../types';

export const filterUsers = (users: AdminUser[], searchTerm: string) => {
  return users.filter(user => {
    const isAdminUser = user.role === 'admin' || user.email === 'alifweb@gmail.com';
    if (isAdminUser) return false;
    
    return user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.email?.toLowerCase().includes(searchTerm.toLowerCase());
  });
};

export const getRegularUsersCount = (users: AdminUser[]) => {
  return users.filter(user => {
    const isAdminUser = user.role === 'admin' || user.email === 'alifweb@gmail.com';
    return !isAdminUser;
  }).length;
};
