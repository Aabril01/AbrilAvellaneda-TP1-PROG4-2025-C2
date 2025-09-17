// src/app/services/auth.service.ts
import { Injectable, computed, signal } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { environment } from '../../environments/environment';

export type AppUser = { id: string; email?: string | null; displayName?: string | null };

@Injectable({ providedIn: 'root' })
export class AuthService {
  // --- estado ---
  private _user = signal<AppUser | null>(null);
  user = computed(() => this._user());
  isLoggedIn = () => !!this._user();

  private _lastError = signal<string>('');
  lastError = () => this._lastError();

  // --- internals ---
  private supabase!: SupabaseClient;         // se asigna en el constructor si hay claves
  private useLocalFallback = false;

  constructor(private sb: SupabaseService) {
    // Si hay claves válidas, usamos Supabase real
    if (environment.supabaseUrl && environment.supabaseAnonKey) {
      this.useLocalFallback = false;
      this.supabase = this.sb.client;        // <<< un solo cliente para toda la app

      // Restaurar sesión si existe (y sincronizar signals/localStorage)
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
        } else {
          // si no hay user, pero había algo local, lo dejamos por compatibilidad
          const persisted = localStorage.getItem('bitzone_user');
          if (persisted) this._user.set(JSON.parse(persisted));
        }
      })();

      // Escuchar cambios de sesión (login/logout/refresh)
      this.supabase.auth.onAuthStateChange((_ev, session) => {
        const u = session?.user;
        if (u) {
          this._user.set({
            id: u.id,
            email: u.email ?? null,
            displayName: (u.user_metadata as any)?.name ?? u.email?.split('@')[0] ?? null
          });
          localStorage.setItem('bitzone_user', JSON.stringify(this._user()));
        } else {
          this._user.set(null);
          localStorage.removeItem('bitzone_user');
        }
      });

    } else {
      // Modo fallback local: permite avanzar sin Supabase configurado
      this.useLocalFallback = true;
      const persisted = localStorage.getItem('bitzone_user');
      if (persisted) this._user.set(JSON.parse(persisted));
    }
  }

  /** Login con correo/contraseña */
  async login(email: string, password: string): Promise<boolean> {
    this._lastError.set('');
    try {
      if (this.useLocalFallback) {
        // --- Fallback local (Sprint 2/3) ---
        const demos = ['tester1@bitzone.com', 'tester2@bitzone.com', 'tester3@bitzone.com'];
        if (demos.includes(email) && password === '123456') {
          const demoUser: AppUser = { id: crypto.randomUUID(), email, displayName: email.split('@')[0] };
          this.persistUser(demoUser);
          return true;
        }
        this._lastError.set('Credenciales inválidas (modo local). Usa testers o configura Supabase.');
        return false;
      }

      // --- Supabase real ---
      const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        this._lastError.set(error?.message ?? 'No se pudo iniciar sesión');
        return false;
      }
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

  /** Registro + creación de perfil (sin almacenar contraseña) */
  async register(model: { email: string; password: string; name: string; surname: string; age: number; }): Promise<boolean> {
    this._lastError.set('');
    try {
      if (this.useLocalFallback) {
        // --- Fallback local ---
        if (model.email.endsWith('+exists@bitzone.com')) {
          this._lastError.set('El usuario ya se encuentra registrado (simulado).');
          return false;
        }
        const appUser: AppUser = {
          id: crypto.randomUUID(),
          email: model.email,
          displayName: model.name
        };
        this.persistUser(appUser);
        return true;
      }

      // --- Supabase real ---
      const { data, error } = await this.supabase.auth.signUp({
        email: model.email,
        password: model.password,
        options: { data: { name: model.name, surname: model.surname, age: model.age } }
      });
      if (error || !data.user) {
        this._lastError.set(error?.message ?? 'No se pudo registrar el usuario');
        return false;
      }

      // Guardar perfil en tabla pública (opcional)
      await this.supabase.from('profiles').upsert({
        id: data.user.id, email: model.email, name: model.name, surname: model.surname, age: model.age
      });

      // Autologin
      const appUser: AppUser = {
        id: data.user.id,
        email: data.user.email ?? '',
        displayName: model.name
      };
      this.persistUser(appUser);
      return true;

    } catch (e: any) {
      this._lastError.set(e?.message ?? 'Error al registrar');
      return false;
    }
  }

  /** Cerrar sesión */
  logout(): void {
    this.supabase?.auth.signOut().catch(() => {});
    this._user.set(null);
    localStorage.removeItem('bitzone_user');
  }

  /** Persistir usuario en signal + localStorage */
  private persistUser(u: AppUser) {
    this._user.set(u);
    localStorage.setItem('bitzone_user', JSON.stringify(u));
  }
}
