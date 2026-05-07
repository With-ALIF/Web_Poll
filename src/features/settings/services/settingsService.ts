import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../backend/firebase';
import { TelegramSettings } from '../../../types';
import { handleFirestoreError, OperationType } from '../../../lib/firestoreUtils';

export const fetchSettings = async (userId: string) => {
  try {
    console.log("Fetching settings for:", userId);
    const docRef = doc(db, 'settings', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as TelegramSettings;
      localStorage.setItem(`settings_${userId}`, JSON.stringify(data));
      return data;
    }
    return null;
  } catch (error: any) {
    if (error.message?.includes('Quota') || error.message?.includes('quota')) {
      const cached = localStorage.getItem(`settings_${userId}`);
      if (cached) return JSON.parse(cached);
    }
    handleFirestoreError(error, OperationType.GET, 'settings/' + userId);
  }
};

export const saveSettings = async (userId: string, settings: TelegramSettings) => {
  try {
    console.log("Saving settings for:", userId);
    
    // Remove undefined values to prevent Firestore errors
    const sanitizedSettings = JSON.parse(JSON.stringify(settings));
    
    await setDoc(doc(db, 'settings', userId), {
      ...sanitizedSettings,
      userId: userId,
      updatedAt: serverTimestamp()
    });
    console.log("Settings saved successfully");
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'settings/' + userId);
  }
};
