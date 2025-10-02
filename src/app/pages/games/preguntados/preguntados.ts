import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ResultsService } from '../../../services/results.service';

type Q = { q: string; options: string[]; correctIndex: number; };

type OpenTriviaQuestion = {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
};

function shuffle<T>(a: T[]): T[] {
  const c = a.slice();
  for (let i=c.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [c[i],c[j]]=[c[j],c[i]]; }
  return c;
}
function decodeHtml(s: string) { const t = document.createElement('textarea'); t.innerHTML = s; return t.value; }

@Component({
  standalone: true,
  selector: 'ng-preguntados',
  imports: [CommonModule, RouterLink, HttpClientModule],
  templateUrl: './preguntados.html',
  styleUrls: ['./preguntados.scss']
})
export class PreguntadosPage implements OnInit {
  constructor(private http: HttpClient, private results: ResultsService) {}

  // HUD
  INTENTOS_MAX = 10;
  intentos = signal(0);
  aciertos = signal(0);
  puntos   = signal(0);
  elapsed  = signal(0);
  private timer?: any;

  // juego
  questions = signal<Q[]>([]);
  idx = signal(0);
  answered = signal<number | null>(null);
  loading = signal(false);
  error = signal('');

  finished = computed(() => this.idx() >= this.questions().length);

  // Ruleta
  categories = [
    { id: 11, name: 'Entretenimiento', emoji: '🎬' },
    { id: 17, name: 'Ciencia',         emoji: '🧪' },
    { id: 22, name: 'Geografía',       emoji: '🗺️' },
    { id: 23, name: 'Historia',        emoji: '🏛️' },
    { id: 25, name: 'Arte',            emoji: '🎨' },
    { id: 21, name: 'Deportes',        emoji: '🏅' },
  ];
  spinning = signal(false);
  selectedCat = signal<{id:number; name:string; emoji:string} | null>(null);

  ngOnInit(): void {
    this.resetHud();
  }

  private startTimer() {
    clearInterval(this.timer);
    const start = Date.now();
    this.timer = setInterval(() => this.elapsed.set(Math.floor((Date.now()-start)/1000)), 1000);
  }

  private stopTimer() { clearInterval(this.timer); }

  private resetHud() {
    this.intentos.set(0);
    this.aciertos.set(0);
    this.puntos.set(0);
    this.elapsed.set(0);
    this.stopTimer();
  }

  spinWheel() {
    if (this.spinning()) return;
    this.spinning.set(true);
    this.selectedCat.set(null);
    // girar ~2.5s y elegir al azar
    const winner = this.categories[Math.floor(Math.random()*this.categories.length)];
    setTimeout(() => {
      this.selectedCat.set(winner);
      this.spinning.set(false);
      this.loadFromApi(10, winner.id); // carga preguntas de la categoría
    }, 2500);
  }

  /** API */
  private loadFromApi(amount: number, categoryId: number) {
    this.loading.set(true);
    this.error.set('');
    this.questions.set([]);
    this.idx.set(0);
    this.answered.set(null);
    this.resetHud();
    this.startTimer();

    const url = `https://opentdb.com/api.php?amount=${amount}&type=multiple&category=${categoryId}`;
    this.http.get<{ results: OpenTriviaQuestion[] }>(url).subscribe({
      next: (res) => {
        const mapped: Q[] = (res.results ?? []).map(raw => {
          const correct = decodeHtml(raw.correct_answer);
          const options = shuffle([...raw.incorrect_answers.map(decodeHtml), correct]);
          return { q: decodeHtml(raw.question), options, correctIndex: options.findIndex(o => o === correct) };
        });
        if (!mapped.length) this.error.set('La API no devolvió preguntas.');
        this.questions.set(mapped);
      },
      error: () => this.error.set('No se pudieron obtener preguntas de la API.'),
      complete: () => this.loading.set(false)
    });
  }

  current(): Q { return this.questions()[this.idx()]; }

  choose(i: number) {
    if (this.answered() !== null || this.finished()) return;
    this.answered.set(i);
    this.intentos.set(this.intentos()+1);
    const ok = i === this.current().correctIndex;
    if (ok) { this.aciertos.set(this.aciertos()+1); this.puntos.set(this.puntos()+100); }
  }

  next() {
    if (this.answered() === null) return;
    if (this.idx() === this.questions().length - 1) {
      this.stopTimer();
      // guardar en BD
      this.results.addResult('preguntados', this.puntos());
      this.idx.set(this.idx()+1);
      return;
    }
    this.idx.set(this.idx()+1);
    this.answered.set(null);
  }

  retry() {
    const cat = this.selectedCat();
    if (!cat) return;
    this.loadFromApi(10, cat.id);
  }
}
