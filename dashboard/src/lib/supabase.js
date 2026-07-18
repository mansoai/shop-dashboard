import { createClient } from '@supabase/supabase-js';

// These come from your Supabase project settings > API
// Use the ANON/PUBLIC key here (NOT service_role) - this code runs in the
// browser, and RLS policies (auth.uid() = user_id) keep each client scoped
// to only their own shop's data.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
