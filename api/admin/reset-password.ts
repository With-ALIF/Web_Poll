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

    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) return res.status(400).json({ error: "User ID and new password are required." });

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword });
    if (updateError) throw updateError;
    
    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Error in reset-password API:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}
