import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing authorization header" });

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) return res.status(401).json({ error: "Invalid token" });

    const { data: adminProfile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
    if (adminProfile?.role !== 'admin') return res.status(403).json({ error: "Access denied." });

    const { key, value } = req.body;
    if (!key || !value) return res.status(400).json({ error: "Invalid configuration data. Key and value are required." });

    const { error } = await supabaseAdmin
      .from('system_config')
      .upsert({ key, value, updated_at: new Date().toISOString() });
    
    if (error) throw error;
    
    res.status(200).json({ success: true, message: "Configuration saved successfully." });
  } catch (err: any) {
    console.error("Error in save-config API:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}
