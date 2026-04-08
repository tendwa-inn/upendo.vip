import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://kvfockaztqldgdobpntf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Zm9ja2F6dHFsZGdkb2JwbnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NDE5MDcsImV4cCI6MjA4ODMxNzkwN30.OaZF0WhYCpc5vbFu1HixD_PcCOJlnOsmchLKxwrb5VA";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anon key are required.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
