import { collection, doc, setDoc, getDocs, deleteDoc, query, where, writeBatch, serverTimestamp, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../backend/firebase';
import { QuizQuestion } from '../../../types';
import { handleFirestoreError, OperationType } from '../../../lib/firestoreUtils';

export const fetchQuizzes = async (userId: string) => {
  try {
    const q = query(collection(db, 'quizzes'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const loadedQuestions: QuizQuestion[] = [];
    querySnapshot.forEach((doc) => {
      loadedQuestions.push(doc.data() as QuizQuestion);
    });
    localStorage.setItem(`quizzes_${userId}`, JSON.stringify(loadedQuestions));
    return loadedQuestions;
  } catch (error: any) {
    if (error.message?.includes('Quota') || error.message?.includes('quota')) {
      const cached = localStorage.getItem(`quizzes_${userId}`);
      if (cached) return JSON.parse(cached);
    }
    handleFirestoreError(error, OperationType.LIST, 'quizzes');
    return [];
  }
};

export const subscribeToQuizzes = (userId: string, callback: (quizzes: QuizQuestion[]) => void) => {
  const q = query(collection(db, 'quizzes'), where('userId', '==', userId));
  return onSnapshot(q, (querySnapshot) => {
    const loadedQuestions: QuizQuestion[] = [];
    querySnapshot.forEach((doc) => {
      loadedQuestions.push(doc.data() as QuizQuestion);
    });
    localStorage.setItem(`quizzes_${userId}`, JSON.stringify(loadedQuestions));
    callback(loadedQuestions);
  }, (error: any) => {
    const errorMsg = error?.message || String(error);
    if (errorMsg.includes('Quota') || errorMsg.includes('quota')) {
      console.warn("Quizzes subscription: Quota exceeded, using cache.");
    } else {
      console.error("Quizzes subscription error:", error);
    }
    const cached = localStorage.getItem(`quizzes_${userId}`);
    if (cached) callback(JSON.parse(cached));
  });
};

const cleanObj = (obj: any) => {
  const cleaned: any = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  });
  return cleaned;
};

export const saveQuiz = async (userId: string, question: QuizQuestion) => {
  try {
    const payload = cleanObj({
      ...question,
      userId: userId,
      createdAt: (question as any).createdAt || serverTimestamp()
    });
    await setDoc(doc(db, 'quizzes', question.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'quizzes/' + question.id);
  }
};

export const deleteQuiz = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'quizzes', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'quizzes/' + id);
  }
};

export const batchSaveQuizzes = async (userId: string, questions: QuizQuestion[]) => {
  try {
    const batch = writeBatch(db);
    questions.forEach(q => {
      const docRef = doc(db, 'quizzes', q.id);
      const payload = cleanObj({
        ...q,
        userId: userId,
        createdAt: serverTimestamp()
      });
      batch.set(docRef, payload);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'quizzes');
  }
};

export const updateUserStats = async (userId: string, stats: { generated: number; sent: number }) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      stats: stats
    });
  } catch (error) {
    // If update fails, try set with merge
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, { stats }, { merge: true });
    } catch (innerError) {
      handleFirestoreError(innerError, OperationType.WRITE, 'users/' + userId);
    }
  }
};

export const subscribeToUserStats = (userId: string, callback: (stats: { generated: number; sent: number }) => void) => {
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.stats) {
        localStorage.setItem(`stats_${userId}`, JSON.stringify(data.stats));
        callback(data.stats);
      } else {
        // Document exists but stats field is missing, initialize it from local cache or default to 0
        const cached = localStorage.getItem(`stats_${userId}`);
        let parsedStats = { generated: 0, sent: 0 };
        if (cached) {
          try {
            parsedStats = JSON.parse(cached);
          } catch (e) {}
        }
        updateUserStats(userId, parsedStats);
        callback(parsedStats);
      }
    } else {
      // Document does not exist yet (new account, etc.). Check and initialize from local cached stats.
      const cached = localStorage.getItem(`stats_${userId}`);
      let parsedStats = { generated: 0, sent: 0 };
      if (cached) {
        try {
          parsedStats = JSON.parse(cached);
        } catch (e) {}
      }
      if (parsedStats.generated > 0 || parsedStats.sent > 0) {
        updateUserStats(userId, parsedStats);
      }
      callback(parsedStats);
    }
  }, (error: any) => {
    const errorMsg = error?.message || String(error);
    if (errorMsg.includes('Quota') || errorMsg.includes('quota')) {
      console.warn("Stats subscription: Quota exceeded, using cache.");
    } else {
      console.error("Stats subscription error:", error);
    }
    const cached = localStorage.getItem(`stats_${userId}`);
    if (cached) callback(JSON.parse(cached));
  });
};
