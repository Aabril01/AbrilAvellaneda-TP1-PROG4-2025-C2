import { Routes } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `<section class="temp"><h2>Juegos</h2><p>Seleccioná un juego.</p></section>`
})
class GamesHome {}

@Component({
  standalone: true,
  template: `<section class="temp"><h2>Ahorcado</h2><p>Sprint 3.</p></section>`
})
export class AhorcadoPage {}

@Component({
  standalone: true,
  template: `<section class="temp"><h2>Mayor o menor</h2><p>Sprint 3.</p></section>`
})
export class MayorMenorPage {}

@Component({
  standalone: true,
  template: `<section class="temp"><h2>Preguntados</h2><p>Sprint 3.</p></section>`
})
export class PreguntadosPage {}

@Component({
  standalone: true,
  template: `<section class="temp"><h2>Sudoku (juego propio)</h2><p>Sprint 3/4.</p></section>`
})
export class SudokuPage {}

export const GAMES_ROUTES: Routes = [
  { path: '', component: GamesHome },
  { path: 'ahorcado', component: AhorcadoPage },
  { path: 'mayor-menor', component: MayorMenorPage },
  { path: 'preguntados', component: PreguntadosPage },
  { path: 'sudoku', component: SudokuPage }
];
