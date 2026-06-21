import { supabase } from '../../../lib/supabase';
import { QuizQuestion } from '../../../types';

const TABLE_NAME = 'drafts';

// Simple in-memory listeners to make changes reflect INSTANTLY in UI
const listeners = new Map<string, Set<(drafts: QuizQuestion[]) => void>>();

const notifyListeners = (userId: string) => {
  const userListeners = listeners.get(userId);
  if (userListeners) {
    const cached = localStorage.getItem(`drafts_${userId}`);
    if (cached) {
      try {
        const drafts = JSON.parse(cached);
        userListeners.forEach(cb => cb(drafts));
      } catch (e) {
        console.error("Failed to parse drafts for notifyListeners:", e);
      }
    }
  }
};

export const fetchDraftsOnce = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    
    // Need to map the database structure back to the QuizQuestion type
    const loadedDrafts = (data || []).map((q: any) => ({
      ...q,
      correctOptionIndex: q.correct_option_index,
    })) as unknown as QuizQuestion[];

    localStorage.setItem(`drafts_${userId}`, JSON.stringify(loadedDrafts));
    notifyListeners(userId);
    return loadedDrafts;
  } catch (error: any) {
    const cached = localStorage.getItem(`drafts_${userId}`);
    if (cached) return JSON.parse(cached);
    console.error("Error in fetchDraftsOnce:", error);
    return [];
  }
};

export const subscribeToDrafts = (userId: string, callback: (drafts: QuizQuestion[]) => void) => {
  if (!listeners.has(userId)) {
    listeners.set(userId, new Set());
  }
  listeners.get(userId)!.add(callback);

  // Initial fetch
  fetchDraftsOnce(userId).then(callback);

  const channel = supabase.channel(`drafts_${userId}`);
  
  const subscription = channel
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLE_NAME, filter: `user_id=eq.${userId}` }, async () => {
      const drafts = await fetchDraftsOnce(userId);
      callback(drafts);
    });

  subscription.subscribe((status) => {
    console.log(`[Draft API] Subscription status: ${status} for channel drafts_${userId}`);
  });

  return () => {
    const userListeners = listeners.get(userId);
    if (userListeners) {
      userListeners.delete(callback);
      if (userListeners.size === 0) {
        listeners.delete(userId);
      }
    }
    supabase.removeChannel(channel);
  };
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

export const saveDraft = async (userId: string, draft: QuizQuestion) => {
  // Update local storage first for 0ms ultra-responsive feedback
  try {
    const cached = localStorage.getItem(`drafts_${userId}`);
    let loadedDrafts: QuizQuestion[] = cached ? JSON.parse(cached) : [];
    const index = loadedDrafts.findIndex(d => d.id === draft.id);
    const updatedDraft = { ...draft, status: 'pending' as any } as QuizQuestion;
    if (index >= 0) {
      loadedDrafts[index] = updatedDraft;
    } else {
      loadedDrafts.push(updatedDraft);
    }
    localStorage.setItem(`drafts_${userId}`, JSON.stringify(loadedDrafts));
    notifyListeners(userId);
  } catch (err) {
    console.error("Failed to write draft to localStorage cache:", err);
  }

  try {
    const payload = cleanObj({
      id: draft.id,
      user_id: userId,
      type: draft.type,
      question: draft.question,
      options: draft.options,
      correct_option_index: draft.correctOptionIndex,
      explanation: draft.explanation,
      status: 'draft',
      image: draft.image,
      topic: draft.topic,
      updated_at: new Date().toISOString()
    });
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert(payload);

    if (error) throw error;
  } catch (error) {
    console.error("Error in saveDraft:", error);
  }
};

export const deleteDraft = async (id: string, userId?: string) => {
  // Update local storage first based on provided userId or scanning all user keys
  try {
    if (userId) {
      const cached = localStorage.getItem(`drafts_${userId}`);
      if (cached) {
        const loadedDrafts: QuizQuestion[] = JSON.parse(cached);
        const filtered = loadedDrafts.filter(d => d.id !== id);
        localStorage.setItem(`drafts_${userId}`, JSON.stringify(filtered));
        notifyListeners(userId);
      }
    } else {
      // Look up in all drafts keys to find where it is
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('drafts_')) {
          const uId = key.substring(7);
          const cached = localStorage.getItem(key);
          if (cached) {
            const drafts: QuizQuestion[] = JSON.parse(cached);
            if (drafts.some(d => d.id === id)) {
              const filtered = drafts.filter(d => d.id !== id);
              localStorage.setItem(key, JSON.stringify(filtered));
              notifyListeners(uId);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("Failed to delete draft from localStorage cache:", err);
  }

  try {
    console.log('Deleting draft with ID:', id);
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);
    if (error) throw error;
    console.log('Successfully deleted draft:', id);
  } catch (error) {
    console.error('Error deleting draft:', id, error);
  }
};

export const batchSaveDrafts = async (userId: string, drafts: QuizQuestion[]) => {
  // Update local storage first
  try {
    const cached = localStorage.getItem(`drafts_${userId}`);
    let loadedDrafts: QuizQuestion[] = cached ? JSON.parse(cached) : [];
    drafts.forEach(draft => {
      const index = loadedDrafts.findIndex(d => d.id === draft.id);
      const updatedDraft = { ...draft, status: 'pending' as any } as QuizQuestion;
      if (index >= 0) {
        loadedDrafts[index] = updatedDraft;
      } else {
        loadedDrafts.push(updatedDraft);
      }
    });
    localStorage.setItem(`drafts_${userId}`, JSON.stringify(loadedDrafts));
    notifyListeners(userId);
  } catch (err) {
    console.error("Failed to batch save drafts to localStorage cache:", err);
  }

  try {
    const payloads = drafts.map(d => cleanObj({
      id: d.id,
      user_id: userId,
      type: d.type,
      question: d.question,
      options: d.options,
      correct_option_index: d.correctOptionIndex,
      explanation: d.explanation,
      status: 'draft',
      image: d.image,
      topic: d.topic,
      updated_at: new Date().toISOString()
    }));
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert(payloads);
    if (error) throw error;
  } catch (error) {
    console.error("Error in batchSaveDrafts:", error);
  }
};
