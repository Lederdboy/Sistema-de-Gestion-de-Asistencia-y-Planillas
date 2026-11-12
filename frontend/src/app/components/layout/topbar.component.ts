import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

interface BreadcrumbInfo {
  section: string;
  page: string;
}

const BREADCRUMB_MAP: Record<string, BreadcrumbInfo> = {
  dashboard: { section: 'Panel Principal', page: 'Dashboard Ejecutivo' },
  personal: { section: 'Recursos Humanos', page: 'Directorio de Personal' },
  tareo: { section: 'Control de Asistencia', page: 'Tareo Diario' },
  vacaciones: { section: 'Gestión de Talento', page: 'Control de Vacaciones y Récord' },
  planilla: { section: 'Cálculo de Nómina', page: 'Pre-Planilla Mensual' },
  reportes: { section: 'Declaraciones & Boletas', page: 'Reportes SUNAT y Boletas' },
  config: { section: 'Administración', page: 'Configuración y Parámetros' },
  perfil: { section: 'Mi Cuenta', page: 'Perfil de Usuario' },
};

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header
      class="fixed top-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 z-20 transition-all duration-300 shadow-xs"
      [ngClass]="{
        'left-0': isMobile,
        'left-64': !isMobile && isSidebarOpen,
        'left-16': !isMobile && !isSidebarOpen
      }"
    >
      <div class="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        @if (isMobile) {
          <div class="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              (click)="toggleSidebar.emit()"
              class="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 shadow-xs transition-colors hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              aria-label="Abrir menú"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <img src="/logo.png" alt="Logo" class="h-7 w-auto object-contain flex-shrink-0" />
          </div>
        }

        <!-- Mobile Breadcrumb -->
        <div class="flex flex-col min-w-0 sm:hidden">
          <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none">
            {{ currentBreadcrumb.section }}
          </span>
          <span class="font-bold text-slate-900 text-xs truncate leading-tight mt-0.5">
            {{ currentBreadcrumb.page }}
          </span>
        </div>

        <!-- Tablet / Desktop Breadcrumb -->
        <nav class="hidden sm:flex items-center gap-2 text-xs min-w-0">
          <span class="font-semibold text-slate-400 hover:text-slate-600 transition-colors">
            Planillas
          </span>
          <svg class="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          <span class="font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 text-[11px]">
            {{ currentBreadcrumb.section }}
          </span>
          <svg class="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          <span class="font-bold text-slate-900 text-sm truncate">
            {{ currentBreadcrumb.page }}
          </span>
        </nav>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Date indicator -->
        <div class="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
          <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="font-medium capitalize">{{ todayStr }}</span>
        </div>

        <!-- Sede badge -->
        <div class="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
          <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          <span>{{ apiService.activeSede().nombre }}</span>
        </div>

        <!-- Zoom selector -->
        <div class="relative">
          <button
            type="button"
            (click)="showZoomMenu.set(!showZoomMenu())"
            class="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
            title="Escala de vista"
          >
            <span>{{ currentZoom }}%</span>
            <svg class="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          @if (showZoomMenu()) {
            <div class="absolute right-0 mt-1 w-28 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-30">
              @for (z of zoomLevels; track z) {
                <button
                  type="button"
                  (click)="setZoom(z)"
                  class="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                  [ngClass]="{ 'font-bold text-blue-600 bg-blue-50/50': currentZoom === z }"
                >
                  <span>{{ z }}%</span>
                  @if (currentZoom === z) {
                    <svg class="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  }
                </button>
              }
            </div>
          }
        </div>

        <!-- Refresh button -->
        <button
          type="button"
          (click)="onRefresh()"
          [disabled]="isRefreshing() || apiService.loading()"
          class="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          title="Actualizar datos"
        >
          <svg
            class="w-4 h-4 text-slate-500 transition-colors"
            [ngClass]="{ 'animate-spin text-blue-600': isRefreshing() || apiService.loading() }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </header>
  `
})
export class TopBarComponent {
  authService = inject(AuthService);
  apiService = inject(ApiService);
  toastService = inject(ToastService);
  router = inject(Router);

  @Input() isSidebarOpen = true;
  @Input() isMobile = false;
  @Input() currentZoom = 100;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() zoomChange = new EventEmitter<number>();

  showZoomMenu = signal<boolean>(false);
  isRefreshing = signal<boolean>(false);
  zoomLevels = [80, 90, 100, 110, 125];

  currentBreadcrumb: BreadcrumbInfo = { section: 'Panel Principal', page: 'Dashboard Ejecutivo' };

  todayStr = new Date().toLocaleDateString('es-PE', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  constructor() {
    this.updateBreadcrumb(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateBreadcrumb(event.urlAfterRedirects || event.url);
    });
  }

  private updateBreadcrumb(url: string) {
    const cleanUrl = url.split('?')[0].replace('/', '');
    this.currentBreadcrumb = BREADCRUMB_MAP[cleanUrl] || { section: 'Módulo', page: 'Detalle' };
  }

  setZoom(level: number) {
    this.zoomChange.emit(level);
    this.showZoomMenu.set(false);
  }

  async onRefresh() {
    if (this.isRefreshing() || this.apiService.loading()) return;
    this.isRefreshing.set(true);
    this.apiService.loading.set(true);
    try {
      await Promise.all([
        this.apiService.getTrabajadores(),
        new Promise(resolve => setTimeout(resolve, 800))
      ]);
      this.apiService.lastUpdate.set(new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }));
      this.toastService.show('Datos sincronizados correctamente', 'info');
    } finally {
      this.isRefreshing.set(false);
      this.apiService.loading.set(false);
    }
  }
}

