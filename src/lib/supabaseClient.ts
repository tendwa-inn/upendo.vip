import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anon key are required.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'upendo-auth-token',
    flowType: 'pkce',
  },
  global: {
    headers: {
      'x-application-name': 'upendo-app',
    },
  },
  db: {
    schema: 'public',
  },
});

// Add error handling for network issues
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session?.user?.id);
});
