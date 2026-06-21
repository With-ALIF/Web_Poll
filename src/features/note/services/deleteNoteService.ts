import { supabase } from '../../../lib/supabase';

const TABLE_NAME = 'notes';

export async function deleteNote(noteId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', noteId);

    if (error) throw error;
  } catch (error: any) {
    console.error("Error in deleteNote:", error);
    throw error;
  }
}
