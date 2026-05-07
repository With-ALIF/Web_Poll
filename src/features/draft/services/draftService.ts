import { collection, doc, setDoc, getDocs, deleteDoc, query, where, writeBatch, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../../../backend/firebase';
import { QuizQuestion } from '../../../types';
import { handleFirestoreError, OperationType } from '../../../lib/firestoreUtils';

export const fetchDraftsOnce = async (userId: string) => {
  try {
    const q = query(collection(db, 'drafts'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const loadedDrafts: QuizQuestion[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      loadedDrafts.push({ ...data, id: doc.id } as QuizQuestion);
    });
    // Cache to localStorage
    localStorage.setItem(`drafts_${userId}`, JSON.stringify(loadedDrafts));
    return loadedDrafts;
  } catch (error: any) {
    if (error.message?.includes('Quota') || error.message?.includes('quota')) {
      const cached = localStorage.getItem(`drafts_${userId}`);
      if (cached) return JSON.parse(cached);
    }
    handleFirestoreError(error, OperationType.GET, 'drafts');
    return [];
  }
};

export const subscribeToDrafts = (userId: string, callback: (drafts: QuizQuestion[]) => void) => {
  const q = query(collection(db, 'drafts'), where('userId', '==', userId));
  return onSnapshot(q, (querySnapshot) => {
    const loadedDrafts: QuizQuestion[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      loadedDrafts.push({ ...data, id: doc.id } as QuizQuestion);
    });
    localStorage.setItem(`drafts_${userId}`, JSON.stringify(loadedDrafts));
    callback(loadedDrafts);
  }, (error: any) => {
    const errorMsg = error?.message || String(error);
    if (errorMsg.includes('Quota') || errorMsg.includes('quota')) {
      console.warn("Drafts subscription: Quota exceeded, using cache.");
    } else {
      console.error("Drafts subscription error:", error);
    }
    const cached = localStorage.getItem(`drafts_${userId}`);
    if (cached) callback(JSON.parse(cached));
  });
};

export const saveDraft = async (userId: string, draft: QuizQuestion) => {
  try {
    await setDoc(doc(db, 'drafts', draft.id), {
      ...draft,
      userId: userId,
      status: 'draft',
      createdAt: (draft as any).createdAt || serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'drafts/' + draft.id);
  }
};

export const deleteDraft = async (id: string) => {
  try {
    console.log('Deleting draft with ID:', id);
    await deleteDoc(doc(db, 'drafts', id));
    console.log('Successfully deleted draft:', id);
  } catch (error) {
    console.error('Error deleting draft:', id, error);
    handleFirestoreError(error, OperationType.DELETE, 'drafts/' + id);
  }
};

export const batchSaveDrafts = async (userId: string, drafts: QuizQuestion[]) => {
  try {
    const batch = writeBatch(db);
    drafts.forEach(d => {
      const docRef = doc(db, 'drafts', d.id);
      batch.set(docRef, {
        ...d,
        userId: userId,
        status: 'draft',
        createdAt: serverTimestamp()
      });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'drafts');
  }
};
