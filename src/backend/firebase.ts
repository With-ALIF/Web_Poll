import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser, signOut } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, terminate, clearIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Simple initialization for Firestore with named database
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

/**
 * Handle Firestore connection issues gracefully.
 * If the client remains offline for too long, it might be a configuration or environment issue.
 */
async function checkConnectivity() {
  try {
    // For debugging connection in AI Studio environment
    console.log(`Firestore Database ID: ${firebaseConfig.firestoreDatabaseId || '(default)'}`);
  } catch (error) {
    console.warn("Could not check Firestore connectivity", error);
  }
}
checkConnectivity();

export { firebaseConfig, createUserWithEmailAndPassword, signInWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser, signOut };
