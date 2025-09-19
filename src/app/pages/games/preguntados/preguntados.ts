import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultsService } from '../../../services/results.service';
import { RouterLink } from '@angular/router';

type Q = { q: string; options: string[]; correct: number };

@Component({
  standalone: true,
  selector: 'ng-preguntados',
  imports: [CommonModule, RouterLink],
  templateUrl: './preguntados.html',
  styleUrls: ['./preguntados.scss']
})
export class PreguntadosPage {
  constructor(private results: ResultsService) {}

  private bank: Q[] = [
    { q: '¿Capital de Francia?', options: ['Madrid','París','Roma','Berlín'], correct: 1 },
    { q: '¿2 + 2 × 3 = ?', options: ['12','8','10','6'], correct: 1 },
    { q: 'Lenguaje de estilos web', options: ['SQL','CSS','C#','Bash'], correct: 1 },
    { q: 'Planeta rojo', options: ['Venus','Marte','Júpiter','Mercurio'], correct: 1 },
    { q: 'Criatura marina mamífera', options: ['Tiburón','Pulpo','Delfín','Calamar'], correct: 2 },
    { q: 'Autor de “Don Quijote”', options: ['Cervantes','Borges','García Márquez','Pizarnik'], correct: 0 },
    { q: 'Monte más alto', options: ['Aconcagua','K2','Everest','Kilimanjaro'], correct: 2 },
    { q: 'Símbolo químico del oro', options: ['Ag','Au','Fe','Pb'], correct: 1 },
    { q: 'Sistema de control de versiones', options: ['Git','NPM','Webpack','Jest'], correct: 0 },
    { q: 'Año bisiesto tiene', options: ['365','366','364','363'], correct: 1 },
  ];

  idx = signal(0);
  score = signal(0);
  answered = signal<number | null>(null); // opción elegida
  finished = computed(() => this.idx() >= this.bank.length);
  current = computed(() => this.bank[this.idx()]!);

  choose(i: number) {
    if (this.answered() !== null) return;
    this.answered.set(i);
    if (i === this.current().correct) this.score.set(this.score() + 10);
  }

  nextOrFinish() {
    // pasar a la siguiente
    this.answered.set(null);
    this.idx.set(this.idx() + 1);

    // si terminó, guardar resultado
    if (this.idx() >= this.bank.length) {
      this.results.addResult('preguntados', this.score());
    }
  }
}
