import { supabase } from '../../../lib/supabase';
import { generateUUID } from '../../../lib/uuid';

const TABLE_NAME = 'poll_rapid';

export interface PollRapidItem {
  id: string;
  user_id?: string;
  question: string;
  topic?: string;
  subject?: string;
  created_at?: string;
}

/**
 * Save a single rapid fire question to poll_rapid table in Supabase
 */
export const saveRapidQuestion = async (
  userId: string, 
  questionText: string, 
  topic: string = 'General',
  subject: string = ''
): Promise<boolean> => {
  try {
    const id = generateUUID();
    const payload: Record<string, any> = {
      id,
      user_id: userId,
      question: questionText.trim(),
      topic: topic.trim() || 'General',
      created_at: new Date().toISOString()
    };

    if (subject.trim()) {
      payload.subject = subject.trim();
    }

    const { error } = await supabase
      .from(TABLE_NAME)
      .insert(payload);

    if (error) {
      console.warn(`[poll_rapid] insert notice:`, error.message);
      return false;
    }
    return true;
  } catch (error: any) {
    console.warn('[poll_rapid] error saving single question:', error);
    return false;
  }
};

/**
 * Batch save rapid fire questions to poll_rapid table in Supabase
 */
export const batchSaveRapidQuestions = async (
  userId: string, 
  questions: Array<{ question: string; topic?: string; subject?: string }>,
  defaultTopic: string = 'Rapid Fire',
  defaultSubject: string = ''
): Promise<number> => {
  if (!questions || questions.length === 0) return 0;

  try {
    const payloads = questions.map(q => {
      const p: Record<string, any> = {
        id: generateUUID(),
        user_id: userId,
        question: q.question.trim(),
        topic: (q.topic || defaultTopic || 'Rapid Fire').trim(),
        created_at: new Date().toISOString()
      };
      const sub = q.subject || defaultSubject;
      if (sub && sub.trim()) {
        p.subject = sub.trim();
      }
      return p;
    });

    const { error } = await supabase
      .from(TABLE_NAME)
      .insert(payloads);

    if (error) {
      console.warn(`[poll_rapid] batch insert notice:`, error.message);
      return 0;
    }
    return payloads.length;
  } catch (error: any) {
    console.warn('[poll_rapid] error batch saving questions:', error);
    return 0;
  }
};

/**
 * Fetch saved rapid questions from poll_rapid table
 */
export const fetchRapidQuestions = async (userId: string): Promise<PollRapidItem[]> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn(`[poll_rapid] fetch notice:`, error.message);
      return [];
    }
    return data || [];
  } catch (error: any) {
    console.warn('[poll_rapid] error fetching questions:', error);
    return [];
  }
};

/**
 * Delete a rapid question from poll_rapid table
 */
export const deleteRapidQuestion = async (id: string, userId?: string): Promise<boolean> => {
  try {
    let query = supabase.from(TABLE_NAME).delete().eq('id', id);
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { error } = await query;
    if (error) {
      console.warn(`[poll_rapid] delete notice:`, error.message);
      return false;
    }
    return true;
  } catch (error: any) {
    console.warn('[poll_rapid] error deleting question:', error);
    return false;
  }
};
