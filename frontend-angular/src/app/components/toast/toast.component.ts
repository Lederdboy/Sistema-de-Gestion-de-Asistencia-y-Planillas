import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (toastService.currentToast(); as toast) {
      <div class="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
        <div
          [ngClass]="{
            'border-emerald-200 bg-emerald-50/95 text-emerald-900': toast.type === 'success',
            'border-rose-200 bg-rose-50/95 text-rose-900': toast.type === 'error',
            'border-amber-200 bg-amber-50/95 text-amber-900': toast.type === 'warning',
            'border-blue-200 bg-blue-50/95 text-blue-900': toast.type === 'info' || !toast.type
          }"
          class="flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-[0_18px_38px_rgba(15,23,42,0.12)] backdrop-blur-xl text-xs font-medium max-w-md"
        >
          <span class="shrink-0">
            @if (toast.type === 'success') {
              <svg class="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            } @else if (toast.type === 'error') {
              <svg class="w-4 h-4 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            } @else if (toast.type === 'warning') {
              <svg class="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            } @else {
              <svg class="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            }
          </span>
          <span class="flex-1 font-semibold leading-tight">{{ toast.message }}</span>
          <button
            (click)="toastService.clear()"
            class="p-1 hover:opacity-75 rounded transition-opacity cursor-pointer text-slate-400 hover:text-slate-700"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    }
  `,
})
export class ToastComponent {
  toastService = inject(ToastService);
}
