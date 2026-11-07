import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanillasStateService } from '../../services/planillas-state.service';
import { AuthService } from '../../services/auth.service';

interface NavItem {
  id: string;
  label: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside
      [ngClass]="{
        'w-64': state.isSidebarOpen(),
        'w-16': !state.isSidebarOpen()
      }"
      class="fixed left-0 top-0 h-screen bg-white text-slate-800 border-r border-slate-200 flex flex-col z-50 select-none transition-all duration-300 ease-in-out shadow-[1px_0_15px_rgba(15,23,42,0.03)]"
    >
      <div class="flex flex-col h-full">
        <!-- Logo Corporativo de Nómina y botón de colapso -->
        @if (state.isSidebarOpen()) {
          <div class="flex items-center justify-between h-16 px-4 border-b border-slate-100 bg-white">
            <div
              (click)="state.setNav('dashboard')"
              class="flex items-center gap-3 cursor-pointer group min-w-0"
            >
              <img
                src="logo.png"
                alt="Logo"
                class="h-9 w-auto max-w-[38px] object-contain shrink-0 transition-transform group-hover:scale-105 drop-shadow-2xs"
              />
              <div class="flex flex-col min-w-0">
                <span class="font-bold text-sm text-slate-900 tracking-tight leading-tight truncate">
                  Nómina Enterprise
                </span>
                <span class="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
                  Gestión Laboral
                </span>
              </div>
            </div>

            <button
              (click)="state.toggleSidebar()"
              title="Contraer menú lateral"
              class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          </div>
        } @else {
          <div class="flex flex-col items-center py-3 border-b border-slate-100 bg-white gap-2">
            <div
              (click)="state.setNav('dashboard')"
              class="flex items-center justify-center p-1 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
              title="Nómina Enterprise"
            >
              <img
                src="logo.png"
                alt="Logo"
                class="h-8 w-auto object-contain drop-shadow-2xs"
              />
            </div>
            <button
              (click)="state.toggleSidebar()"
              title="Expandir menú lateral"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        }

        <!-- Navegación de módulos con Iconos Vectoriales -->
        <div class="px-3 pt-4 pb-2 flex-1 overflow-y-auto">
          @if (state.isSidebarOpen()) {
            <div class="mb-2.5 px-2 flex items-center justify-between">
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Módulos
              </p>
              <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                {{ navItems.length }}
              </span>
            </div>
          }

          <nav class="space-y-1">
            @for (item of navItems; track item.id) {
              <button
                (click)="state.setNav(item.id)"
                [title]="!state.isSidebarOpen() ? item.label : ''"
                [ngClass]="{
                  'gap-3 px-3 py-2.5 text-xs font-semibold': state.isSidebarOpen(),
                  'w-10 h-10 mx-auto justify-center': !state.isSidebarOpen(),
                  'bg-blue-50/90 text-blue-600 font-semibold border border-blue-100 shadow-2xs': state.activeNav() === item.id,
                  'text-slate-600 hover:bg-slate-50 hover:text-slate-900': state.activeNav() !== item.id
                }"
                class="group relative w-full flex items-center rounded-xl transition-all duration-150 ease-out cursor-pointer"
              >
                <div
                  [ngClass]="{
                    'text-blue-600 bg-white shadow-2xs': state.activeNav() === item.id,
                    'text-slate-400 group-hover:text-slate-600': state.activeNav() !== item.id
                  }"
                  class="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
                >
                  <!-- Dashboard -->
                  @if (item.id === 'dashboard') {
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
                    </svg>
                  }
                  <!-- Personal -->
                  @else if (item.id === 'personal') {
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  }
                  <!-- Tareo Diario -->
                  @else if (item.id === 'tareo') {
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  }
                  <!-- Vacaciones -->
                  @else if (item.id === 'vacaciones') {
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2"/><path d="M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-2"/><path d="M5.89 9.71c-2.15 1.45-3 4.17-1.89 6.29"/><path d="M17.5 15c.96-1.83.6-4.04-1-5.34"/><path d="M12 12v9"/><path d="M8 21h8"/>
                    </svg>
                  }
                  <!-- Planilla -->
                  @else if (item.id === 'planilla') {
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  }
                  <!-- Reportes -->
                  @else if (item.id === 'reportes') {
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>
                    </svg>
                  }
                </div>

                @if (state.isSidebarOpen()) {
                  <span class="flex-1 truncate tracking-tight text-left">{{ item.label }}</span>
                } @else {
                  <div class="absolute left-14 bg-slate-900 text-white text-[11px] font-medium py-1.5 px-2.5 rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-30 whitespace-nowrap">
                    {{ item.label }}
                  </div>
                }
              </button>
            }
          </nav>
        </div>

        <!-- Footer / Usuario y Configuración -->
        <div class="p-3 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            (click)="state.setNav('config')"
            [ngClass]="{
              'gap-3 px-3 py-2 text-xs font-semibold': state.isSidebarOpen(),
              'w-10 h-10 mx-auto justify-center': !state.isSidebarOpen(),
              'bg-blue-50 text-blue-600 font-semibold border border-blue-100': state.activeNav() === 'config',
              'text-slate-600 hover:bg-slate-100 hover:text-slate-900': state.activeNav() !== 'config'
            }"
            class="group relative w-full flex items-center rounded-xl transition-all duration-150 ease-out cursor-pointer"
          >
            <div
              [ngClass]="{
                'text-blue-600 bg-white shadow-2xs': state.activeNav() === 'config',
                'text-slate-400 group-hover:text-slate-600': state.activeNav() !== 'config'
              }"
              class="flex h-7 w-7 items-center justify-center rounded-lg"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            @if (state.isSidebarOpen()) {
              <span class="truncate">Configuración</span>
            }
          </button>

          <div class="h-px bg-slate-200/80 my-2 mx-1"></div>

          @if (state.isSidebarOpen()) {
            <div class="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-200 transition-colors">
              <div
                (click)="state.setNav('perfil')"
                class="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                title="Ver perfil de usuario"
              >
                <div class="relative shrink-0">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shadow-xs">
                    {{ auth.currentUser()?.avatarText || 'AD' }}
                  </div>
                  <span class="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"></span>
                </div>

                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-slate-900 truncate leading-tight hover:text-blue-600 transition-colors">
                    {{ auth.currentUser()?.name || 'Administrador' }}
                  </p>
                  <p class="text-[10px] text-slate-500 font-medium truncate leading-none mt-0.5">
                    {{ auth.currentUser()?.role || 'RRHH' }}
                  </p>
                </div>
              </div>

              <button
                (click)="auth.logout()"
                title="Cerrar Sesión"
                class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          } @else {
            <div class="flex flex-col items-center gap-1.5 pt-1">
              <div
                class="relative w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shadow-xs"
                [title]="auth.currentUser()?.name || 'Administrador'"
              >
                {{ auth.currentUser()?.avatarText || 'AD' }}
                <span class="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"></span>
              </div>
              <button
                (click)="auth.logout()"
                title="Cerrar Sesión"
                class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          }
        </div>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  state = inject(PlanillasStateService);
  auth = inject(AuthService);

  readonly navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'personal', label: 'Personal' },
    { id: 'tareo', label: 'Tareo Diario' },
    { id: 'vacaciones', label: 'Vacaciones' },
    { id: 'planilla', label: 'Planilla' },
    { id: 'reportes', label: 'Reportes' },
  ];
}
