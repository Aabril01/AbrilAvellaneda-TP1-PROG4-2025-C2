import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ResultsService } from '../../../services/results.service';

function rand1to100() { return 1 + Math.floor(Math.random()*100); }

@Component({
  standalone: true,
  selector: 'app-mayor-menor',
  imports: [RouterLink],
  templateUrl: './mayor-menor.html',
  styleUrl: './mayor-menor.scss'
})
export class MayorMenorPage {
  current = signal<number>(rand1to100());
  next = signal<number | null>(null);
  rounds = signal<number>(0);
  maxRounds = 10;
  score = signal<number>(0);
  status = signal<'playing'|'finished'>('playing');

  constructor(private results: ResultsService) {}

  play(choice: 'mayor'|'menor') {
    if (this.status() !== 'playing') return;
    const n = rand1to100();
    this.next.set(n);

    const ok = (choice === 'mayor') ? n > this.current() : n < this.current();
    if (ok) this.score.set(this.score() + 10);

    this.rounds.set(this.rounds() + 1);
    this.current.set(n);

    if (this.rounds() >= this.maxRounds) {
      this.status.set('finished');
      this.results.addResult('mayor-menor', this.score());
    }
  }

  reset() {
    this.current.set(rand1to100());
    this.next.set(null);
    this.rounds.set(0);
    this.score.set(0);
    this.status.set('playing');
  }
}
