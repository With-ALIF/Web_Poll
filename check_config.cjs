const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log("Attempting upsert...");
  const { data: upsertData, error: upsertError } = await supabaseAdmin
    .from('system_config')
    .upsert({
      key: 'config',
      default_suffix: 'Test Suffix ' + new Date().toISOString(),
      updated_by: 'Test Script',
      updated_at: new Date().toISOString()
    });
  
  if (upsertError) {
    console.error("UPSERT_ERROR", JSON.stringify(upsertError, null, 2));
  } else {
    console.log("UPSERT_SUCCESS");
  }

  const { data, error } = await supabaseAdmin.from('system_config').select('*');
  console.log("SYSTEM_CONFIG_AFTER_UPSERT", JSON.stringify(data, null, 2));
}
run();
