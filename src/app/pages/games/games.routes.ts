// src/app/pages/games/games.routes.ts
import { Routes } from '@angular/router';

// Importamos cada juego desde su carpeta correspondiente
import { AhorcadoPage } from './ahorcado/ahorcado';
import { MayorMenorPage } from './mayor-menor/mayor-menor';
import { PreguntadosPage } from './preguntados/preguntados';
import { SudokuPage } from './sudoku/sudoku';

// Rutas internas de la sección "games"
export const GAMES_ROUTES: Routes = [
  { path: 'ahorcado', component: AhorcadoPage },
  { path: 'mayor-menor', component: MayorMenorPage },
  { path: 'preguntados', component: PreguntadosPage },
  { path: 'sudoku', component: SudokuPage },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'ahorcado' // si entrás a /games sin nada, redirige por defecto
  }
];
