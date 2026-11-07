import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanillasStateService } from '../../services/planillas-state.service';
import { ToastService } from '../../services/toast.service';

const BREADCRUMB_MAP: Record<string, { section: string; page: string }> = {
  dashboard:  { section: 'Panel Principal', page: 'Dashboard Ejecutivo' },
  personal:   { section: 'Recursos Humanos', page: 'Directorio de Personal' },
  tareo:      { section: 'Control de Asistencia', page: 'Tareo Diario' },
  vacaciones: { section: 'Gestión de Talento', page: 'Control de Vacaciones y Récord' },
  planilla:   { section: 'Cálculo de Nómina', page: 'Pre-Planilla Mensual' },
  reportes:   { section: 'Declaraciones & Boletas', page: 'Reportes SUNAT y Boletas' },
  config:     { section: 'Administración', page: 'Configuración y Parámetros' },
  perfil:     { section: 'Mi Cuenta', page: 'Perfil de Usuario' },
};

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header
      [ngClass]="{
        'left-64': state.isSidebarOpen(),
        'left-16': !state.isSidebarOpen()
      }"
      class="fixed top-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 z-20 transition-all duration-300 shadow-2xs"
    >
      <!-- Breadcrumbs -->
      <div class="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        <nav class="flex items-center gap-2 text-xs min-w-0">
          <span class="font-semibold text-slate-400">Planillas</span>
          <span class="text-slate-300">›</span>
          <span class="font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 text-[11px]">
            {{ currentBreadcrumb().section }}
          </span>
          <span class="text-slate-300">›</span>
          <span class="font-bold text-slate-900 text-sm truncate">
            {{ currentBreadcrumb().page }}
          </span>
        </nav>
      </div>

      <!-- Herramientas superiores -->
      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <!-- Medidor de Escala / Zoom -->
        <div class="flex items-center bg-white border border-slate-200 rounded-xl shadow-2xs p-0.5 text-xs">
          <button
            type="button"
            (click)="state.setZoom(state.viewZoom() - 5)"
            [disabled]="state.viewZoom() <= 65"
            class="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-30 cursor-pointer font-bold"
            title="Reducir vista"
          >
            -
          </button>

          <span class="px-2 font-semibold text-blue-700 text-[11px]">
            {{ state.viewZoom() }}%
          </span>

          <button
            type="button"
            (click)="state.setZoom(state.viewZoom() + 5)"
            [disabled]="state.viewZoom() >= 135"
            class="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-30 cursor-pointer font-bold"
            title="Aumentar vista"
          >
            +
          </button>
        </div>

        <!-- Estado de Base de Datos -->
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 shadow-2xs">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>BD: SERVER04</span>
        </div>

        <!-- Periodo Activo con Icono SVG -->
        <div class="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
          <svg class="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>Periodo: {{ state.selectedPeriodo() }}</span>
        </div>

        <!-- Botón de Sincronización Manual con SVG -->
        <button
          (click)="handleRefresh()"
          [disabled]="refreshing()"
          class="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl px-3 py-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-60"
        >
          <svg [class.animate-spin]="refreshing()" class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
            <path d="M16 16h5v5"/>
          </svg>
          <span class="hidden md:inline">Sincronizar</span>
        </button>

        <!-- Reloj de Sincronización con SVG -->
        <div class="hidden xl:flex items-center gap-1.5 text-[11px] text-slate-500 pl-1">
          <svg class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>Sinc: {{ state.lastUpdate() }}</span>
        </div>
      </div>
    </header>
  `,
})
export class TopbarComponent {
  state = inject(PlanillasStateService);
  toast = inject(ToastService);
  refreshing = signal(false);

  currentBreadcrumb() {
    return BREADCRUMB_MAP[this.state.activeNav()] || { section: 'Módulo', page: 'Detalle' };
  }

  handleRefresh(): void {
    this.refreshing.set(true);
    this.state.syncWithDatabase();
    setTimeout(() => {
      this.refreshing.set(false);
      this.toast.show('Datos sincronizados correctamente con SQL Server.', 'success');
    }, 700);
  }
}
export { TopbarComponent as TopBarComponent };
