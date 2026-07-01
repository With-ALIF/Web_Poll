import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import webhookHandler from "./api/webhook.ts";
import setupHandler from "./api/setup.ts";
import formatNoteHandler from "./api/formatNote.ts";
import quizHandler from "./api/quiz.ts";
import photocardHandler from "./api/photocard.ts";
import examPaperHandler from "./api/examPaper.ts";

dotenv.config({ override: true });

const DEFAULT_URL = 'https://cvmmpnpvstrwgfmhfplw.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bW1wbnB2c3Ryd2dmbWhmcGx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NzI3MDQsImV4cCI6MjA5NzM0ODcwNH0.v0almOw_atds8v44EXDiwnAMPE9EhHg8WE4YltTDbzM';

let envSupaUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
if (!envSupaUrl || envSupaUrl.includes('ais-dev') || envSupaUrl.includes('ais-pre') || envSupaUrl.includes('guwimglpjxstczuocary') || !envSupaUrl.includes('.supabase.co')) {
  envSupaUrl = DEFAULT_URL;
}
const SUPABASE_URL = envSupaUrl;

let envSupaAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
if (!envSupaAnonKey || envSupaAnonKey.includes('VITE_SUPABASE_ANON_KEY') || envSupaAnonKey.includes('guwimglpjxstczuocary')) {
  envSupaAnonKey = DEFAULT_ANON_KEY;
}
const SUPABASE_ANON_KEY = envSupaAnonKey;

let envSupaRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
if (!envSupaRoleKey || envSupaRoleKey.includes('guwimglpjxstczuocary')) {
  envSupaRoleKey = SUPABASE_ANON_KEY;
}
const SUPABASE_SERVICE_ROLE_KEY = envSupaRoleKey;

async function initSupabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("⚠️ [WARNING] Supabase URL or Service Role Key is missing in environment variables. The server will run, but admin user creation and verification will be unavailable. Please add them to your Secrets in Settings.");
    return;
  }

  try {
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Test connection first
    const { data: userData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      if (listError.message?.includes('getaddrinfo') || listError.message?.includes('fetch failed')) {
        console.error("❌ Connection Failed: Could not reach Supabase. Please check your VITE_SUPABASE_URL.");
      } else {
        console.error("❌ Supabase Admin Error:", listError.message);
      }
      return;
    }

    const users = userData.users || [];
    const adminsToCreate = [
      { email: "alifweb@gmail.com", pass: "12305016", name: "Super Admin" },
      { email: "alifbrur16@gmail.com", pass: "12305016", name: "Admin Alif" }
    ];

    for (const admin of adminsToCreate) {
      const existing = users.find(u => u.email?.toLowerCase() === admin.email.toLowerCase());
      if (!existing) {
        console.log(`🆕 Admin user ${admin.email} not found, creating...`);
        const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: admin.email,
          password: admin.pass,
          email_confirm: true,
          user_metadata: { role: 'admin', full_name: admin.name }
        });

        if (createError) {
          console.error(`❌ Error creating admin user ${admin.email}:`, createError.message);
        } else if (userData.user) {
          console.log(`✅ Admin user ${admin.email} created successfully:`, userData.user.id);
          // Also create profile
          await supabaseAdmin.from('profiles').upsert({
            id: userData.user.id,
            email: admin.email,
            display_name: admin.name,
            role: 'admin'
          });
        }
      } else {
        console.log(`✅ Admin user ${admin.email} already exists with ID:`, existing.id);
        // Ensure profile exists for existing admin
        await supabaseAdmin.from('profiles').upsert({
          id: existing.id,
          email: admin.email,
          display_name: existing.user_metadata?.full_name || admin.name,
          role: 'admin'
        });
      }
    }
  } catch (error: any) {
    console.error("❌ Unexpected error in initSupabaseAdmin:", error.message || error);
  }
}

