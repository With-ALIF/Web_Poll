import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../backend/firebase';
import { Note } from '../../../types';
import { handleFirestoreError, OperationType } from '../../../lib/firestoreUtils';

const COLLECTION_NAME = 'notes';

export async function saveNote(note: Note): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, note.id);
    const plainNote = {
      id: note.id,
      userId: note.userId,
      title: note.title,
      rawInput: note.rawInput,
      formattedContent: note.formattedContent,
      status: note.status,
      updatedAt: serverTimestamp(),
      createdAt: note.createdAt || serverTimestamp()
    };
    await setDoc(docRef, plainNote, { merge: true });
  } catch (error: any) {
    console.error("Error in saveNote:", error);
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${note.id}`);
  }
}
