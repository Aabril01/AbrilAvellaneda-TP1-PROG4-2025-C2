// src/app/components/chat/chat.widget.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';

@Component({
  standalone: true,
  selector: 'ng-chat-widget',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.widget.html',
  styleUrls: ['./chat.widget.scss']
})
export class ChatWidget {
  open = false;
  text = '';
  constructor(public chat: ChatService) {}
  async send() { await this.chat.send(this.text); this.text=''; }
}
