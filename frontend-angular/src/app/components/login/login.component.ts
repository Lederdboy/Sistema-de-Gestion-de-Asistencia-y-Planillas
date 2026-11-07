import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#F8FAFC]">
      <!-- Fondo abstracto con puntitos -->
      <div
        class="absolute inset-0 pointer-events-none"
        style="background-image: radial-gradient(rgba(15, 23, 42, 0.16) 1.2px, transparent 1.2px); background-size: 22px 22px;"
      ></div>

      <!-- Tarjeta de Login Formal y Clásica -->
      <div class="relative w-full max-w-[440px] bg-white border border-slate-200/90 rounded-2xl shadow-[0_12px_36px_rgba(15,23,42,0.06)] p-7 sm:p-9 z-10">
        <!-- Cabecera con Logo Corporativo de Nómina y Título -->
        <div class="flex flex-col items-center text-center mb-7">
          <img
            src="logo.png"
            alt="Logo Nómina Enterprise"
            class="h-14 w-auto object-contain mb-3 drop-shadow-xs transition-transform duration-200 hover:scale-105"
          />
          <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Nómina Enterprise
          </h1>
          <p class="text-xs text-slate-500 font-medium mt-1">
            Sistema Integrado de Asistencia, Planillas y Gestión Laboral
          </p>
        </div>

        <!-- Mensaje de error si aplica -->
        @if (error()) {
          <div class="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700">
            <svg class="w-4 h-4 text-rose-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{{ error() }}</span>
          </div>
        }

        <!-- Formulario de Inicio de Sesión -->
        <form (ngSubmit)="handleSubmit()" class="space-y-4">
          <div>
            <label class="mb-1.5 block text-xs font-semibold text-slate-700">
              Usuario o correo corporativo
            </label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </span>
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
                (click)="onForgot()"
                class="text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
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
                [title]="showPassword() ? 'Ocultar contraseña' : 'Ver contraseña'"
              >
                @if (showPassword()) {
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/>
                    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/>
                    <path d="M17.479 17.499A10.75 10.75 0 0 1 2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 2.898-3.995"/>
                    <line x1="2" x2="22" y1="2" y2="22"/>
                  </svg>
                } @else {
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
                    <circle cx="12" cy="12" r="3"/>
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
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            }
          </button>
        </form>

        <!-- Accesos de demostración rápidos -->
        <div class="mt-6 pt-5 border-t border-slate-100">
          <p class="mb-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Accesos de Demostración
          </p>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              (click)="handleDemoFill('admin')"
              class="h-9 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-700 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center shadow-2xs"
            >
              Admin General
            </button>
            <button
              type="button"
              (click)="handleDemoFill('rrhh')"
              class="h-9 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-700 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center shadow-2xs"
            >
              Especialista RRHH
            </button>
          </div>
        </div>

        <!-- Pie de seguridad formal con SVG profesional -->
        <div class="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <svg class="w-3.5 h-3.5 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
          <span>Acceso seguro • Normativa SUNAT / PLAME / AFP Net</span>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);

  email = 'admin@empresa.com';
  password = 'admin123';
  showPassword = signal(false);
  rememberMe = true;
  loading = signal(false);
  error = signal('');

  handleSubmit(): void {
    this.error.set('');
    if (!this.email || !this.password) {
      this.error.set('Por favor ingresa tu usuario y contraseña.');
      return;
    }

    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      const isAdm = this.email.includes('admin');
      this.auth.login(
        {
          name: isAdm ? 'Carlos Mendoza (Admin)' : 'Patricia Vargas (RRHH)',
          email: isAdm ? 'carlos.mendoza@minera-andina.com' : 'patricia.vargas@minera-andina.com',
          originalEmail: this.email,
          role: isAdm ? 'Administrador General' : 'Especialista de Planillas',
          avatarText: isAdm ? 'CM' : 'PV',
        },
        this.rememberMe
      );
    }, 400);
  }

  handleDemoFill(role: 'admin' | 'rrhh'): void {
    if (role === 'admin') {
      this.email = 'admin@empresa.com';
      this.password = 'admin123';
    } else {
      this.email = 'rrhh@empresa.com';
      this.password = 'rrhh123';
    }
    this.error.set('');
  }

  onForgot(): void {
    alert('Para restablecer tu contraseña, contacta al área de TI o Administrador.');
  }
}

