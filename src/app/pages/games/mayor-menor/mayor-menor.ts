import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ResultsService } from '../../../services/results.service';

type Suit = 'oros' | 'copas' | 'espadas' | 'bastos';
type Rank = 1|2|3|4|5|6|7|10|11|12;
type Card = { suit: Suit; rank: Rank };

const SUITS: Suit[] = ['oros','copas','espadas','bastos'];
const RANKS: Rank[] = [1,2,3,4,5,6,7,10,11,12];

function randomCard(): Card {
  const s = SUITS[Math.floor(Math.random()*SUITS.length)];
  const r = RANKS[Math.floor(Math.random()*RANKS.length)];
  return { suit: s, rank: r };
}

@Component({
  standalone: true,
  selector: 'app-mayor-menor',
  imports: [RouterLink],
  templateUrl: './mayor-menor.html',
  styleUrl: './mayor-menor.scss'
})
export class MayorMenorPage {
  current = signal<Card>(randomCard());
  next = signal<Card | null>(null);
  rounds = signal<number>(0);
  maxRounds = 10;
  score = signal<number>(0);
  status = signal<'playing'|'finished'>('playing');

  constructor(private results: ResultsService) {}

  cardSrc(c: Card | null) {
    if (!c) return '';
    return `/naipes-es/${c.suit}-${c.rank}.PNG`;
  }

  rankValue(r: Rank) {
    // comparación simple por número (no jerarquía de truco)
    return r;
  }

  play(choice: 'mayor'|'menor') {
    if (this.status() !== 'playing') return;
    const n = randomCard();
    this.next.set(n);

    const prev = this.rankValue(this.current().rank);
    const nxt  = this.rankValue(n.rank);
    const ok   = choice === 'mayor' ? nxt > prev : nxt < prev;

    if (ok) this.score.set(this.score() + 10);

    this.rounds.set(this.rounds() + 1);
    this.current.set(n);

    if (this.rounds() >= this.maxRounds) {
      this.status.set('finished');
      this.results.addResult('mayor-menor', this.score());
    }
  }

  reset() {
    this.current.set(randomCard());
    this.next.set(null);
    this.rounds.set(0);
    this.score.set(0);
    this.status.set('playing');
  }
}
