import { db } from '../../../backend/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const CONFIG_DOC_PATH = 'system/config';

export interface AppConfig {
  defaultSuffix: string;
  updatedAt: any;
  updatedBy: string;
}

export const fetchAppConfig = async (): Promise<AppConfig | null> => {
  try {
    const docRef = doc(db, CONFIG_DOC_PATH);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as AppConfig;
      localStorage.setItem('app_config', JSON.stringify(data));
      return data;
    }
    return null;
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    if (errorMsg.includes('Quota') || errorMsg.includes('quota')) {
      console.warn("Fetch App Config: Quota exceeded, using cache.");
      const cached = localStorage.getItem('app_config');
      if (cached) return JSON.parse(cached);
    } else {
      console.error("Error fetching app config:", error);
    }
    return null;
  }
};

export const saveAppConfig = async (config: AppConfig): Promise<boolean> => {
  try {
    const docRef = doc(db, CONFIG_DOC_PATH);
    await setDoc(docRef, config);
    return true;
  } catch (error) {
    console.error("Error saving app config:", error);
    return false;
  }
};
