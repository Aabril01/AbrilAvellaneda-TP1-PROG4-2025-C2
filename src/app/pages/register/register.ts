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

    // src/app/pages/register/register.ts
  async onSubmit(f: NgForm) {
    if (this.loading || !f.valid) return;
    this.loading = true;
    const ok = await this.auth.register(this.model);
    this.loading = false;
    if (ok) {
      alert('Registro exitoso. Ahora podés iniciar sesión.');
      this.router.navigate(['/login']);
    } else {
      alert('Registro inválido: ' + this.auth.lastError());
    }
  }



  get errorMsg() { return this.auth.lastError(); }
}
