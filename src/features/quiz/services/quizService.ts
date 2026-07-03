import { supabase } from '../../../lib/supabase';
import { QuizQuestion } from '../../../types';

const TABLE_NAME = 'poll_questions';

export const fetchQuizzes = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    
    // Need to map the database structure back to the QuizQuestion type
    const loadedQuestions = (data || []).map((q: any) => ({
      ...q,
      options: [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean),
      correctOptionIndex: q.correct_option_index,
    })) as unknown as QuizQuestion[];

    localStorage.setItem(`quizzes_${userId}`, JSON.stringify(loadedQuestions));
    return loadedQuestions;
  } catch (error: any) {
    const cached = localStorage.getItem(`quizzes_${userId}`);
    if (cached) return JSON.parse(cached);
    console.error("Error in fetchQuizzes:", error);
    return [];
  }
};

export const subscribeToQuizzes = (userId: string, callback: (quizzes: QuizQuestion[]) => void) => {
  // Fetch initial data
  fetchQuizzes(userId).then(callback);

  // Subscribe to changes
  const channel = supabase.channel(`quizzes_${userId}`);
  
  const subscription = channel
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLE_NAME, filter: `user_id=eq.${userId}` }, async () => {
      const quizzes = await fetchQuizzes(userId);
      callback(quizzes);
    });

  subscription.subscribe((status) => {
    console.log(`[Quiz API] Subscription status: ${status} for channel quizzes_${userId}`);
  });

  return () => {
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

export const saveQuiz = async (userId: string, question: QuizQuestion) => {
  try {
    const payload = cleanObj({
      id: question.id,
      user_id: userId,
      question: question.question,
      option_a: question.options[0] || null,
      option_b: question.options[1] || null,
      option_c: question.options[2] || null,
      option_d: question.options[3] || null,
      correct_option_index: question.correctOptionIndex,
      explanation: question.explanation,
      status: question.status,
      image: question.image,
      topic: question.topic,
      updated_at: new Date().toISOString(),
    });
    // Remove complex fields if needed or handle jsonb
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert(payload);

    if (error) throw error;
  } catch (error) {
    console.error("Error in saveQuiz:", error);
  }
};

export const deleteQuiz = async (id: string) => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error("Error in deleteQuiz:", error);
  }
};

export const batchSaveQuizzes = async (userId: string, questions: QuizQuestion[]) => {
  try {
    const payloads = questions.map(q => cleanObj({
      id: q.id,
      user_id: userId,
      question: q.question,
      option_a: q.options[0] || null,
      option_b: q.options[1] || null,
      option_c: q.options[2] || null,
      option_d: q.options[3] || null,
      correct_option_index: q.correctOptionIndex,
      explanation: q.explanation,
      status: q.status,
      image: q.image,
      topic: q.topic,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert(payloads);
    if (error) throw error;
  } catch (error) {
    console.error("Error in batchSaveQuizzes:", error);
  }
};

export const updateUserStats = async (userId: string, stats: { generated: number; sent: number }) => {
  try {
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
    if (!profile) {
      await supabase.from('profiles').upsert({ 
        id: userId, 
        total_generated: stats.generated,
        total_sent: stats.sent
      });
    } else {
      const { error } = await supabase.from('profiles').update({ 
        total_generated: stats.generated,
        total_sent: stats.sent
      }).eq('id', userId);
      if (error) throw error;
    }
  } catch (error) {
    console.error("Error in updateUserStats:", error);
  }
};

export const incrementUserStats = async (userId: string, deltas: { generated: number; sent: number }) => {
  try {
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('total_generated, total_sent, display_name, email, role, photo_url')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    const newGenerated = ((profile?.total_generated || 0) + deltas.generated);
    const newSent = ((profile?.total_sent || 0) + deltas.sent);

    if (!profile) {
      // Profile missing, upsert it
      const { error: insertError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          total_generated: newGenerated,
          total_sent: newSent
        });
      if (insertError) throw insertError;
    } else {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          total_generated: newGenerated,
          total_sent: newSent 
        })
        .eq('id', userId);
      if (updateError) throw updateError;
    }
  } catch (error) {
    console.error("Error in incrementUserStats:", error);
  }
};

export const subscribeToUserStats = (userId: string, callback: (stats: { generated: number; sent: number }) => void) => {
  // Fetch initial
  supabase
    .from('profiles')
    .select('total_generated, total_sent')
    .eq('id', userId)
    .single()
    .then(({ data }) => {
      const localStatsRaw = localStorage.getItem(`stats_${userId}`);
      let localStats = { generated: 0, sent: 0 };
      if (localStatsRaw) {
        try { localStats = JSON.parse(localStatsRaw); } catch(e){}
      }
      
      const remoteStats = {
        generated: data?.total_generated || 0,
        sent: data?.total_sent || 0
      };
      
      // Auto-heal missing remote stats if local cache is strictly higher
      if (localStats.generated > remoteStats.generated || localStats.sent > remoteStats.sent) {
        const merged = {
          generated: Math.max(localStats.generated, remoteStats.generated),
          sent: Math.max(localStats.sent, remoteStats.sent)
        };
        console.log(`Auto-healing remote stats up to local cache for ${userId}:`, merged);
        updateUserStats(userId, merged);
        callback(merged);
        localStorage.setItem(`stats_${userId}`, JSON.stringify(merged));
      } else if (data) {
        const currentStats = {
          generated: data.total_generated || 0,
          sent: data.total_sent || 0
        };
        localStorage.setItem(`stats_${userId}`, JSON.stringify(currentStats));
        callback(currentStats);
      }
    });

  const subscription = supabase
    .channel(`stats_${userId}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, payload => {
      if (payload.new) {
        const newRaw = payload.new as any;
        const stats = {
          generated: newRaw.total_generated || 0,
          sent: newRaw.total_sent || 0
        };
        localStorage.setItem(`stats_${userId}`, JSON.stringify(stats));
        callback(stats);
      }
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};
