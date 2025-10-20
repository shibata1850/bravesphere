import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV } from './_core/env';

const supabaseUrl = ENV.supabaseUrl;
const supabaseAnonKey = ENV.supabaseAnonKey;

let supabaseAdmin: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
} else {
  console.warn('Missing Supabase environment variables (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY), authentication will not work');
}

export { supabaseAdmin };

