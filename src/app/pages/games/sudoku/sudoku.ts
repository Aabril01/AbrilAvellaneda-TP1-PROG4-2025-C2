// src/app/pages/games/sudoku/sudoku.ts
import { Component, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultsService } from '../../../services/results.service';
import { Router } from '@angular/router';

type Cell = { value: number | null; fixed: boolean };

@Component({
  standalone: true,
  selector: 'ng-sudoku',
  imports: [CommonModule],
  templateUrl: './sudoku.html',
  styleUrls: ['./sudoku.scss']
})
export class SudokuPage implements OnDestroy {
  constructor(private results: ResultsService, private router: Router) {}

  // ====== Config ======
  private readonly TIME_LIMIT = 180; // segundos
  private readonly N = 6;
  private readonly KEYS = [1, 2, 3, 4, 5, 6];
  private readonly BOX_R = 2;  // alto subcuadro
  private readonly BOX_C = 3;  // ancho subcuadro

  private puzzleBase: number[][] = [
    [0, 0, 5, 6, 0, 0],
    [0, 6, 0, 0, 0, 8],
    [0, 0, 0, 0, 5, 0],
    [0, 0, 0, 0, 0, 3],
    [4, 0, 7, 0, 0, 0],
    [0, 2, 0, 8, 0, 0],
  ];

  // ====== Estado ======
  grid = signal<Cell[][]>(
    this.puzzleBase.map(row => row.map(n => ({ value: n || null, fixed: !!n })))
  );

  selected = signal<{ r: number; c: number } | null>(null);
  message = signal<string>('');
  completed = computed(() => this.checkCompleted());

  gameOver = signal(false);
  win = signal(false);

  // Cronómetro
  private startMs = Date.now();
  elapsedSec = signal<number>(0);
  private timer: any = setInterval(() => {
    const sec = Math.floor((Date.now() - this.startMs) / 1000);
    this.elapsedSec.set(sec);
    if (sec >= this.TIME_LIMIT && !this.completed() && !this.gameOver()) {
      this.endByTimeout();
    }
  }, 1000);

  // ====== HUD (solo lecturas, no cambia tu lógica) ======
  /** celdas llenas */
  filled = computed(() => {
    let n = 0;
    const g = this.grid();
    for (let r = 0; r < this.N; r++) {
      for (let c = 0; c < this.N; c++) if (g[r][c].value) n++;
    }
    return n;
  });
  /** porcentaje de progreso 0..100 */
  progressPct = computed(() =>
    Math.round((this.filled() / (this.N * this.N)) * 100)
  );
  /** tiempo restante (cuenta regresiva) */
  timeLeft = computed(() => Math.max(0, this.TIME_LIMIT - this.elapsedSec()));
  /** cantidad de conflictos actuales */
  errors = computed(() => this.invalidCells().length);

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  // ====== Interacción ======
  select(r: number, c: number) {
    const cell = this.grid()[r][c];
    if (cell.fixed || this.completed() || this.gameOver()) return;
    this.selected.set({ r, c });
  }

  setValue(n: number) {
    const sel = this.selected();
    if (!sel || this.completed() || this.gameOver()) return;

    const g = this.grid().map(r => r.map(c => ({ ...c })));
    if (!g[sel.r][sel.c].fixed) {
      g[sel.r][sel.c].value = n;
      this.grid.set(g);
      this.validate();
    }

    if (this.completed() && !this.gameOver()) {
      // Fin por victoria
      clearInterval(this.timer);
      this.message.set('¡Completado!');
      const score = 100;
      this.results.addResult('sudoku', score);
      this.win.set(true);
      this.gameOver.set(true);
    }
  }

  erase() {
    const sel = this.selected();
    if (!sel || this.completed() || this.gameOver()) return;

    const cell = this.grid()[sel.r][sel.c];
    if (cell.fixed) return;

    const g = this.grid().map(r => r.map(c => ({ ...c })));
    g[sel.r][sel.c].value = null;
    this.grid.set(g);
    this.validate();
  }

  // ====== Fin por tiempo ======
  private endByTimeout() {
    clearInterval(this.timer);
    this.message.set('Se acabó el tiempo');
    const score = Math.max(0, 100 - this.invalidCells().length * 5);
    this.results.addResult('sudoku', score);
    this.win.set(false);
    this.gameOver.set(true);
  }

  // ====== Validaciones ======
  private validate() {
    const invalid = this.invalidCells();
    if (invalid.length) {
      this.message.set('Hay conflictos. Revisa filas/columnas/cuadrantes.');
    } else {
      this.message.set('');
    }
  }

  private rowValues(r: number) {
    return this.grid()[r].map(c => c.value).filter(Boolean) as number[];
  }
  private colValues(c: number) {
    return this.grid().map(row => row[c].value).filter(Boolean) as number[];
  }
  private boxValues(r: number, c: number) {
    const r0 = Math.floor(r / this.BOX_R) * this.BOX_R;
    const c0 = Math.floor(c / this.BOX_C) * this.BOX_C;
    const vals: number[] = [];
    for (let i = r0; i < r0 + this.BOX_R; i++) {
      for (let j = c0; j < c0 + this.BOX_C; j++) {
        const v = this.grid()[i][j].value;
        if (v) vals.push(v);
      }
    }
    return vals;
  }
  private invalidCells(): [number, number][] {
    const bad: [number, number][] = [];
    for (let r = 0; r < this.N; r++) {
      for (let c = 0; c < this.N; c++) {
        const v = this.grid()[r][c].value;
        if (!v) continue;
        const row = this.rowValues(r); if (row.filter(x => x === v).length > 1) bad.push([r, c]);
        const col = this.colValues(c); if (col.filter(x => x === v).length > 1) bad.push([r, c]);
        const box = this.boxValues(r, c); if (box.filter(x => x === v).length > 1) bad.push([r, c]);
      }
    }
    return bad;
  }
  private checkCompleted(): boolean {
    for (let r = 0; r < this.N; r++) {
      for (let c = 0; c < this.N; c++) {
        if (!this.grid()[r][c].value) return false;
      }
    }
    return this.invalidCells().length === 0;
  }

  isInvalid(r: number, c: number) {
    const list = this.invalidCells();
    return list.some(([rr, cc]) => rr === r && cc === c);
  }

  // ====== Botones finales ======
  retry() {
    this.grid.set(
      this.puzzleBase.map(row => row.map(n => ({ value: n || null, fixed: !!n })))
    );
    this.selected.set(null);
    this.message.set('');
    this.gameOver.set(false);
    this.win.set(false);

    clearInterval(this.timer);
    this.startMs = Date.now();
    this.elapsedSec.set(0);
    this.timer = setInterval(() => {
      const sec = Math.floor((Date.now() - this.startMs) / 1000);
      this.elapsedSec.set(sec);
      if (sec >= this.TIME_LIMIT && !this.completed() && !this.gameOver()) {
        this.endByTimeout();
      }
    }, 1000);
  }

  volverAlInicio() {
    this.router.navigateByUrl('/');
  }

  // ====== Útil en el template ======
  get keypad() {
    return this.KEYS;
  }
}
