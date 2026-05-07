import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../backend/firebase';
import { deleteUserAccount } from '../../auth/services/authService';
import { Shield, BarChart3, Users } from 'lucide-react';
import ProfileHeader from '../components/ProfileHeader';
import ProfileAvatar from '../components/ProfileAvatar';
import ProfileInfo from '../components/ProfileInfo';
import ProfileForm from '../components/ProfileForm';

export default function ProfilePage() {
  const { user, loading: authLoading, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setDisplayName(data.displayName || '');
          setPhotoURL(data.photoURL || '');
        }
      };
      fetchProfile();
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setMessage('');
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName,
        photoURL
      });
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Failed to update profile.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setLoading(true);
    setDeleteError('');
    try {
      await deleteUserAccount(user, deletePassword);
      logout();
    } catch (error: any) {
      setDeleteError(error.message || 'Failed to delete account.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl p-8 relative">
      <ProfileHeader message={message} />

      <div className="space-y-4">
        <ProfileAvatar 
          photoURL={photoURL} 
          displayName={displayName} 
          email={user.email} 
        />

        <ProfileInfo 
          email={user.email} 
          uid={user.uid} 
        />

        <ProfileForm 
          displayName={displayName}
          setDisplayName={setDisplayName}
          photoURL={photoURL}
          setPhotoURL={setPhotoURL}
          loading={loading}
          onSave={handleSave}
        />

        {isAdmin && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Admin Controls</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                to="/admin" 
                className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
              >
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-indigo-100 transition-colors">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">User Terminal</div>
                  <div className="text-xs text-slate-500">Manage users & access</div>
                </div>
              </Link>
              <Link 
                to="/system-stats" 
                className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
              >
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-indigo-100 transition-colors">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Stats</div>
                  <div className="text-xs text-slate-500">View member & feature counts</div>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
