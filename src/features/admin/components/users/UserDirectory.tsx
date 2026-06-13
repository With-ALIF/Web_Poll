import React from 'react';
import { Users as UsersIcon } from 'lucide-react';
import { AdminUser } from '../../types';
import { UserCard } from './UserCard';

interface UserDirectoryProps {
  users: AdminUser[];
  activeMenuId: string | null;
  setActiveMenuId: (id: string | null) => void;
  onManageAccess: (user: AdminUser) => void;
  onDelete: (userId: string) => void;
  selectedUserIds: string[];
  onToggleSelectUser: (id: string) => void;
}

export const UserDirectory: React.FC<UserDirectoryProps> = ({ 
  users, activeMenuId, setActiveMenuId, onManageAccess, onDelete,
  selectedUserIds, onToggleSelectUser
}) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
        <UsersIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 font-medium">No users found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => (
        <UserCard 
          key={user.id} 
          user={user} 
          activeMenuId={activeMenuId} 
          setActiveMenuId={setActiveMenuId} 
          onManageAccess={onManageAccess} 
          onDelete={onDelete} 
          isSelected={selectedUserIds.includes(user.id)}
          onToggleSelect={() => onToggleSelectUser(user.id)}
        />
      ))}
    </div>
  );
};
