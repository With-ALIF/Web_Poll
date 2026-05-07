import React from 'react';
import { Shield, UserPlus } from 'lucide-react';

interface AdminHeaderProps {
  onCreateClick: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onCreateClick }) => {
  return (
    <div className="mb-8 flex flex-col items-start gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Shield className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Panel</h1>
          <p className="text-gray-500">Manage all registered users on your platform</p>
        </div>
      </div>
      <button 
        onClick={onCreateClick}
        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <UserPlus className="w-4 h-4" />
        Create User
      </button>
    </div>
  );
};
