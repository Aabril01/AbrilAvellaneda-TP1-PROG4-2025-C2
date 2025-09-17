import { Injectable, signal } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

export type GameResult = {
  id?: string;
  user_id: string;
  game: 'ahorcado' | 'mayor-menor' | 'preguntados' | 'sudoku' | string;
  score: number;
  created_at?: string;
};

@Injectable({ providedIn: 'root' })
export class ResultsService {
  private supabase!: SupabaseClient;      // usamos SIEMPRE el client compartido
  private useLocalFallback = false;

  // cache en memoria para la lista de resultados del usuario
  results = signal<GameResult[]>([]);
  loading = signal(false);
  error = signal<string>('');

  constructor(
    private auth: AuthService,
    private sb: SupabaseService          // inyectamos el servicio único
  ) {
    if (environment.supabaseUrl && environment.supabaseAnonKey) {
      // cliente único (evita Multiple GoTrueClient y 401 aleatorios)
      this.supabase = this.sb.client;
      this.useLocalFallback = false;
    } else {
      // modo local si no hay claves
      this.useLocalFallback = true;
    }
  }

  /** Guarda un resultado del juego actual */
  async addResult(game: GameResult['game'], score: number): Promise<void> {
    const user = this.auth.user();
    if (!user) { this.error.set('No hay sesión.'); return; }
    const row: GameResult = { user_id: user.id, game, score };

    try {
      this.error.set('');
      if (this.useLocalFallback) {
        // LocalStorage por usuario
        const key = `bitzone_results_${user.id}`;
        const arr: GameResult[] = JSON.parse(localStorage.getItem(key) || '[]');
        arr.unshift({ ...row, id: crypto.randomUUID(), created_at: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(arr));
        // refrescar cache
        this.results.set(arr);
      } else {
        const { error } = await this.supabase.from('results').insert(row);
        if (error) throw error;
        await this.listMine(); // refrescar
      }
    } catch (e: any) {
      this.error.set(e?.message ?? 'No se pudo guardar el resultado.');
    }
  }

  /** Lista mis resultados, más recientes primero */
  async listMine(): Promise<void> {
    const user = this.auth.user();
    if (!user) { this.results.set([]); return; }
    this.loading.set(true);
    this.error.set('');
    try {
      if (this.useLocalFallback) {
        const key = `bitzone_results_${user.id}`;
        const arr: GameResult[] = JSON.parse(localStorage.getItem(key) || '[]');
        this.results.set(arr);
      } else {
        const { data, error } = await this.supabase
          .from('results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        this.results.set((data ?? []) as GameResult[]);
      }
    } catch (e: any) {
      this.error.set(e?.message ?? 'No se pudo obtener resultados.');
    } finally {
      this.loading.set(false);
    }
  }

  /** Limpia mis resultados (opcional para desarrollo) */
  async clearMine(): Promise<void> {
    const user = this.auth.user();
    if (!user) return;
    try {
      if (this.useLocalFallback) {
        localStorage.removeItem(`bitzone_results_${user.id}`);
        this.results.set([]);
      } else {
        const { error } = await this.supabase.from('results').delete().eq('user_id', user.id);
        if (error) throw error;
        this.results.set([]);
      }
    } catch { /* ignore */ }
  }
}
