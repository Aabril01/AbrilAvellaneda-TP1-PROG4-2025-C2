import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgIf, NgFor } from '@angular/common';

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

   demoUsers = [
    { alias: 'Tester 1', email: 'tester1@bitzone.com', pass: '123456' },
    { alias: 'Tester 2', email: 'tester2@bitzone.com', pass: '123456' },
    { alias: 'Tester 3', email: 'tester3@bitzone.com', pass: '123456' }
  ];
    

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit() {
    if (this.loading) return;
    this.loading = true;
    const ok = await this.auth.login(this.email.trim(), this.password);
    this.loading = false;
    if (ok) this.router.navigate(['/']);
  }

  async quickLogin(u: {email: string; pass: string}) {
    this.email = u.email; this.password = u.pass;
    await this.onSubmit();
  }

  get errorMsg() { return this.auth.lastError(); }
}
