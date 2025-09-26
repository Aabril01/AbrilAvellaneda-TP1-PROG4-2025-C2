import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';

type GameInfo = {
  key: 'ahorcado' | 'mayor-menor' | 'preguntados' | 'sudoku';
  title: string;
  summary: string;
  rules: string[];
  route: string;
};

@Component({
  standalone: true,
  selector: 'ng-whoami',
  imports: [NgIf, NgFor, RouterLink, CommonModule], // 👈 ahora no usás CommonModule entero
  templateUrl: './whoami.html',
  styleUrls: ['./whoami.scss']
})
export class WhoamiPage {
  titulo = 'Quién soy';

  // Si tenés AuthService podrías tomar estos datos de ahí. Lo dejo simple/estático.
  usuario = {
    nombre: 'Abril Avellaneda',
    descripcion: 'Estudiante de Programación IV. Proyecto Bitzone (Angular + Supabase).',
    githubUrl: 'https://github.com/Aabri101' // cambia por tu perfil real si querés
  };

  // Juegos (Sprint 1–4) con descripción y reglas visibles en esta página
  juegos: GameInfo[] = [
    {
      key: 'ahorcado',
      title: 'Ahorcado',
      summary: 'Adiviná la palabra antes de completar el dibujo del ahorcado.',
      rules: [
        'Tenés 6 intentos.',
        'Cada letra incorrecta dibuja una parte del ahorcado.',
        'Si completás la palabra ganás; si se completa el dibujo, perdés.',
        'Al finalizar, se guarda el puntaje en "Resultados".'
      ],
      route: '/games/ahorcado'
    },
    {
      key: 'mayor-menor',
      title: 'Mayor o menor (naipes españoles, reglas de Truco)',
      summary: 'Elegí si la próxima carta será mayor o menor que la actual según la jerarquía del Truco.',
      rules: [
        'Jerarquía (mayor → menor): 1♠, 1♣, 7♠, 7♦, 3, 2, 1♥/1♦, 12, 11, 10, 7♥/7♣, 6, 5, 4.',
        'No hay empates: si sale una carta de igual fuerza se vuelve a sacar.',
        'Se juega a 10 rondas; cada acierto suma 1 punto.',
        'Al finalizar, se guarda el puntaje en "Resultados".'
      ],
      route: '/games/mayor-menor'
    },
    {
      key: 'preguntados',
      title: 'Preguntados (API)',
      summary: 'Trivia de opción múltiple. Las preguntas vienen de una API pública.',
      rules: [
        'Se cargan N preguntas desde la API; si falla, hay fallback local.',
        'Cada pregunta tiene 4 opciones (un botón correcto y tres distractores).',
        'Se muestra el estado "correcta/incorrecta" y podés pasar a la siguiente.',
        'Al finalizar, se guarda la cantidad de correctas en "Resultados".'
      ],
      route: '/games/preguntados'
    },
    {
      key: 'sudoku',
      title: 'Sudoku (juego propio)',
      summary: 'Mini Sudoku 4×4. Completá el tablero con números del 1 al 4 sin repetir por fila, columna y subcuadrícula.',
      rules: [
        'Tablero de 4×4 dividido en subcuadrículas 2×2.',
        'No se pueden repetir números en una misma fila/columna/subcuadrícula.',
        'Controles rápidos para ingresar números y botón "Borrar".',
        'Cronómetro de juego y validaciones visuales.',
        'Al ganar (o terminar), se guarda el desempeño en "Resultados".'
      ],
      route: '/games/sudoku'
    }
  ];
}
