import { supabase } from '../../../lib/supabase';
import { Note } from '../../../types';

const TABLE_NAME = 'notes';

export async function saveNote(note: Note): Promise<void> {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert({
        id: note.id,
        user_id: note.userId,
        title: note.title,
        raw_input: note.rawInput,
        formatted_content: note.formattedContent,
        status: note.status,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  } catch (error: any) {
    console.error("Error in saveNote:", error);
    throw error;
  }
}
