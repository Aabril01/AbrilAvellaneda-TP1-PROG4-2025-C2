import { Routes } from '@angular/router';

export const RESULTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./results').then(m => m.ResultsPage)
  }
];