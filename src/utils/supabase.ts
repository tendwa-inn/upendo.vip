import { createClient } from '@supabase/supabase-js'

const FALLBACK_SUPABASE_URL = 'https://kvfockaztqldgdobpntf.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Zm9ja2F6dHFsZGdkb2JwbnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NDE5MDcsImV4cCI6MjA4ODMxNzkwN30.OaZF0WhYCpc5vbFu1HixD_PcCOJlnOsmchLKxwrb5VA'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseUrl =
  typeof rawUrl === 'string' && /^https?:\/\//i.test(rawUrl.trim())
    ? rawUrl.trim()
    : FALLBACK_SUPABASE_URL
const supabaseAnonKey =
  typeof rawAnonKey === 'string' && rawAnonKey.trim().length > 0
    ? rawAnonKey.trim()
    : FALLBACK_SUPABASE_ANON_KEY

let supabase: ReturnType<typeof createClient>;

if (typeof window !== 'undefined') {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
