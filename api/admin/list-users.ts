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

    // Fetch all profiles. Using a large limit just in case.
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*, profile_permissions(*)')
      .limit(2000);
      
    if (profileError) throw profileError;

    const mergedUsers = (profiles || [])
      .filter((profile: any) => {
        // Only show users created by admin (they have profile_permissions) or if they are admin themselves
        const hasPermissions = profile.profile_permissions && 
          (Array.isArray(profile.profile_permissions) 
            ? profile.profile_permissions.length > 0 
            : Object.keys(profile.profile_permissions).length > 0);
            
        return hasPermissions || profile.role === 'admin';
      })
      .map((profile: any) => {
      const stats = {
        generated: profile.total_generated || 0,
        sent: profile.total_sent || 0
      };

      const perms = [];
      if (profile.profile_permissions) {
        const p = Array.isArray(profile.profile_permissions) ? profile.profile_permissions[0] : profile.profile_permissions;
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
        id: profile.id,
        email: profile.email || '',
        displayName: profile.display_name || (profile.email ? profile.email.split('@')[0] : 'Anonymous'),
        photoURL: profile.photo_url || '',
        role: profile.role || 'user',
        permissions: perms,
        stats: stats,
        createdAt: profile.created_at ? { seconds: Math.floor(new Date(profile.created_at).getTime() / 1000) } : { seconds: 0 }
      };
    });

    res.status(200).json({ users: mergedUsers });
  } catch (err: any) {
    console.error("Error in list-users API:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}
