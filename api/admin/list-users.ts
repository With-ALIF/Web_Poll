import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing authorization header" });

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { data: adminProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminProfile?.role !== 'admin') {
      return res.status(403).json({ error: "Access denied." });
    }

    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    // Fetch all profiles. Using a large limit just in case.
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*, profile_permissions(*)')
      .limit(2000);
      
    if (profileError) throw profileError;

    const profileMap = (profiles || []).reduce((acc: any, p: any) => {
      acc[p.id] = p;
      return acc;
    }, {});

    const mergedUsers = authUsers.map(u => {
      const dbProfile = profileMap[u.id] || {};
      const stats = {
        generated: dbProfile.total_generated || 0,
        sent: dbProfile.total_sent || 0
      };

      const perms = [];
      if (dbProfile.profile_permissions) {
        const p = Array.isArray(dbProfile.profile_permissions) ? dbProfile.profile_permissions[0] : dbProfile.profile_permissions;
        if (p) {
          if (p.polls) perms.push('polls');
          if (p.drafts) perms.push('drafts');
          if (p.formats) perms.push('formats');
          if (p.csv_modifier) perms.push('csv-modifier');
          if (p.ocr) perms.push('ocr');
          if (p.photocard) perms.push('photocard');
          if (p.exam_paper) perms.push('exam-paper');
          if (p.note) perms.push('note');
          if (p.suffix_edit) perms.push('suffix-edit');
          if (p.qbs) perms.push('qbs');
        }
      }
      
      return {
        ...u,
        displayName: dbProfile.display_name || u.user_metadata?.full_name || u.email?.split('@')[0] || 'Anonymous',
        photoURL: dbProfile.photo_url || u.user_metadata?.avatar_url || '',
        role: dbProfile.role || 'user',
        permissions: perms,
        stats: stats,
        createdAt: u.created_at ? { seconds: Math.floor(new Date(u.created_at).getTime() / 1000) } : { seconds: 0 }
      };
    });

    res.status(200).json({ users: mergedUsers });
  } catch (err: any) {
    console.error("Error in list-users API:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}
