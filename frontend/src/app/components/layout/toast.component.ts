import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (toastService.toast(); as t) {
      <div class="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
        <div [ngClass]="{
          'border-emerald-200 bg-emerald-50 text-emerald-900': t.type === 'success',
          'border-rose-200 bg-rose-50 text-rose-900': t.type === 'error',
          'border-blue-200 bg-blue-50 text-blue-900': t.type === 'info'
        }" class="flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-xl text-xs font-medium max-w-md">
          
          @if (t.type === 'success') {
            <svg class="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          } @else if (t.type === 'error') {
            <svg class="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          } @else {
            <svg class="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }

          <span class="flex-1">{{ t.text }}</span>
          
          <button (click)="toastService.clear()" class="p-1 hover:opacity-75 rounded transition-opacity cursor-pointer">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    }
  `
})
export class ToastComponent {
  toastService = inject(ToastService);
}

