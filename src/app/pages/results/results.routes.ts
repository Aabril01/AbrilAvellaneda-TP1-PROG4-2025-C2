// src/app/pages/results/results.routes.ts
import { Routes } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `<section class="temp">
    <h2>Resultados</h2>
    <p>Sprint 4.</p>
  </section>`
})
class ResultsHome {}

export const RESULTS_ROUTES: Routes = [
  { path: '', component: ResultsHome }
];
