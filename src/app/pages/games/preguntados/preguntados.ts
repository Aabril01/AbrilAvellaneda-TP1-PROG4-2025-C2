import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { ResultsService } from '../../../services/results.service';

/** ===== Tipos ===== */
type Q = { q: string; options: string[]; correctIndex: number };

interface TriviaApiV2Question {
  question: { text: string };
  correctAnswer: string;
  incorrectAnswers: string[];
}

interface LocalTriviaRow {
  pregunta: string;
  opciones: string[];
  correcta: number; // índice dentro de opciones
}

/** ===== Utils ===== */
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

@Component({
  standalone: true,
  selector: 'ng-preguntados',
  imports: [CommonModule, HttpClientModule, RouterLink],
  templateUrl: './preguntados.html',
  styleUrls: ['./preguntados.scss']
})
export class PreguntadosPage {
  constructor(private http: HttpClient, private results: ResultsService) {}

  loading = signal(false);
  error = signal<string>('');
  questions = signal<Q[]>([]);
  idx = signal(0);
  score = signal(0);
  answered = signal<number | null>(null);

  finished = computed(() => this.idx() >= this.questions().length);
  current  = computed(() => this.questions()[this.idx()]);

  ngOnInit() {
    this.fetchTriviaApiEs(10); // intenta API en español
  }

  /** Llama a The Trivia API (v2) en español */
  private fetchTriviaApiEs(limit = 10) {
    this.loading.set(true);
    this.error.set('');

    const url = `https://the-trivia-api.com/v2/questions?limit=${limit}&language=es&region=AR`;

    this.http.get<TriviaApiV2Question[]>(url).subscribe({
      next: (rows) => {
        const mapped: Q[] = rows.map((item) => {
          const correct = item.correctAnswer;
          const options = shuffle<string>([correct, ...item.incorrectAnswers]);
          return {
            q: item.question?.text ?? '',
            options,
            correctIndex: options.findIndex((o: string) => o === correct)
          };
        }).filter(q => q.q && q.options.length === 4 && q.correctIndex >= 0);

        if (!mapped.length) throw new Error('Respuesta inesperada');

        this.questions.set(mapped);
        this.idx.set(0);
        this.score.set(0);
        this.answered.set(null);
      },
      error: () => {
        // Si la API falla, usa fallback local (no rompe la demo)
        this.fetchLocalFallback(limit);
      },
      complete: () => this.loading.set(false)
    });
  }

  /** Fallback local: usa /assets/trivia-es.json (con tipos explícitos) */
  private fetchLocalFallback(amount = 10) {
    this.http.get<LocalTriviaRow[]>('/assets/trivia-es.json').subscribe({
      next: (rows) => {
        const pool = rows.slice(0, amount);
        const mapped: Q[] = pool.map((item: LocalTriviaRow) => {
          const correct = item.opciones[item.correcta];       // string correcto
          const options = shuffle<string>(item.opciones.slice()); // string[]
          return {
            q: item.pregunta,
            options,
            correctIndex: options.findIndex((o: string) => o === correct)
          };
        });

        this.questions.set(mapped);
        this.idx.set(0);
        this.score.set(0);
        this.answered.set(null);
      },
      error: () => this.error.set('No se pudo cargar la trivia (API y fallback fallaron).')
    });
  }

  choose(i: number) {
    if (this.answered() !== null || !this.current()) return;
    this.answered.set(i);
    if (i === this.current()!.correctIndex) this.score.set(this.score() + 1);
  }

  nextOrFinish() {
    this.answered.set(null);
    this.idx.set(this.idx() + 1);
    if (this.idx() >= this.questions().length) {
      this.results.addResult('preguntados', this.score());
    }
  }

  retry() {
    this.fetchTriviaApiEs(10);
  }
}
