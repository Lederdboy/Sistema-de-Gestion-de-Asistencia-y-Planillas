import { Injectable, signal } from '@angular/core';
import { ToastMessage } from '../models/types';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  readonly currentToast = signal<ToastMessage | null>(null);
  private timeoutId: any = null;

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 3000): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.currentToast.set({ message, type });
    this.timeoutId = setTimeout(() => {
      this.currentToast.set(null);
      this.timeoutId = null;
    }, duration);
  }

  clear(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.currentToast.set(null);
  }
}

