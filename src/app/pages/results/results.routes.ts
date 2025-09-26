
import { Routes } from '@angular/router';
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ResultsService, GameResult } from '../../services/results.service';
import { Signal } from '@angular/core'; 

@Component({
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
  <section class="container">
    <div class="card">
      <h2 class="h1">Resultados (Ranking por juego)</h2>

      <ng-container *ngFor="let g of games">
        <h3 class="h2" style="margin-top:1rem;text-transform:capitalize">{{ g }}</h3>

        <div *ngIf="loading()">Cargando…</div>
        <table class="res-table" *ngIf="!loading()">
          <thead>
            <tr>
              <th>Jugador</th>
              <th>Puntaje</th>
              <th *ngIf="g==='sudoku'">Tiempo (s)</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of data[g]">
              <td>{{ r.player_email || r.user_id }}</td>
              <td><b>{{ r.score }}</b></td>
              <td *ngIf="g==='sudoku'">{{ r.time_seconds ?? '-' }}</td>
              <td>{{ r.created_at | date:'short' }}</td>
            </tr>
          </tbody>
        </table>
      </ng-container>

      <p class="error" *ngIf="error()">{{ error() }}</p>
    </div>
  </section>
  `,
  styles: [`
    .res-table{width:100%;border-collapse:collapse;margin:.5rem 0 1rem}
    .res-table th,.res-table td{padding:.5rem;border-bottom:1px solid rgba(255,255,255,.08);text-align:left}
  `]
})
class ResultsHome implements OnInit {
  games: Array<'ahorcado'|'mayor-menor'|'preguntados'|'sudoku'> = ['ahorcado','mayor-menor','preguntados','sudoku'];
  data: Record<string, GameResult[]> = { 'ahorcado': [], 'mayor-menor': [], 'preguntados': [], 'sudoku': [] };

  loading = signal(false);
  error!: Signal<string>;

  constructor(private resultsSvc: ResultsService) {
    this.error = this.resultsSvc.error; 
  }

  async ngOnInit() {
    this.loading.set(true);
    for (const g of this.games) {
      const rows = await this.resultsSvc.listLeaderboard(g);
      this.data[g] = rows;
    }
    this.loading.set(false);
  }
}

export const RESULTS_ROUTES: Routes = [
  { path: '', component: ResultsHome }
];
