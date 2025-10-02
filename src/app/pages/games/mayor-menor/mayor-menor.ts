import { Component, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ResultsService } from '../../../services/results.service';

type Palo = 'espadas' | 'bastos' | 'oros' | 'copas';
type Carta = { numero: number; palo: Palo; img: string };

const CARDS_BASE = '/naipes-es';
const EXT = 'PNG';
const PALOS: Palo[] = ['espadas', 'bastos', 'oros', 'copas'];
const NUMEROS = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];

function imgPath(p: Palo, n: number) { return `${CARDS_BASE}/${p}-${n}.${EXT}`; }
function pick<T>(a: T[]): T { return a[Math.floor(Math.random() * a.length)]; }
function cartaRandom(): Carta {
  const numero = pick(NUMEROS);
  const palo = pick(PALOS);
  return { numero, palo, img: imgPath(palo, numero) };
}

/** Escala Truco: mayor → menor */
function fuerzaTruco(c: Carta): number {
  const { numero: n, palo: p } = c;
  if (n === 1 && p === 'espadas') return 14;
  if (n === 1 && p === 'bastos')  return 13;
  if (n === 7 && p === 'espadas') return 12;
  if (n === 7 && p === 'oros')    return 11;
  if (n === 3) return 10;
  if (n === 2) return 9;
  if (n === 1 && (p === 'copas' || p === 'oros')) return 8;
  if (n === 12) return 7;
  if (n === 11) return 6;
  if (n === 10) return 5;
  if (n === 7 && (p === 'copas' || p === 'bastos')) return 4;
  if (n === 6) return 3;
  if (n === 5) return 2;
  if (n === 4) return 1;
  return 0;
}

function parDistinto(): { izq: Carta; der: Carta } {
  let a = cartaRandom(), b = cartaRandom();
  while (fuerzaTruco(a) === fuerzaTruco(b)) b = cartaRandom();
  return { izq: a, der: b };
}

@Component({
  standalone: true,
  selector: 'ng-mayor-menor',
  imports: [CommonModule, RouterLink],
  templateUrl: './mayor-menor.html',
  styleUrls: ['./mayor-menor.scss']
})
export class MayorMenorPage implements OnDestroy {
  constructor(private resultsSvc: ResultsService) {}

  titulo = 'Mayor o menor (naipes españoles, reglas del Truco)';

  // HUD
  readonly RONDAS_MAX = 10;
  ronda = signal(0);
  aciertos = signal(0);
  puntos  = signal(0);

  // tiempo
  elapsedSec = signal(0);
  private t?: any;

  // estado
  fin = signal(false);
  izq = signal<Carta>(cartaRandom());
  der = signal<Carta>(cartaRandom()); // la derecha está boca abajo en UI (solo se usa para comparar)

  ngOnInit() {
    const p = parDistinto();
    this.izq.set(p.izq);
    this.der.set(p.der);
    this.startTimer();
  }

  ngOnDestroy(): void { clearInterval(this.t); }

  private startTimer() {
    clearInterval(this.t);
    const start = Date.now();
    this.t = setInterval(() => this.elapsedSec.set(Math.floor((Date.now() - start)/1000)), 1000);
  }

  private actualizarHUD(acierto: boolean) {
    if (acierto) {
      this.aciertos.set(this.aciertos() + 1);
      this.puntos.set(this.puntos() + 1); // 1 punto por acierto (ajustá si querés otro cálculo)
    }
    this.ronda.set(this.ronda() + 1);
  }

  private avanzar(acierto: boolean) {
    this.actualizarHUD(acierto);

    if (this.ronda() >= this.RONDAS_MAX) {
      clearInterval(this.t);
      this.fin.set(true);
      // guarda resultado (puntaje principal = puntos)
      this.resultsSvc.addResult('mayor-menor', this.puntos());
      return;
    }

    const p = parDistinto();
    this.izq.set(p.izq);
    this.der.set(p.der);
  }

  /** Botones: ¿la IZQUIERDA es menor o mayor que la DERECHA según TRUCO? */
  elegir(op: 'menor' | 'mayor') {
    const fL = fuerzaTruco(this.izq());
    const fR = fuerzaTruco(this.der());
    const acierto = (op === 'menor' && fL < fR) || (op === 'mayor' && fL > fR);
    this.avanzar(acierto);
  }

  retry() {
    this.ronda.set(0);
    this.aciertos.set(0);
    this.puntos.set(0);
    this.fin.set(false);
    const p = parDistinto();
    this.izq.set(p.izq);
    this.der.set(p.der);
    this.elapsedSec.set(0);
    this.startTimer();
  }
}
