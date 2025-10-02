// src/app/pages/register/register.ts
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterPage {
  model = { name: '', surname: '', age: 18, email: '', password: '' };
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit(f: NgForm) {
    if (this.loading || !f.valid) return;

    this.loading = true;
    try {
      const ok = await this.auth.register(this.model);
      if (ok) {
        // Registro OK -> ir a LOGIN (no queda logueada)
        this.router.navigateByUrl('/login');
      }
    } finally {
      this.loading = false; // <- siempre apagamos el spinner
    }
  }

  get errorMsg() { return this.auth.lastError(); }
}
