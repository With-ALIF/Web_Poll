import { createClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://cvmmpnpvstrwgfmhfplw.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bW1wbnB2c3Ryd2dmbWhmcGx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NzI3MDQsImV4cCI6MjA5NzM0ODcwNH0.v0almOw_atds8v44EXDiwnAMPE9EhHg8WE4YltTDbzM';

let envSupaUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
if (!envSupaUrl || envSupaUrl.includes('ais-dev') || envSupaUrl.includes('ais-pre') || envSupaUrl.includes('guwimglpjxstczuocary') || !envSupaUrl.includes('.supabase.co')) {
  envSupaUrl = DEFAULT_URL;
}
export const SUPABASE_URL = envSupaUrl;

let envSupaAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
if (!envSupaAnonKey || envSupaAnonKey.includes('VITE_SUPABASE_ANON_KEY') || envSupaAnonKey.includes('guwimglpjxstczuocary')) {
  envSupaAnonKey = DEFAULT_ANON_KEY;
}
export const SUPABASE_ANON_KEY = envSupaAnonKey;

let envSupaRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
if (!envSupaRoleKey || envSupaRoleKey.includes('guwimglpjxstczuocary') || envSupaRoleKey === 'undefined') {
  envSupaRoleKey = SUPABASE_ANON_KEY;
}
export const SUPABASE_SERVICE_ROLE_KEY = envSupaRoleKey;

export function getSupabaseAdmin() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export function getSupabaseUserClient(token?: string) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  });
}
