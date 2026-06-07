import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../backend/firebase';
import { handleFirestoreError, OperationType } from '../../../lib/firestoreUtils';

const COLLECTION_NAME = 'notes';

export async function deleteNote(noteId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, noteId);
    await deleteDoc(docRef);
  } catch (error: any) {
    console.error("Error in deleteNote:", error);
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${noteId}`);
  }
}
