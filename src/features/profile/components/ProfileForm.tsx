import React from 'react';
import { Camera, Save } from 'lucide-react';

interface ProfileFormProps {
  displayName: string;
  setDisplayName: (val: string) => void;
  photoURL: string;
  setPhotoURL: (val: string) => void;
  loading: boolean;
  onSave: () => void;
}

export default function ProfileForm({
  displayName,
  setDisplayName,
  photoURL,
  setPhotoURL,
  loading,
  onSave
}: ProfileFormProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Enter your name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Profile Photo URL</label>
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Enter image URL"
          />
        </div>
      </div>

      <button 
        onClick={onSave}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300"
      >
        {loading ? 'Saving...' : <><Save className="w-5 h-5" /> Save Profile</>}
      </button>
    </>
  );
}
