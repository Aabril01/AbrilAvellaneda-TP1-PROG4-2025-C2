// src/app/services/chat.service.ts
import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export type ChatMsg = {
  id?: string;
  user_id: string;
  email?: string | null;
  text: string;
  created_at?: string;
};

@Injectable({ providedIn: 'root' })
export class ChatService {
  private supabase?: SupabaseClient;
  private useLocalFallback = false;

  msgs = signal<ChatMsg[]>([]);
  loading = signal(false);

  constructor(private auth: AuthService) {
    if (environment.supabaseUrl && environment.supabaseAnonKey) {
      this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
      // live feed
      this.supabase
        .channel('chat_messages')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => this.load())
        .subscribe();
    } else {
      this.useLocalFallback = true;
    }
    this.load();
  }

  async load() {
    this.loading.set(true);
    try {
      if (this.useLocalFallback) {
        const arr: ChatMsg[] = JSON.parse(localStorage.getItem('chat_messages') || '[]');
        this.msgs.set(arr.slice(-100));
      } else {
        const { data } = await this.supabase!.from('chat_messages').select('*').order('created_at', { ascending: false }).limit(100);
        this.msgs.set((data ?? []).reverse() as ChatMsg[]);
      }
    } finally { this.loading.set(false); }
  }

  async send(text: string) {
    const u = this.auth.user();
    if (!u || !text.trim()) return;
    const row: ChatMsg = { user_id: u.id, email: u.email ?? null, text: text.trim() };

    if (this.useLocalFallback) {
      const arr: ChatMsg[] = JSON.parse(localStorage.getItem('chat_messages') || '[]');
      arr.push({ ...row, id: crypto.randomUUID(), created_at: new Date().toISOString() });
      localStorage.setItem('chat_messages', JSON.stringify(arr));
      this.load();
    } else {
      await this.supabase!.from('chat_messages').insert(row);
    }
  }
}
