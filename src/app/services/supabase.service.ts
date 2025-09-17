import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client: SupabaseClient;

  constructor() {
    this.client = createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
      auth: {
        // guarda la sesión en localStorage y la refresca
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'bitzone-auth',
      },
    });
  }
}
