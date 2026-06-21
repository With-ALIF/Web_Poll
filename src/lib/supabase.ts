/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://cvmmpnpvstrwgfmhfplw.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bW1wbnB2c3Ryd2dmbWhmcGx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NzI3MDQsImV4cCI6MjA5NzM0ODcwNH0.v0almOw_atds8v44EXDiwnAMPE9EhHg8WE4YltTDbzM';

const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const isStaleUrl = !envUrl || envUrl.includes('guwimglpjxstczuocary') || envUrl.includes('ais-dev') || envUrl.includes('ais-pre') || !envUrl.includes('.supabase.co');

export const configuredUrl = isStaleUrl ? DEFAULT_URL : envUrl;

const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const isStaleAnonKey = isStaleUrl || !envAnonKey || envAnonKey.includes('guwimglpjxstczuocary') || envAnonKey.includes('VITE_SUPABASE_ANON_KEY');

export const configuredAnonKey = isStaleAnonKey ? DEFAULT_ANON_KEY : envAnonKey;

export const isConfigured = true;

if (!isConfigured) {
  console.warn('⚠️ Supabase configuration is missing in the browser environment.');
  console.warn('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in Settings > Secrets.');
}

export const supabase = createClient(
  configuredUrl || 'https://placeholder.supabase.co', 
  configuredAnonKey || 'placeholder-key'
);

