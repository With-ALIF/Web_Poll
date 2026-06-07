import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../../backend/firebase';
import { Note } from '../../../types';
import { handleFirestoreError, OperationType } from '../../../lib/firestoreUtils';

const COLLECTION_NAME = 'notes';

export async function fetchUserNotes(userId: string): Promise<Note[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const notes: Note[] = [];
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      notes.push({
        id: docSnap.id,
        userId: data.userId,
        title: data.title || 'Untitled Note',
        rawInput: data.rawInput || '',
        formattedContent: data.formattedContent || '',
        status: data.status || 'draft',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      } as Note);
    });
    return notes;
  } catch (error: any) {
    console.error("Error in fetchUserNotes:", error);
    try {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    } catch (_) {}
    return [];
  }
}
