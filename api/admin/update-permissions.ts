import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

async function verifyAdmin(req: any): Promise<boolean> {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }
    const token = authHeader.substring(7).trim();
    if (!token) return false;

    const instance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { user }, error } = await instance.auth.getUser(token);
    if (error || !user) return false;

    const admins = ["alifweb@gmail.com", "alifbrur16@gmail.com"];
    if (admins.map(a => a.toLowerCase()).includes(user.email?.toLowerCase() || '')) {
      return true;
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role === 'admin';
  } catch (err) {
    return false;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: "Access denied." });
    }

    const { userId, permissions } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const permObj = {
      id: userId,
      polls: (permissions || []).includes('polls'),
      drafts: (permissions || []).includes('drafts'),
      formats: (permissions || []).includes('formats'),
      csv_modifier: (permissions || []).includes('csv-modifier'),
      ocr: (permissions || []).includes('ocr'),
      photocard: (permissions || []).includes('photocard'),
      exam_paper: (permissions || []).includes('exam-paper'),
      note: (permissions || []).includes('note'),
      suffix_edit: (permissions || []).includes('suffix-edit'),
      qbs: (permissions || []).includes('qbs'),
    };

    const { error } = await supabaseAdmin
      .from('profile_permissions')
      .upsert(permObj);

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Error in /api/admin/update-permissions:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
