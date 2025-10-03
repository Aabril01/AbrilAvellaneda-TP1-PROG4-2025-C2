import { Component, OnInit, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ResultsService } from '../../services/results.service';

@Component({
  standalone: true,
  selector: 'app-results',
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './results.html',
  styleUrls: ['./results.scss'], // <-- plural
})
export class ResultsPage implements OnInit {
  loading = () => this.resultsSvc.loading();
  error   = () => this.resultsSvc.error();
  rows    = () => this.resultsSvc.results();

  ahorcado    = computed(() => (this.rows() ?? []).filter(r => r.game === 'ahorcado'));
  mayorMenor  = computed(() => (this.rows() ?? []).filter(r => r.game === 'mayor-menor'));
  preguntados = computed(() => (this.rows() ?? []).filter(r => r.game === 'preguntados'));
  sudoku      = computed(() => (this.rows() ?? []).filter(r => r.game === 'sudoku'));

  constructor(private resultsSvc: ResultsService) {}

  async ngOnInit() {
    await this.resultsSvc.listMine();
  }

  clearDev() {
    this.resultsSvc.clearMine();
  }

  // opcional: para que el HTML pueda llamar clear()
  clear() { this.clearDev(); }
}
