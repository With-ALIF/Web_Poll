import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, getSupabaseAdmin } from './supabaseClient.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const keyToUse = SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY;
    
    if (!keyToUse || !SUPABASE_URL) {
      console.warn("Supabase keys are missing. Returning default fallback config.");
      return res.status(200).json({
        default_suffix: '{{  join: https://t.me/SOT_Academy}}',
        updated_by: 'System',
        updated_at: new Date().toISOString()
      });
    }

    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('system_config')
      .select('updated_by, default_suffix, updated_at')
      .eq('key', 'config')
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    if (!data) {
      return res.status(200).json({
        default_suffix: '{{  join: https://t.me/SOT_Academy}}',
        updated_by: 'System',
        updated_at: new Date().toISOString()
      });
    }

    // Always ensure a default suffix if the DB returns empty string
    if (!data.default_suffix || data.default_suffix.trim() === '') {
        data.default_suffix = '{{  join: https://t.me/SOT_Academy}}';
    }

    res.status(200).json(data);
  } catch (err: any) {
    console.error("Error in app-config API:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}
