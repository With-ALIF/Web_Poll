import React from 'react';
import { Search } from 'lucide-react';

interface UserSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const UserSearch: React.FC<UserSearchProps> = ({ value, onChange }) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h2 className="text-xl font-bold text-gray-900">User Directory</h2>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search users..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-64"
        />
      </div>
    </div>
  );
};