async function verifyAdmin(req: express.Request): Promise<boolean> {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("verifyAdmin: Missing or invalid auth header");
      return false;
    }
    const token = authHeader.substring(7).trim();
    if (!token) {
        console.log("verifyAdmin: Missing token");
        return false;
    }

    // Use full target Supabase client for token validation
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

    if (profile?.role !== 'admin') {
        console.log("verifyAdmin: User is not admin", user.email, profile?.role);
    }
    return profile?.role === 'admin';
  } catch (err) {
    console.log("verifyAdmin: Error", err);
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Supabase Admin for user management
  await initSupabaseAdmin();

  // Global Health Checks (Must be at the top to satisfy deployment probes)
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.all("/", (req, res, next) => {
    const ua = req.headers['user-agent'] || '';
    if (ua.includes('UptimeRobot') || ua.includes('GoogleHC') || req.query.ping) {
      return res.status(200).send("OK");
    }
    next();
  });

  app.use("/api", express.json({ limit: '10mb' })); // support larger image base64 uploads
  
  // Supabase Proxy Route to prevent "Failed to fetch" due to browser shield/cross-origin iframe blocks
  app.all("/api/supabase-proxy*", async (req, res) => {
    const prefix = "/api/supabase-proxy";
    const subpath = req.path.startsWith(prefix) ? req.path.substring(prefix.length) : req.path;
    const cleanSubpath = ('/' + subpath).replace(/\/+/g, '/');
    
    const queryStr = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const cleanSupabaseUrl = SUPABASE_URL.replace(/\/+$/, '');
    if (!cleanSupabaseUrl) {
      console.error("[Proxy] ERROR: SUPABASE_URL is not configured. SUPABASE_URL:", SUPABASE_URL, ", VITE_SUPABASE_URL:", process.env.VITE_SUPABASE_URL);
      return res.status(500).json({ error: "Supabase URL is not configured." });
    }
    const targetUrl = `${cleanSupabaseUrl}${cleanSubpath}${queryStr}`;

    console.log(`[Proxy] Routing ${req.method} ${req.url} -> ${targetUrl}. CleanSupabaseUrl: ${cleanSupabaseUrl}`);

    try {
      const headers: Record<string, string> = {};
      const excludedHeaders = ['host', 'origin', 'referer', 'content-length', 'accept-encoding', 'connection'];
      
      for (const [key, value] of Object.entries(req.headers)) {
        if (value && typeof value === 'string' && !excludedHeaders.includes(key.toLowerCase())) {
          headers[key] = value;
        }
      }

      // Automatically inject and normalize valid API keys to protect against stale/mismatching keys in client env
      const incomingApiKey = req.headers['apikey'] as string;
      const cleanAnonKey = SUPABASE_ANON_KEY.trim();
      
      headers['apikey'] = cleanAnonKey;
      
      const authHeader = req.headers['authorization'] as string;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim();
        // If the bearer token matches the client's public api key or is stale, it's a guest request. Translate it to the known working anon key.
        if (token === incomingApiKey || token === 'VITE_SUPABASE_ANON_KEY' || token.includes('guwimglpjxstczuocary') || token.includes('VITE_SUPABASE_ANON_KEY')) {
          headers['authorization'] = `Bearer ${cleanAnonKey}`;
        }
      } else if (!authHeader) {
        headers['authorization'] = `Bearer ${cleanAnonKey}`;
      }

      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      if (clientIp) {
        headers['x-forwarded-for'] = typeof clientIp === 'string' ? clientIp : clientIp[0];
      }

      const init: RequestInit = {
        method: req.method,
        headers: headers,
      };

      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        if (req.body) {
          if (typeof req.body === 'string') {
            init.body = req.body;
          } else if (Buffer.isBuffer(req.body)) {
            init.body = req.body;
          } else if (Object.keys(req.body).length > 0) {
            init.body = JSON.stringify(req.body);
          }
        }
      }

      let response: Response | null = null;
      let lastError: any = null;
      const maxAttempts = 3;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          response = await fetch(targetUrl, init);
          break; // successfully fetched, break retry loop
        } catch (error: any) {
          lastError = error;
          console.warn(`[Proxy] Fetch attempt ${attempt} failed for ${targetUrl}: ${error?.message || error}`);
          if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 300 * attempt));
          }
        }
      }

      if (!response) {
        throw lastError || new Error("Failed after maximum retries");
      }
      
      console.log(`[Proxy] Target response status: ${response.status} for ${targetUrl}`);

      response.headers.forEach((value, key) => {
        if (!['content-encoding', 'transfer-encoding', 'connection', 'content-length'].includes(key.toLowerCase())) {
          res.setHeader(key, value);
        }
      });

      res.status(response.status);
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (error: any) {
      console.error("❌ Supabase Proxy Error (FETCH FAILED):", {
        message: error.message,
        stack: error.stack,
        url: targetUrl,
        method: req.method
      });
      res.status(500).json({ error: error.message || "Internal Supabase Proxy Error" });
    }
  });
  
  app.post("/api/webhook", (req, res) => webhookHandler(req, res));
  app.get("/api/setup", (req, res) => setupHandler(req, res));
  app.post("/api/note/format", (req, res) => formatNoteHandler(req, res));
  app.post("/api/formatNote", (req, res) => formatNoteHandler(req, res));
  app.post("/api/quiz/generate", (req, res) => quizHandler(req, res));
  app.post("/api/quiz/generateFromImage", (req, res) => quizHandler(req, res));
  app.post("/api/photocard/generateOptions", (req, res) => photocardHandler(req, res));
  app.post("/api/exam-paper/generate", (req, res) => examPaperHandler(req, res));
  
  app.post("/api/admin/update-permissions", async (req, res) => {
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

      if (error) throw error;
      res.status(200).json({ success: true });
    } catch (err: any) {
      console.error("Error in /api/admin/update-permissions:", err);
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  app.post("/api/admin/create-user", async (req, res) => {
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

      // 1. Create User in auth.users
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

      // 2. Insert user into public.profiles
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

      // 3. Update permissions in profile_permissions
      const { error: permConfigError } = await supabaseAdmin
        .from('profile_permissions')
        .upsert(permObj);

      if (permConfigError) {
        console.error("Warning: Permissions config creation failed:", permConfigError.message);
      }

      res.status(200).json({
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
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  app.post("/api/admin/delete-user", async (req, res) => {
    try {
      const isAdmin = await verifyAdmin(req);
      if (!isAdmin) {
        return res.status(403).json({ error: "Access denied. Only admins can delete users." });
      }

      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required." });
      }

      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      // 1. Delete from profiles
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.warn("Warning: Profile record deletion failed or user has no profile:", profileError.message);
      }

      // 2. Delete from auth.users (use admin client)
      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (deleteAuthError) {
        console.error("Auth user deletion failed:", deleteAuthError.message);
        return res.status(400).json({ error: deleteAuthError.message });
      }

      res.status(200).json({ success: true });
    } catch (err: any) {
      console.error("Error in /api/admin/delete-user:", err);
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  app.post("/api/admin/reset-password", async (req, res) => {
    try {
      const isAdmin = await verifyAdmin(req);
      if (!isAdmin) {
        return res.status(403).json({ error: "Access denied. Admin privileges required." });
      }

      const { userId, newPassword } = req.body;
      if (!userId || !newPassword) {
        return res.status(400).json({ error: "User ID and new password are required." });
      }

      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      );

      if (updateError) {
        return res.status(400).json({ error: updateError.message });
      }

      return res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (err: any) {
      console.error("Error in /api/admin/reset-password:", err);
      return res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  app.get("/api/admin/list-users", async (req, res) => {
    try {
      const isAdmin = await verifyAdmin(req);
      if (!isAdmin) {
        return res.status(403).json({ error: "Access denied." });
      }

      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      // Fetch users from Auth
      const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
      if (authError) throw authError;

      // Fetch profiles from DB
      const { data: profiles, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*, profile_permissions(*)');
      
      if (profileError) throw profileError;

      const profileMap = (profiles || []).reduce((acc: any, p: any) => {
        acc[p.id] = p;
        return acc;
      }, {});

      const mergedUsers = authUsers
        .filter(u => {
          const profile = profileMap[u.id];
          if (!profile) return false;
          
          // Only show users who have a record in profile_permissions (i.e. created via TeleQuiz admin)
          // or if they are an admin.
          const hasPermissions = Array.isArray(profile.profile_permissions) 
            ? profile.profile_permissions.length > 0 
            : !!profile.profile_permissions;
            
          return hasPermissions || profile.role === 'admin';
        })
        .map(u => {
        const profile = profileMap[u.id];
        
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
          ...u,
          displayName: profile.display_name || u.user_metadata?.full_name || u.email?.split('@')[0] || 'Anonymous',
          photoURL: profile.photo_url || u.user_metadata?.avatar_url || '',
          role: profile.role || 'user',
          permissions: perms,
          stats: { 
            generated: profile.total_generated || 0, 
            sent: profile.total_sent || 0 
          },
          createdAt: u.created_at ? { seconds: Math.floor(new Date(u.created_at).getTime() / 1000) } : { seconds: 0 }
        };
      });

      res.status(200).json({ users: mergedUsers });
    } catch (err: any) {
      console.error("Error in /api/admin/list-users:", err);
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  app.post("/api/admin/save-config", async (req, res) => {
    try {
      const isAdmin = await verifyAdmin(req);
      if (!isAdmin) {
        return res.status(403).json({ error: "Access denied." });
      }

      const { key, value } = req.body;
      if (!key) {
        return res.status(400).json({ error: "Key is required." });
      }

      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      const { error } = await supabaseAdmin
        .from('system_config')
        .upsert({
          key,
          updated_by: value.updated_by || 'Admin',
          default_suffix: value.default_suffix || '',
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (error) throw error;
      res.status(200).json({ success: true });
    } catch (err: any) {
      console.error("Error in /api/admin/save-config:", err);
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  });
  
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("Frontend server started (Bot is now handled via Vercel Webhook)");
  });
}

startServer();
