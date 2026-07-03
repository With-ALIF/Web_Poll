const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = 'https://cvmmpnpvstrwgfmhfplw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bW1wbnB2c3Ryd2dmbWhmcGx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NzI3MDQsImV4cCI6MjA5NzM0ODcwNH0.v0almOw_atds8v44EXDiwnAMPE9EhHg8WE4YltTDbzM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('system_config').select('*');
  console.log("PUBLIC_CONFIG_ALL_DATA", JSON.stringify(data, null, 2));
  console.log("PUBLIC_CONFIG_ERROR", JSON.stringify(error, null, 2));
}
run();
