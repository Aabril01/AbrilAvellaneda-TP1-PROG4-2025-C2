
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'ng-hud',
  imports: [CommonModule],
  templateUrl: './hud.component.html',
  styleUrls: ['./hud.component.scss']
})
export class HudComponent {
  @Input() title = '';
  @Input() attempts = 0;
  @Input() left = 0;
  @Input() hits = 0;
  @Input() points = 0;
  @Input() time: string | null = null;   // <-- antes era string
}
