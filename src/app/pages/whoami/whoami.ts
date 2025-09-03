import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Github, GithubUser } from '../../services/github';

@Component({
  selector: 'app-whoami',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whoami.html',
  styleUrl: './whoami.scss'
})
export class Whoami implements OnInit {
  me?: GithubUser;
  loading = true;
  error?: string;

  constructor(private gh: Github) {}

  ngOnInit(): void {
    this.gh.getUser('Aabril01').subscribe({
      next: u => { this.me = u; this.loading = false; },
      error: () => { this.error = 'No se pudo cargar tu perfil.'; this.loading = false; }
    });
  }
}
