// src/app/pages/games/games.routes.ts
import { Routes } from '@angular/router';
import { Component } from '@angular/core';

import { AhorcadoPage } from './ahorcado/ahorcado';
import { MayorMenorPage } from './mayor-menor/mayor-menor';
import { PreguntadosPage } from './preguntados/preguntados';
import { SudokuPage } from './sudoku/sudoku';

// Home de juegos
@Component({
  standalone: true,
  template: `
    <section class="container card">
      <h2 class="h1">Juegos disponibles</h2>
      <ul>
        <li><a routerLink="ahorcado">Ahorcado</a></li>
        <li><a routerLink="mayor-menor">Mayor o menor</a></li>
        <li><a routerLink="preguntados">Preguntados</a></li>
        <li><a routerLink="sudoku">Sudoku</a></li>
      </ul>
    </section>
  `
})
export class GamesHome {}

export const GAMES_ROUTES: Routes = [
  { path: '', component: GamesHome },
  { path: 'ahorcado', component: AhorcadoPage },
  { path: 'mayor-menor', component: MayorMenorPage },
  { path: 'preguntados', component: PreguntadosPage },
  { path: 'sudoku', component: SudokuPage }
];
