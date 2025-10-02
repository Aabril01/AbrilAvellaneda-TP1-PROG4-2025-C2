import { Component, OnInit, computed, Signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, Routes } from '@angular/router';
import { ResultsService, GameResult } from '../../services/results.service';

@Component({
  standalone: true,
  selector: 'ng-results-home',
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './results.html',
  styleUrls: ['./results.scss'],
})
export class ResultsHome implements OnInit {
  loading!: Signal<boolean>;
  error!: Signal<string>;
  rows!: Signal<GameResult[]>;

  // cortes por juego (computeds a partir de rows)
  ahorcado    = computed(() => (this.rows?.() ?? []).filter(r => r.game === 'ahorcado'));
  mayorMenor  = computed(() => (this.rows?.() ?? []).filter(r => r.game === 'mayor-menor'));
  preguntados = computed(() => (this.rows?.() ?? []).filter(r => r.game === 'preguntados'));
  sudoku      = computed(() => (this.rows?.() ?? []).filter(r => r.game === 'sudoku'));

  constructor(private resultsSvc: ResultsService) {
    // ← Asignamos acá (ya existe el servicio)
    this.loading = resultsSvc.loading;
    this.error   = resultsSvc.error;
    this.rows    = resultsSvc.results;
  }

  ngOnInit() {
    // Cargar datos al entrar
     this.resultsSvc.listMine();
  }

  clearDev() {
    this.resultsSvc.clearMine();
  }

  
}
export const RESULTS_ROUTES: Routes = [
  { path: '', component: ResultsHome }
];