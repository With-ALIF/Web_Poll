import React from 'react';

interface ProfileAvatarProps {
  photoURL: string;
  displayName: string;
  email: string | null;
}

export default function ProfileAvatar({ photoURL, displayName, email }: ProfileAvatarProps) {
  return (
    <div className="flex justify-center mb-6">
      <div className="relative">
        <img 
          src={photoURL || `https://ui-avatars.com/api/?name=${displayName || email}&background=random`} 
          alt="Profile" 
          className="w-24 h-24 rounded-full border-4 border-slate-100 object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}
