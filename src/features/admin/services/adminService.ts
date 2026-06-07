import { collection, getDocs, query, orderBy, deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, firebaseConfig } from '../../../backend/firebase';
import { handleFirestoreError, OperationType } from '../../../lib/firestoreUtils';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

export const fetchAllUsers = async () => {
  try {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const users: any[] = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    localStorage.setItem('admin_user_list', JSON.stringify(users));
    return users;
  } catch (error: any) {
    if (error.message?.includes('Quota') || error.message?.includes('quota')) {
      const cached = localStorage.getItem('admin_user_list');
      if (cached) return JSON.parse(cached);
    }
    handleFirestoreError(error, OperationType.LIST, 'users');
    return [];
  }
};

export const deleteUserByAdmin = async (userId: string) => {
  try {
    await deleteDoc(doc(db, 'users', userId));
    console.log("User deleted successfully by admin");
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'users/' + userId);
    throw error;
  }
};

export const updateUserPermissions = async (userId: string, permissions: string[]) => {
  try {
    await setDoc(doc(db, 'users', userId), { permissions }, { merge: true });
    console.log("User permissions updated successfully");
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'users/' + userId);
    throw error;
  }
};

export const updateUser = async (userId: string, data: any) => {
  try {
    await setDoc(doc(db, 'users', userId), data, { merge: true });
    console.log("User updated successfully");
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'users/' + userId);
    throw error;
  }
};

export const createUserByAdmin = async (email: string, displayName: string, password?: string, permissions: string[] = []) => {
  let secondaryApp;
  try {
    const finalPassword = password || Math.random().toString(36).slice(-8);
    
    // Create a secondary app instance to avoid logging out the admin
    secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
    const secondaryAuth = getAuth(secondaryApp);
    
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, finalPassword);
    const user = userCredential.user;
    
    // Write to Firestore using the primary db instance (admin's auth context)
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      role: 'user',
      permissions: permissions,
      createdAt: serverTimestamp()
    });
    
    // Clean up the secondary app instance
    await deleteApp(secondaryApp);
    
    return { email, password: finalPassword, displayName };
  } catch (error: any) {
    if (secondaryApp) {
      try { await deleteApp(secondaryApp); } catch (e) {}
    }
    
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered.');
    }
    if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    }
    if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. It must be at least 6 characters.');
    }
    
    handleFirestoreError(error, OperationType.WRITE, 'users');
    throw error;
  }
};
