// src/app/services/auth.service.ts
import { Injectable, computed, signal } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { environment } from '../../environments/environment';

export type AppUser = { id: string; email?: string | null; displayName?: string | null };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<AppUser | null>(null);
  user = computed(() => this._user());
  isLoggedIn = () => !!this._user();

  private _lastError = signal<string>('');
  lastError = () => this._lastError();

  private supabase!: SupabaseClient;
  private useLocalFallback = false;

  constructor(private sb: SupabaseService) {
    if (environment.supabaseUrl && environment.supabaseAnonKey) {
      this.useLocalFallback = false;
      this.supabase = this.sb.client;

      (async () => {
        const { data } = await this.supabase.auth.getUser();
        const u = data.user;
        if (u) {
          this._user.set({
            id: u.id,
            email: u.email ?? null,
            displayName: (u.user_metadata as any)?.name ?? u.email?.split('@')[0] ?? null
          });
          localStorage.setItem('bitzone_user', JSON.stringify(this._user()));
          await this.upsertProfile(u).catch(() => {});
        } else {
          const persisted = localStorage.getItem('bitzone_user');
          if (persisted) this._user.set(JSON.parse(persisted));
        }
      })();

      this.supabase.auth.onAuthStateChange(async (_ev, session) => {
        const u = session?.user;
        if (u) {
          this._user.set({
            id: u.id,
            email: u.email ?? null,
            displayName: (u.user_metadata as any)?.name ?? u.email?.split('@')[0] ?? null
          });
          localStorage.setItem('bitzone_user', JSON.stringify(this._user()));
          await this.upsertProfile(u).catch(() => {});
        } else {
          this._user.set(null);
          localStorage.removeItem('bitzone_user');
        }
      });

    } else {
      this.useLocalFallback = true;
      const persisted = localStorage.getItem('bitzone_user');
      if (persisted) this._user.set(JSON.parse(persisted));
    }
  }

  private async upsertProfile(u: { id: string; email?: string | null; user_metadata?: any }, fullNameFromForm?: string) {
    if (this.useLocalFallback) return;
    const fullName =
      fullNameFromForm ??
      (u?.user_metadata?.full_name ??
       u?.user_metadata?.name ??
       u?.email?.split('@')[0] ??
       null);

    await this.supabase.from('profiles').upsert({
      id: u.id,
      full_name: fullName,
      email: u.email ?? null
    });
  }

  async login(email: string, password: string): Promise<boolean> {
    this._lastError.set('');
    try {
      if (this.useLocalFallback) {
        const demos = ['tester1@bitzone.com', 'tester2@bitzone.com', 'tester3@bitzone.com'];
        if (demos.includes(email) && password === '123456') {
          const demoUser: AppUser = { id: crypto.randomUUID(), email, displayName: email.split('@')[0] };
          this.persistUser(demoUser);
          return true;
        }
        this._lastError.set('Credenciales inválidas (modo local). Usa testers o configura Supabase.');
        return false;
      }

      const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        this._lastError.set(error?.message ?? 'No se pudo iniciar sesión');
        return false;
      }

      await this.upsertProfile(data.user).catch(() => {});

      const appUser: AppUser = {
        id: data.user.id,
        email: data.user.email ?? '',
        displayName: (data.user.user_metadata as any)?.name ?? data.user.email?.split('@')[0]
      };
      this.persistUser(appUser);
      return true;

    } catch (e: any) {
      this._lastError.set(e?.message ?? 'Error de autenticación');
      return false;
    }
  }

  /** Registro SIN autologin. */
  async register(model: { email: string; password: string; name: string; surname: string; age: number; }): Promise<boolean> {
    this._lastError.set('');
    try {
      if (this.useLocalFallback) {
        if (model.email.endsWith('+exists@bitzone.com')) {
          this._lastError.set('El usuario ya se encuentra registrado (simulado).');
          return false;
        }
        // Registro OK simulado (sin iniciar sesión)
        return true;
      }

      const { data, error } = await this.supabase.auth.signUp({
        email: model.email,
        password: model.password,
        options: { data: { name: model.name, surname: model.surname, age: model.age, full_name: model.name } }
      });
      if (error || !data.user) {
        this._lastError.set(error?.message ?? 'No se pudo registrar el usuario');
        return false;
      }

      // Perfil
      await this.supabase.from('profiles').upsert({
        id: data.user.id,
        email: model.email,
        name: model.name,
        surname: model.surname,
        age: model.age,
        full_name: model.name
      });
      await this.upsertProfile(data.user, model.name).catch(() => {});

      // 🚫 Asegurar que NO quede logueada:
      await this.supabase.auth.signOut().catch(() => {});
      this._user.set(null);
      localStorage.removeItem('bitzone_user');

      return true;

    } catch (e: any) {
      this._lastError.set(e?.message ?? 'Error al registrar');
      return false;
    }
  }

  logout(): void {
    this.supabase?.auth.signOut().catch(() => {});
    this._user.set(null);
    localStorage.removeItem('bitzone_user');
  }

  private persistUser(u: AppUser) {
    this._user.set(u);
    localStorage.setItem('bitzone_user', JSON.stringify(u));
  }
}
