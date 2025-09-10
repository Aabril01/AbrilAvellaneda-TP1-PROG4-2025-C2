// src/app/pages/games/games.routes.ts
import { Routes } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `<section class="temp">
    <h2>Juegos</h2>
    <p>Contenido en próximos sprints.</p>
  </section>`
})
class GamesHome {}

@Component({
  standalone: true,
  template: `<section class="temp">
    <h2>Ahorcado</h2>
    <p>Sprint 3.</p>
  </section>`
})
export class AhorcadoPage {}

@Component({
  standalone: true,
  template: `<section class="temp">
    <h2>Mayor o menor</h2>
    <p>Sprint 3.</p>
  </section>`
})
export class MayorMenorPage {}

export const GAMES_ROUTES: Routes = [
  { path: '', component: GamesHome },
  { path: 'ahorcado', component: AhorcadoPage },
  { path: 'mayor-menor', component: MayorMenorPage }
];
