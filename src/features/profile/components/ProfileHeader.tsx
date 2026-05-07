import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileHeaderProps {
  message: string;
}

export default function ProfileHeader({ message }: ProfileHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <>
      <button onClick={() => navigate('/')} className="absolute top-4 left-4 text-slate-400 hover:text-slate-600">
        <ArrowLeft className="w-6 h-6" />
      </button>

      <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Profile</h2>

      {message && (
        <p className={`text-sm mb-4 text-center ${message.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
          {message}
        </p>
      )}
    </>
  );
}
