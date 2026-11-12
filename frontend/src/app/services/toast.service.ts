import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  text: string;
  type: 'success' | 'error' | 'info';
  id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private currentToast = signal<ToastMessage | null>(null);
  toast = this.currentToast.asReadonly();
  private timer: any;

  show(text: string, type: 'success' | 'error' | 'info' = 'success', duration = 3500) {
    if (this.timer) clearTimeout(this.timer);
    this.currentToast.set({ text, type, id: Date.now() });

    this.timer = setTimeout(() => {
      this.clear();
    }, duration);
  }

  clear() {
    this.currentToast.set(null);
  }
}

