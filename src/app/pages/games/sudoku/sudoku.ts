import { Component, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultsService } from '../../../services/results.service';
import { RouterLink } from '@angular/router';

type Cell = { value: number | null; fixed: boolean };

@Component({
  standalone: true,
  selector: 'ng-sudoku',
  imports: [CommonModule],
  templateUrl: './sudoku.html',
  styleUrls: ['./sudoku.scss']
})
export class SudokuPage implements OnDestroy {
  constructor(private results: ResultsService) {}

  // Tablero 4×4
  private puzzleBase: number[][] = [
    [0, 0, 3, 4],
    [3, 4, 0, 0],
    [0, 0, 4, 3],
    [4, 3, 0, 0],
  ];

  grid = signal<Cell[][]>(this.puzzleBase.map(row =>
    row.map(n => ({ value: n || null, fixed: !!n }))
  ));

  selected = signal<{r:number; c:number} | null>(null);
  message = signal<string>('');
  completed = computed(() => this.checkCompleted());

  // Cronómetro
  private startMs = Date.now();
  elapsedSec = signal<number>(0);
  private timer: any = setInterval(() => {
    this.elapsedSec.set(Math.floor((Date.now() - this.startMs)/1000));
  }, 1000);

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  select(r: number, c: number) {
    const cell = this.grid()[r][c];
    if (cell.fixed) return;
    this.selected.set({ r, c });
  }

  setValue(n: number) {
    const sel = this.selected();
    if (!sel) return;
    const g = this.grid().map(r => r.map(c => ({...c})));
    g[sel.r][sel.c].value = n;
    this.grid.set(g);
    this.validate();
    if (this.completed()) {
      clearInterval(this.timer);
      this.message.set('¡Completado!');
      // Puntaje simple
      const score = this.invalidCells().length === 0 ? 100 : 70;
      this.results.addResult('sudoku', score, { time_seconds: this.elapsedSec() });
    }
  }

  erase() {
    const sel = this.selected();
    if (!sel) return;
    const cell = this.grid()[sel.r][sel.c];
    if (cell.fixed) return;
    const g = this.grid().map(r => r.map(c => ({...c})));
    g[sel.r][sel.c].value = null;
    this.grid.set(g);
    this.validate();
  }

  // --- validaciones ---
  private validate() {
    const invalid = this.invalidCells();
    if (invalid.length) {
      this.message.set('Hay conflictos. Revisa filas/columnas/cuadrantes.');
    } else {
      this.message.set('');
    }
  }

  private rowValues(r:number) { return this.grid()[r].map(c => c.value).filter(Boolean) as number[]; }
  private colValues(c:number) { return this.grid().map(row => row[c].value).filter(Boolean) as number[]; }
  private boxValues(r:number, c:number) {
    const r0 = Math.floor(r/2)*2;
    const c0 = Math.floor(c/2)*2;
    const vals:number[] = [];
    for (let i=r0; i<r0+2; i++) for (let j=c0; j<c0+2; j++) {
      const v = this.grid()[i][j].value; if (v) vals.push(v);
    }
    return vals;
  }

  private invalidCells(): [number,number][] {
    const bad: [number,number][] = [];
    for (let r=0; r<4; r++) {
      for (let c=0; c<4; c++) {
        const v = this.grid()[r][c].value;
        if (!v) continue;
        const row = this.rowValues(r); if (row.filter(x => x===v).length > 1) bad.push([r,c]);
        const col = this.colValues(c); if (col.filter(x => x===v).length > 1) bad.push([r,c]);
        const box = this.boxValues(r,c); if (box.filter(x => x===v).length > 1) bad.push([r,c]);
      }
    }
    return bad;
  }

  private checkCompleted(): boolean {
    for (let r=0; r<4; r++) for (let c=0; c<4; c++) {
      if (!this.grid()[r][c].value) return false;
    }
    return this.invalidCells().length === 0;
  }

  isInvalid(r:number,c:number) {
    const list = this.invalidCells();
    return list.some(([rr,cc]) => rr===r && cc===c);
  }
}
