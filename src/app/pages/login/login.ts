import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type DemoUser = { email: string; alias: string; password: string };

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginPage {
  email = '';
  password = '';
  loading = false;

  // Si no los usás en tu HTML, podés dejarlo; no rompe nada.
  demoUsers: DemoUser[] = [
    { email: 'tester1@bitzone.com', alias: 'Tester 1', password: '123456' },
    { email: 'tester2@bitzone.com', alias: 'Tester 2', password: '123456' },
    { email: 'tester3@bitzone.com', alias: 'Tester 3', password: '123456' }
  ];

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit() {
    if (this.loading) return;
    this.loading = true;
    const ok = await this.auth.login(this.email, this.password);
    this.loading = false;
    if (ok) {
      this.router.navigate(['/games']); // redirige a juegos tras login OK
    } else {
      alert('Credenciales inválidas');
    }
  }

  async quickLogin(u: DemoUser) {
    if (this.loading) return;
    this.email = u.email;
    this.password = u.password;
    await this.onSubmit();
  }

  get errorMsg() { return this.auth.lastError(); }
}
