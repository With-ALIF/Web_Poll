import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

async function verifyAdmin(req: any): Promise<boolean> {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("verifyAdmin: Missing or invalid auth header");
      return false;
    }
    const token = authHeader.substring(7).trim();
    if (!token) {
        console.log("verifyAdmin: Missing token");
        return false;
    }

    const instance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { user }, error } = await instance.auth.getUser(token);
    if (error || !user) {
      console.log("verifyAdmin: Error getting user from token or no user", error?.message);
      return false;
    }

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
    console.log("verifyAdmin: Error", err);
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
      return res.status(403).json({ error: "Access denied. Only admins can create users." });
    }

    const { email, displayName, password, permissions } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const finalPassword = password || Math.random().toString(36).slice(-8);

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

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

    const { error: permConfigError } = await supabaseAdmin
      .from('system_config')
      .upsert({
        key: `permissions_${createdUser.id}`,
        value: { permissions: permissions || [] }
      }, { onConflict: 'key' });

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
  } catch (err: any) {
    console.error("Error in /api/admin/create-user:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
