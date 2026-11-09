import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#F8FAFC]">
      <!-- Background pattern -->
      <div
        class="absolute inset-0 pointer-events-none"
        style="background-image: radial-gradient(rgba(15, 23, 42, 0.16) 1.2px, transparent 1.2px); background-size: 22px 22px;"
      ></div>

      <!-- Login Card -->
      <div class="relative w-full max-w-[440px] bg-white border border-slate-200/90 rounded-2xl shadow-[0_12px_36px_rgba(15,23,42,0.06)] p-7 sm:p-9 z-10">
        <!-- Logo and Title -->
        <div class="flex flex-col items-center text-center mb-7">
          <img src="/logo.png" alt="Logo" class="h-12 w-auto object-contain mb-3 drop-shadow-xs" />
          <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Planilla Enterprise
          </h1>
          <p class="text-xs text-slate-500 font-medium mt-1">
            Sistema de Gestión de Asistencia y Nómina (Angular)
          </p>
        </div>

        <!-- Error alert -->
        @if (error()) {
          <div class="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700">
            <span class="h-2 w-2 rounded-full bg-rose-500 flex-shrink-0"></span>
            <span>{{ error() }}</span>
          </div>
        }

        <!-- Form -->
        <form (ngSubmit)="handleSubmit()" class="space-y-4">
          <div>
            <label class="mb-1.5 block text-xs font-semibold text-slate-700">
              Usuario o correo corporativo
            </label>
            <div class="relative">
              <svg class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                type="text"
                name="email"
                [(ngModel)]="email"
                placeholder="usuario@empresa.com"
                class="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-3 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          <div>
            <div class="mb-1.5 flex items-center justify-between">
              <label class="block text-xs font-semibold text-slate-700">
                Contraseña
              </label>
              <button
                type="button"
                (click)="onForgotPassword()"
                class="text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors cursor-pointer"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div class="relative">
              <svg class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                [type]="showPassword() ? 'text' : 'password'"
                name="password"
                [(ngModel)]="password"
                placeholder="••••••••"
                class="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-3 focus:ring-blue-100 transition-all"
              />
              <button
                type="button"
                (click)="showPassword.set(!showPassword())"
                class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                @if (showPassword()) {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                } @else {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                }
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between pt-0.5">
            <label class="flex cursor-pointer items-center gap-2 select-none text-xs text-slate-600">
              <input
                type="checkbox"
                name="rememberMe"
                [(ngModel)]="rememberMe"
                class="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>Mantener sesión iniciada</span>
            </label>
          </div>

          <button
            type="submit"
            [disabled]="loading()"
            class="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
          >
            @if (loading()) {
              <div class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
            } @else {
              <span>Iniciar sesión</span>
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            }
          </button>
        </form>

        <!-- Demo credentials -->
        <div class="mt-6 pt-5 border-t border-slate-100">
          <p class="mb-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Accesos de Demostración
          </p>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              (click)="handleDemoFill('admin')"
              class="h-9 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-700 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center shadow-xs"
            >
              Admin General
            </button>
            <button
              type="button"
              (click)="handleDemoFill('rrhh')"
              class="h-9 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-700 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center shadow-xs"
            >
              Especialista RRHH
            </button>
          </div>
        </div>

        <div class="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <svg class="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Acceso seguro • Normativa SUNAT / PLAME / AFP Net</span>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  authService = inject(AuthService);
  toastService = inject(ToastService);
  router = inject(Router);

  email = 'admin@empresa.com';
  password = 'admin123';
  showPassword = signal<boolean>(false);
  rememberMe = true;
  loading = signal<boolean>(false);
  error = signal<string>('');

  handleDemoFill(role: 'admin' | 'rrhh') {
    if (role === 'admin') {
      this.email = 'admin@empresa.com';
      this.password = 'admin123';
    } else {
      this.email = 'rrhh@empresa.com';
      this.password = 'rrhh123';
    }
    this.error.set('');
  }

  onForgotPassword() {
    alert('Para restablecer tu contraseña, contacta al área de TI o Administrador del sistema.');
  }

  async handleSubmit() {
    this.error.set('');
    if (!this.email || !this.password) {
      this.error.set('Por favor ingresa tu usuario y contraseña.');
      return;
    }

    this.loading.set(true);
    await this.authService.login(this.email, this.password, this.rememberMe);
    this.loading.set(false);
    this.toastService.show('¡Bienvenido a Planilla Enterprise!', 'success');
    this.router.navigate(['/dashboard']);
  }
}

