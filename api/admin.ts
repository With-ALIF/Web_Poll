import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, getSupabaseAdmin } from './supabaseClient.js';

async function verifyAdmin(req: any): Promise<boolean> {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'] || req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error("verifyAdmin: Missing or invalid authorization header");
      return false;
    }
    const token = authHeader.substring(7).trim();
    if (!token) {
      console.error("verifyAdmin: Empty token");
      return false;
    }

    // Direct, clean supabase client creation matching server.ts exactly
    const instance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const { data: { user }, error } = await instance.auth.getUser(token);
    if (error || !user) {
      console.error("verifyAdmin: Failed to getUser from token:", error?.message);
      return false;
    }

    const admins = ["alifweb@gmail.com", "alifbrur16@gmail.com"];
    if (admins.map(a => a.toLowerCase()).includes(user.email?.toLowerCase() || '')) {
      return true;
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
    return profile?.role === 'admin';
  } catch (err: any) {
    console.error("verifyAdmin: unexpected error:", err);
    return false;
  }
}

export default async function handler(req: any, res: any) {
  const urlObj = new URL(req.url || '', 'http://localhost');
  const pathname = urlObj.pathname;
  
  // Extract action robustly from query params, url query params, or URL path parts
  let action = req.query?.action || urlObj.searchParams.get('action');
  
  if (!action) {
    const parts = pathname.split('/');
    // Check from right to left for a valid action name
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      if (p && p !== 'api' && p !== 'admin') {
        action = p;
        break;
      }
    }
  }

  if (!action) {
    return res.status(400).json({ error: "Action is required." });
  }

  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: "Access denied." });
    }

    const supabaseAdmin = getSupabaseAdmin();

    switch (action) {
      case 'save-config': {
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
        const { key, value } = req.body;
        if (!key || !value) {
          return res.status(400).json({ error: "Invalid configuration data. Key and value are required." });
        }
        const { error } = await supabaseAdmin
          .from('system_config')
          .upsert({ 
            key, 
            updated_by: value.updated_by || 'Admin',
            default_suffix: value.default_suffix,
            updated_at: new Date().toISOString() 
          }, { onConflict: 'key' });
          
        if (error) throw error;
        return res.status(200).json({ success: true, message: "Configuration saved successfully." });
      }

      case 'list-users': {
        if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
        const { data: profiles, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('*, profile_permissions(*)')
          .limit(2000);
          
        if (profileError) throw profileError;

        const mergedUsers = (profiles || []).map((profile: any) => {
          const stats = {
            generated: profile.total_generated || 0,
            sent: profile.total_sent || 0
          };
          
          const perms: string[] = [];
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

        return res.status(200).json({ users: mergedUsers });
      }

      case 'create-user': {
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
        const { email, displayName, password, permissions } = req.body;
        if (!email) {
          return res.status(400).json({ error: "Email is required." });
        }

        const finalPassword = password || Math.random().toString(36).slice(-8);

        const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: finalPassword,
          email_confirm: true,
          user_metadata: { role: 'user', full_name: displayName }
        });

        if (createError) {
          return res.status(400).json({ error: createError.message });
        }

        const createdUser = userData.user;
        if (!createdUser) {
          return res.status(500).json({ error: "Could not create user account." });
        }

        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: createdUser.id,
            email: createdUser.email,
            display_name: displayName || '',
            photo_url: '',
            role: 'user'
          });

        if (profileError) {
          console.error("Warning: Profile record creation failed:", profileError.message);
        }

        const permObj = {
          id: createdUser.id,
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

        const { error: permConfigError } = await supabaseAdmin
          .from('profile_permissions')
          .upsert(permObj);

        if (permConfigError) {
          console.error("Warning: Permissions config creation failed:", permConfigError.message);
        }

        return res.status(200).json({
          success: true,
          user: {
            id: createdUser.id,
            email: createdUser.email,
            displayName: displayName,
            password: finalPassword
          }
        });
      }

      case 'delete-user': {
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
        const { userId } = req.body;
        if (!userId) {
          return res.status(400).json({ error: "User ID is required." });
        }

        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteError) {
          return res.status(400).json({ error: deleteError.message });
        }

        return res.status(200).json({ success: true, message: "User deleted successfully" });
      }

      case 'reset-password': {
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
        const { userId, newPassword } = req.body;
        if (!userId || !newPassword) {
          return res.status(400).json({ error: "User ID and new password are required." });
        }

        const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: newPassword
        });

        if (resetError) {
          return res.status(400).json({ error: resetError.message });
        }

        return res.status(200).json({ success: true, message: "Password reset successfully" });
      }

      case 'update-permissions': {
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
        const { userId, permissions } = req.body;
        if (!userId) {
          return res.status(400).json({ error: "User ID is required." });
        }

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
      }

      default: {
        return res.status(404).json({ error: "Action not found" });
      }
    }
  } catch (err: any) {
    console.error(`Error in admin API action ${action}:`, err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
