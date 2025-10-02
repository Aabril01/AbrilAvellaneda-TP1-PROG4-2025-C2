// Re-usa SIEMPRE este cliente único en toda la app.
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export const supabase: SupabaseClient = createClient(
  environment.supabaseUrl!,
  environment.supabaseAnonKey!,
  {
    auth: {
      persistSession: true,
      storageKey: 'bitzone-auth', // usa mismo storage en todos los servicios
      autoRefreshToken: true,
    },
  }
);
