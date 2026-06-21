import { supabase } from '../../../lib/supabase';
import { Note } from '../../../types';

const TABLE_NAME = 'notes';

export async function fetchUserNotes(userId: string): Promise<Note[]> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      title: item.title || 'Untitled Note',
      rawInput: item.raw_input || '',
      formattedContent: item.formatted_content || '',
      status: item.status || 'draft',
      createdAt: item.created_at,
      updatedAt: item.updated_at
    })) as Note[];
  } catch (error: any) {
    console.error("Error in fetchUserNotes:", error);
    return [];
  }
}
