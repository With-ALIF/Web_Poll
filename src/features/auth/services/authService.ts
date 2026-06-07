import { doc, getDoc, setDoc, serverTimestamp, deleteDoc, increment } from 'firebase/firestore';
import { db, auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser, sendPasswordResetEmail } from '../../../backend/firebase';
import { User } from 'firebase/auth';
import { handleFirestoreError, OperationType } from '../../../lib/firestoreUtils';
import { ADMIN_EMAILS } from '../constants';

const profileCheckCache = new Set<string>();

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("Password reset email sent to:", email);
  } catch (error) {
    console.error("Error in resetPassword:", error);
    throw error;
  }
};

export const createUserProfile = async (user: User) => {
  if (profileCheckCache.has(user.uid)) {
    return;
  }
  try {
    console.log("Checking user profile for:", user.uid);
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    profileCheckCache.add(user.uid);
    
    if (!userSnap.exists()) {
      console.log("Creating new user profile...");
      const defaultRole = ADMIN_EMAILS.includes(user.email || '') ? 'admin' : 'user';
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: defaultRole,
        createdAt: serverTimestamp()
      });
      console.log("User profile created successfully with role:", defaultRole);
      
      // Update global user stats
      try {
        const statsRef = doc(db, 'system', 'stats');
        await setDoc(statsRef, {
          userCount: increment(1),
          lastUpdated: serverTimestamp()
        }, { merge: true });
      } catch (statError) {
        handleFirestoreError(statError, OperationType.WRITE, 'system/stats');
      }
    } else {
      console.log("User profile already exists");
      localStorage.setItem(`profile_${user.uid}`, JSON.stringify(userSnap.data()));
    }
  } catch (error: any) {
    if (error.message?.includes('Quota') || error.message?.includes('quota')) {
      console.warn("Quota exceeded during profile check, using potential local state.");
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, 'users/' + user.uid);
  }
};

export const getUserProfile = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      localStorage.setItem(`profile_${uid}`, JSON.stringify(data));
      return data;
    }
    return null;
  } catch (error: any) {
    if (error.message?.includes('Quota') || error.message?.includes('quota')) {
      const cached = localStorage.getItem(`profile_${uid}`);
      if (cached) return JSON.parse(cached);
    }
    handleFirestoreError(error, OperationType.GET, 'users/' + uid);
    return null;
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    console.log("Attempting email sign-up for:", email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(userCredential.user);
    console.log("Email sign-up successful");
    return userCredential.user;
  } catch (error) {
    console.error("Error in signUpWithEmail:", error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log("Attempting email sign-in for:", email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Email sign-in successful");
    return userCredential.user;
  } catch (error) {
    console.error("Error in signInWithEmail:", error);
    throw error;
  }
};

export const deleteUserAccount = async (user: User, password: string) => {
  try {
    console.log("Attempting to delete user account...");
    const credential = EmailAuthProvider.credential(user.email!, password);
    await reauthenticateWithCredential(user, credential);
    await deleteDoc(doc(db, 'users', user.uid));
    await deleteUser(user);
    console.log("User account deleted successfully");
    
    // Decrement global user stats
    try {
      const statsRef = doc(db, 'system', 'stats');
      await setDoc(statsRef, {
        userCount: increment(-1),
        lastUpdated: serverTimestamp()
      }, { merge: true });
    } catch (statError) {
      handleFirestoreError(statError, OperationType.WRITE, 'system/stats');
    }
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw error;
  }
};
