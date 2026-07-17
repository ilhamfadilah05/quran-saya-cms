import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getServerEnv } from './env';

let _client: SupabaseClient | null = null;

/** Supabase client dengan service-role key. HANYA dipakai di server. */
export function getSupabaseServerClient(): SupabaseClient {
  if (_client) return _client;
  const env = getServerEnv();
  _client = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}
