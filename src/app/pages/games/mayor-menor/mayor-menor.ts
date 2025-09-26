// src/app/pages/games/mayor-menor/mayor-menor.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ResultsService } from '../../../services/results.service';

type Palo = 'espadas' | 'bastos' | 'oros' | 'copas';
type Carta = { numero: number; palo: Palo; img: string };

const CARDS_BASE = '/naipes-es';
const EXT = 'PNG';

// Palos y números disponibles en la baraja española (truco)
const PALOS: Palo[] = ['espadas', 'bastos', 'oros', 'copas'];
const NUMEROS = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];

function imgPath(palo: Palo, numero: number): string {
  return `${CARDS_BASE}/${palo}-${numero}.${EXT}`;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function cartaRandom(): Carta {
  const numero = pick(NUMEROS);
  const palo = pick(PALOS);
  return { numero, palo, img: imgPath(palo, numero) };
}


function fuerzaTruco(c: Carta): number {
  const { numero: n, palo: p } = c;

  // Matadores
  if (n === 1 && p === 'espadas') return 14; // 1♠
  if (n === 1 && p === 'bastos')  return 13; // 1♣ (bastos)
  if (n === 7 && p === 'espadas') return 12; // 7♠
  if (n === 7 && p === 'oros')    return 11; // 7♦ (oros)

  // Grupos
  if (n === 3) return 10;
  if (n === 2) return 9;
  if (n === 1 && (p === 'copas' || p === 'oros')) return 8; // 1♥ / 1♦
  if (n === 12) return 7;
  if (n === 11) return 6;
  if (n === 10) return 5;
  if (n === 7 && (p === 'copas' || p === 'bastos')) return 4; // 7♥ / 7♣
  if (n === 6) return 3;
  if (n === 5) return 2;
  if (n === 4) return 1;

  return 0; // no debería ocurrir
}

@Component({
  standalone: true,
  selector: 'ng-mayor-menor',
  imports: [CommonModule, RouterLink],
  templateUrl: './mayor-menor.html',
  styleUrls: ['./mayor-menor.scss']
})
export class MayorMenorPage {
  constructor(private resultsSvc: ResultsService) {}

  titulo = 'Mayor o menor (naipes españoles, reglas del Truco)';
  ronda = signal(0);
  score = signal(0);
  terminado = signal(false);

  // Carta que se muestra en la UI
  actual = signal<Carta>(cartaRandom());

  /** Saca una carta con fuerza distinta para evitar empates. */
  private sacarDistintaFuerza(ref: Carta): Carta {
    const f = fuerzaTruco(ref);
    let next: Carta;
    do { next = cartaRandom(); } while (fuerzaTruco(next) === f);
    return next;
  }

  /** Avanza de ronda; si acierta, suma; si termina, guarda resultados. */
  private avanzar(acerto: boolean, siguiente: Carta) {
    if (acerto) this.score.set(this.score() + 1);
    this.ronda.set(this.ronda() + 1);

    if (this.ronda() >= 10) {
      this.terminado.set(true);
      // Guardar score final
      this.resultsSvc.addResult('mayor-menor', this.score());
    } else {
      // La carta vista pasa a ser la que “salió”
      this.actual.set(siguiente);
    }
  }

  /** Acción de los botones */
  elegir(op: 'mayor' | 'menor') {
    const c1 = this.actual();                 // carta mostrada
    const c2 = this.sacarDistintaFuerza(c1);  // carta “oculta” para comparar

    const v1 = fuerzaTruco(c1);
    const v2 = fuerzaTruco(c2);

    // Si la próxima es mayor según Truco...
    const proximaEsMayor = v2 > v1;
    const acerto = (op === 'mayor' && proximaEsMayor) || (op === 'menor' && !proximaEsMayor);

    this.avanzar(acerto, c2);
  }

  retry() {
    this.ronda.set(0);
    this.score.set(0);
    this.terminado.set(false);
    this.actual.set(cartaRandom());
  }
}
