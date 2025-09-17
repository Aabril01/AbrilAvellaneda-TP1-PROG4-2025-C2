import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ResultsService } from '../../../services/results.service';

const WORDS = [
  'ANGULAR','PROGRAMACION','ALGORITMO','SUPABASE','COMPONENTE',
  'SERVICIO','DIRECTIVA','TEMPLATE','LAZY','SEÑALES','GITHUB'
];

@Component({
  standalone: true,
  selector: 'app-ahorcado',
  imports: [RouterLink],
  templateUrl: './ahorcado.html',
  styleUrl: './ahorcado.scss'
})
export class AhorcadoPage {
  // estado
  word = signal<string>(this.pickWord());
  guesses = signal<Set<string>>(new Set());
  attemptsLeft = signal<number>(6);
  status = signal<'playing'|'won'|'lost'>('playing'); // para UI

  // derivados
  masked = computed(() => {
    const w = this.word();
    const g = this.guesses();
    return w.split('').map(ch => g.has(ch) ? ch : ' _ ').join('');
  });

  alphabet = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

  constructor(private results: ResultsService) {
    // sincronizar errors con attemptsLeft
    const update = () => this.errors.set(6 - this.attemptsLeft());
    update();
    // parche simple: cada vez que se llame guess/reset, se recalcula:
    const origGuess = this.guess.bind(this);
    this.guess = (l: string) => { origGuess(l); update(); };
    const origReset = this.reset.bind(this);
    this.reset = () => { origReset(); update(); };
  }

  private pickWord(): string {
    return WORDS[Math.floor(Math.random()*WORDS.length)];
  }

  guess(letter: string) {
    if (this.status() !== 'playing') return;
    const g = new Set(this.guesses());
    if (g.has(letter)) return;

    g.add(letter);
    this.guesses.set(g);

    const w = this.word();
    if (!w.includes(letter)) {
      this.attemptsLeft.set(this.attemptsLeft() - 1);
      if (this.attemptsLeft() <= 0) {
        this.status.set('lost');
        // score simple: 0 si pierde
        this.results.addResult('ahorcado', 0);
      }
    } else {
      // ¿ganó?
      const allRevealed = w.split('').every(ch => g.has(ch));
      if (allRevealed) {
        this.status.set('won');
        // score: intentos restantes * 10
        this.results.addResult('ahorcado', this.attemptsLeft() * 10);
      }
    }
  }

  reset() {
    this.word.set(this.pickWord());
    this.guesses.set(new Set());
    this.attemptsLeft.set(6);
    this.status.set('playing');
  }

  isGuessed(l: string) { return this.guesses().has(l); }

// errores usados = 6 - attemptsLeft()
  errors = signal<number>(0);
}


