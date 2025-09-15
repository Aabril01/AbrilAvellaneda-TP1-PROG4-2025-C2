// src/app/pages/results/results.routes.ts
import { Routes } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ResultsService } from '../../services/results.service';
import { DatePipe } from '@angular/common';

@Component({
  standalone: true,
  imports: [DatePipe],
  template: `
  <section class="container">
    <div class="card">
      <h2 class="h1">Resultados</h2>

      @if (svc.loading()) {
        <p class="p">Cargando…</p>
      } @else if (svc.results().length === 0) {
        <p class="p">Aún no hay resultados.</p>
      } @else {
        <div style="overflow:auto;">
          <table class="res-table">
            <thead><tr><th>Fecha</th><th>Juego</th><th>Puntaje</th></tr></thead>
            <tbody>
              @for (r of svc.results(); track r.id) {
                <tr>
                  <td>{{ r.created_at | date:'short' }}</td>
                  <td style="text-transform: capitalize;">{{ r.game }}</td>
                  <td><b>{{ r.score }}</b></td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <button class="btn ghost" (click)="clear()">Borrar mis resultados (dev)</button>
      }
      @if (svc.error()) { <p class="error">{{ svc.error() }}</p> }
    </div>
  </section>
  `,
  styleUrls: ['./results.scss']
})
class ResultsHome implements OnInit {
  constructor(public svc: ResultsService) {}
  ngOnInit() { this.svc.listMine(); }
  clear() { this.svc.clearMine(); }
}

export const RESULTS_ROUTES: Routes = [
  { path: '', component: ResultsHome }
];
