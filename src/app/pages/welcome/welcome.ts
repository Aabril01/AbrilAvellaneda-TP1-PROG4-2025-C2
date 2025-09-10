// src/app/pages/welcome/welcome.ts
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgIf, NgFor } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-welcome',
  imports: [RouterLink],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss'
})
export class WelcomePage implements OnInit {

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Hook mínimo: podrías precargar algo o loguear métricas
    // console.log('WelcomePage init');
  }

  goLogin()    { this.router.navigate(['/login']); }
  goRegister() { this.router.navigate(['/register']); }
  logout()     { this.auth.logout(); }
}
