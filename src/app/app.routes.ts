import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/welcome/welcome').then(m => m.WelcomePage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.RegisterPage)
  },
  {
    path: 'whoami',
    loadComponent: () => import('./pages/whoami/whoami').then(m => m.WhoamiPage)
  },
  {
    path: 'games',
    loadChildren: () =>
      import('./pages/games/games.routes').then(m => m.GAMES_ROUTES)
  },
  {
    path: 'results',
    loadChildren: () =>
      import('./pages/results/results.routes').then(m => m.RESULTS_ROUTES)
  },
  { path: '**', redirectTo: '' }
];
