// src/app/services/results.service.ts
import { Injectable, signal } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

export type GameId = 'ahorcado' | 'mayor-menor' | 'preguntados' | 'sudoku' | string;

export type GameResult = {
  id?: string;
  user_id: string;
  player_email?: string | null; // nuevo para Sprint 4 (mostrar jugador)
  game: GameId;
  score: number;
  time_seconds?: number | null; // nuevo para juego propio (Sudoku)
  created_at?: string;
};

@Injectable({ providedIn: 'root' })
export class ResultsService {
  private supabase!: SupabaseClient;
  private useLocalFallback = false;

  // estado reactivo
  results = signal<GameResult[]>([]);
  loading = signal(false);
  error = signal<string>('');

  constructor(
    private auth: AuthService,
    private sb: SupabaseService
  ) {
    if (environment.supabaseUrl && environment.supabaseAnonKey) {
      this.supabase = this.sb.client; // cliente único compartido
      this.useLocalFallback = false;
    } else {
      this.useLocalFallback = true;
    }
  }

  /** Guarda un resultado del juego actual */
  async addResult(game: GameId, score: number, extras?: { time_seconds?: number | null }): Promise<void> {
    const user = this.auth.user();
    if (!user) { this.error.set('No hay sesión.'); return; }

    const row: GameResult = {
      user_id: user.id,
      player_email: user.email ?? null,        // Sprint 4: para mostrar el jugador
      game,
      score,
      time_seconds: extras?.time_seconds ?? null
    };

    try {
      this.error.set('');
      if (this.useLocalFallback) {
        const key = `bitzone_results_${user.id}`;
        const arr: GameResult[] = JSON.parse(localStorage.getItem(key) || '[]');
        arr.unshift({ ...row, id: crypto.randomUUID(), created_at: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(arr));
        this.results.set(arr);
      } else {
        const { error } = await this.supabase.from('results').insert(row);
        if (error) throw error;
        await this.listMine();
      }
    } catch (e: any) {
      this.error.set(e?.message ?? 'No se pudo guardar el resultado.');
    }
  }

  /** Lista MIS resultados (historial personal) */
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

  /** Sprint 4: Ranking global por juego (mejor→peor) */
  async listLeaderboard(game: GameId): Promise<GameResult[]> {
    this.loading.set(true);
    this.error.set('');
    try {
      if (this.useLocalFallback) {
        // Sin BD: juntamos de local de esta usuaria nada más (limitado)
        const user = this.auth.user(); if (!user) return [];
        const key = `bitzone_results_${user.id}`;
        const arr: GameResult[] = JSON.parse(localStorage.getItem(key) || '[]');
        return arr.filter(r => r.game === game).sort((a,b) => (b.score ?? 0) - (a.score ?? 0));
      } else {
        const { data, error } = await this.supabase
          .from('results')
          .select('*')
          .eq('game', game)
          .order('score', { ascending: false })
          .order('created_at', { ascending: true });
        if (error) throw error;
        return (data ?? []) as GameResult[];
      }
    } catch (e: any) {
      this.error.set(e?.message ?? 'No se pudo obtener ranking.');
      return [];
    } finally {
      this.loading.set(false);
    }
  }

  /** Borrar mis resultados (dev) */
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
