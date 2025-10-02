import { Component, computed, signal, OnDestroy } from '@angular/core';
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
export class AhorcadoPage implements OnDestroy {
  // --- juego base (tu lógica) ---
  word = signal<string>(this.pickWord());
  guesses = signal<Set<string>>(new Set());
  attemptsLeft = signal<number>(6);
  status = signal<'playing'|'won'|'lost'>('playing');

  alphabet = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

  masked = computed(() => {
    const w = this.word();
    const g = this.guesses();
    return w.split('').map(ch => g.has(ch) ? ch : ' _ ').join('');
  });

  // --- HUD NUEVO ---
  // tiempo
  elapsedSec = signal<number>(0);
  private timer: any = null;
  private started = false;

  // contadores HUD
  aciertos = signal<number>(0);      // letras acertadas (cuenta apariciones)
  puntos   = signal<number>(0);      // se setea al final (ganar = intentsRestantes*10; perder = 0)

  // errores usados = 6 - attemptsLeft()
  errors = signal<number>(0);

  constructor(private results: ResultsService) {
    // sincronizar errors con attemptsLeft
    const sync = () => this.errors.set(6 - this.attemptsLeft());
    sync();
    const _guess = this.guess.bind(this);
    this.guess = (l: string) => { _guess(l); sync(); };
    const _reset = this.reset.bind(this);
    this.reset = () => { _reset(); sync(); };
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  // helpers para el template (evita errores "property X does not exist")
  corrects() { return this.aciertos(); }
  points()   { return this.puntos();   }

  // --- tiempo ---
  private startTimerOnce() {
    if (this.started) return;
    this.started = true;
    this.timer = setInterval(() => {
      this.elapsedSec.set(this.elapsedSec() + 1);
    }, 1000);
  }
  private stopTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  private pickWord(): string {
    return WORDS[Math.floor(Math.random() * WORDS.length)];
  }

  guess(letter: string) {
    if (this.status() !== 'playing') return;

    // arranca el cronómetro en la primera jugada
    this.startTimerOnce();

    const g = new Set(this.guesses());
    if (g.has(letter)) return;

    g.add(letter);
    this.guesses.set(g);

    const w = this.word();
    if (!w.includes(letter)) {
      this.attemptsLeft.set(this.attemptsLeft() - 1);
      if (this.attemptsLeft() <= 0) {
        this.status.set('lost');
        this.stopTimer();
        this.puntos.set(0);
        // guardar resultado
        this.results.addResult('ahorcado', this.puntos());
      }
    } else {
      // cuántas veces aparece la letra (sumo aciertos)
      const apariciones = w.split('').filter(ch => ch === letter).length;
      this.aciertos.set(this.aciertos() + apariciones);

      // ¿ganó?
      const allRevealed = w.split('').every(ch => g.has(ch));
      if (allRevealed) {
        this.status.set('won');
        this.stopTimer();
        // puntaje: intentos restantes * 10 (igual que tenías antes)
        this.puntos.set(this.attemptsLeft() * 10);
        this.results.addResult('ahorcado', this.puntos());
      }
    }
  }

  reset() {
    this.stopTimer();
    this.started = false;
    this.elapsedSec.set(0);

    this.word.set(this.pickWord());
    this.guesses.set(new Set());
    this.attemptsLeft.set(6);
    this.status.set('playing');

    // HUD a cero
    this.aciertos.set(0);
    this.puntos.set(0);
    this.errors.set(0);
  }

  isGuessed(l: string) { return this.guesses().has(l); }
}
