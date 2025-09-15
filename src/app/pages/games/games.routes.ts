// src/app/pages/games/games.routes.ts
import { Routes } from '@angular/router';
import { Component } from '@angular/core';

// 👇 ahora sí importamos los juegos reales desde sus archivos
import { AhorcadoPage } from './ahorcado/ahorcado';
import { MayorMenorPage } from './mayor-menor/mayor-menor';

@Component({
  standalone: true,
  template: `<section class="container card">
    <h2 class="h1">Juegos</h2>
    <p class="p">Elegí un juego desde el Home.</p>
  </section>`
})
export class GamesHome {}

@Component({
  standalone: true,
  template: `<section class="container card">
    <h2 class="h1">Preguntados</h2>
    <p class="p">Próximo sprint.</p>
  </section>`
})
export class PreguntadosPage {}

@Component({
  standalone: true,
  template: `<section class="container card">
    <h2 class="h1">Sudoku (juego propio)</h2>
    <p class="p">Próximo sprint.</p>
  </section>`
})
export class SudokuPage {}

export const GAMES_ROUTES: Routes = [
  { path: '', component: GamesHome },
  { path: 'ahorcado', component: AhorcadoPage },
  { path: 'mayor-menor', component: MayorMenorPage },
  { path: 'preguntados', component: PreguntadosPage },
  { path: 'sudoku', component: SudokuPage }
];
