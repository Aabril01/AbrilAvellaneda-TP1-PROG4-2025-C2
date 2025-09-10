// src/app/services/auth.service.ts
import { Injectable, computed, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export type AppUser = {
  id: string;
  email: string;
  displayName?: string;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  // estado reactivo con Signals (Clase 6)
  private _user = signal<AppUser | null>(null);
  private _lastError = signal<string>('');

  user = computed(() => this._user());
  isLoggedIn = () => !!this._user();
  lastError = () => this._lastError();

  private supabase?: SupabaseClient;
  private useLocalFallback = false;

  constructor() {
    // Si hay claves, inicializamos Supabase (Clase 5)
    if (environment.supabaseUrl && environment.supabaseAnonKey) {
      this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
      // Restaurar sesión si existía
      const persisted = localStorage.getItem('bitzone_user');
      if (persisted) this._user.set(JSON.parse(persisted));
    } else {
      // Modo fallback local: te deja avanzar el Sprint 2 sin claves reales
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
        // --- Fallback local (desarrollo / sin claves) ---
        // 3 cuentas demo para "login rápido" (Sprint 2)
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
      const { data, error } = await this.supabase!.auth.signInWithPassword({ email, password });
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
        // simulamos "usuario ya existe" si el email termina en +exists
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
      const { data, error } = await this.supabase!.auth.signUp({
        email: model.email,
        password: model.password,
        options: { data: { name: model.name, surname: model.surname, age: model.age } }
      });
      if (error || !data.user) {
        this._lastError.set(error?.message ?? 'No se pudo registrar el usuario');
        return false;
      }

      // Guardar perfil en una tabla pública (sin contraseña)
      // TODO: crea la tabla 'profiles(id uuid primary key, email text, name text, surname text, age int)'
      await this.supabase!.from('profiles').upsert({
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

  logout(): void {
    // si hay supabase, cerrar sesión remota (ignorar errores)
    this.supabase?.auth.signOut().catch(() => {});
    this._user.set(null);
    localStorage.removeItem('bitzone_user');
  }

  /** Guarda usuario en signal + localStorage */
  private persistUser(u: AppUser) {
    this._user.set(u);
    localStorage.setItem('bitzone_user', JSON.stringify(u));
  }
}
