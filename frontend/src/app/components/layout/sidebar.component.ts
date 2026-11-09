import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface NavItem {
  id: string;
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside
      class="fixed left-0 top-0 h-screen bg-white text-slate-800 border-r border-slate-200 flex flex-col z-50 select-none transition-all duration-300 ease-in-out"
      [ngClass]="{
        'w-72 max-w-[85vw] shadow-2xl': isMobile && isOpen,
        '-translate-x-full': isMobile && !isOpen,
        'w-64 translate-x-0 shadow-sm': !isMobile && isOpen,
        'w-16 translate-x-0 shadow-sm': !isMobile && !isOpen
      }"
    >
      <div class="flex flex-col h-full">
        <!-- Header -->
        @if (showFullContent) {
          <div class="flex items-center justify-between h-16 px-4 border-b border-slate-100 bg-white">
            <a routerLink="/dashboard" (click)="onNavClick()" class="flex items-center gap-3 cursor-pointer group min-w-0">
              <img src="/logo.png" alt="Logo" class="h-9 w-auto max-w-[40px] object-contain flex-shrink-0 transition-transform group-hover:scale-105" />
              <div class="flex flex-col min-w-0">
                <span class="font-bold text-sm text-slate-900 tracking-tight leading-tight truncate">
                  Planilla Enterprise
                </span>
                <span class="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
                  SaaS Laboral (Angular)
                </span>
              </div>
            </a>

            <button
              (click)="toggle.emit()"
              [title]="isMobile ? 'Cerrar menú' : 'Contraer menú lateral'"
              class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>
        } @else {
          <div class="flex flex-col items-center py-3 border-b border-slate-100 bg-white gap-2">
            <a routerLink="/dashboard" class="flex items-center justify-center p-1 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
              <img src="/logo.png" alt="Logo" class="h-8 w-auto object-contain" title="Planilla Enterprise" />
            </a>

            <button
              (click)="toggle.emit()"
              title="Expandir menú lateral"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        }

        <!-- Nav Items -->
        <div class="px-3 pt-4 pb-2 flex-1 overflow-y-auto">
          @if (showFullContent) {
            <div class="mb-2.5 px-2 flex items-center justify-between">
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Módulos</p>
              <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                {{ navItems.length }}
              </span>
            </div>
          }

          <nav class="space-y-1">
            @for (item of navItems; track item.id) {
              <a
                [routerLink]="item.path"
                routerLinkActive="bg-blue-50/90 text-blue-600 font-semibold border border-blue-100 shadow-xs"
                [routerLinkActiveOptions]="{ exact: false }"
                #rla="routerLinkActive"
                (click)="onNavClick()"
                [title]="!showFullContent ? item.label : ''"
                class="group relative w-full flex items-center rounded-xl transition-all duration-150 ease-out cursor-pointer text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                [ngClass]="showFullContent ? 'gap-3 px-3 py-2.5 text-xs font-semibold' : 'w-10 h-10 mx-auto justify-center'"
              >
                <div
                  class="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
                  [ngClass]="rla.isActive ? 'text-blue-600 bg-white shadow-xs' : 'text-slate-400 group-hover:text-slate-600'"
                >
                  <ng-container [ngSwitch]="item.icon">
                    <!-- Dashboard -->
                    <svg *ngSwitchCase="'chart'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <!-- Users -->
                    <svg *ngSwitchCase="'users'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <!-- Calendar -->
                    <svg *ngSwitchCase="'calendar'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <!-- Vacaciones / Palm -->
                    <svg *ngSwitchCase="'palm'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <!-- Planilla / FileSpreadsheet -->
                    <svg *ngSwitchCase="'sheet'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <!-- Reportes / Printer -->
                    <svg *ngSwitchCase="'printer'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </ng-container>
                </div>

                @if (showFullContent) {
                  <span class="flex-1 truncate tracking-tight text-left">{{ item.label }}</span>
                } @else {
                  <div class="absolute left-14 bg-slate-900 text-white text-[11px] font-medium py-1.5 px-2.5 rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-30 whitespace-nowrap">
                    {{ item.label }}
                  </div>
                }
              </a>
            }
          </nav>
        </div>

        <!-- Footer / User Profile -->
        <div class="p-3 border-t border-slate-100 bg-slate-50/50">
          <a
            routerLink="/config"
            routerLinkActive="bg-blue-50 text-blue-600 font-semibold border border-blue-100"
            (click)="onNavClick()"
            [title]="!showFullContent ? 'Configuración' : ''"
            class="group relative w-full flex items-center rounded-xl transition-all duration-150 ease-out cursor-pointer text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            [ngClass]="showFullContent ? 'gap-3 px-3 py-2 text-xs font-semibold' : 'w-10 h-10 mx-auto justify-center'"
          >
            <div class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 group-hover:text-slate-600">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            @if (showFullContent) {
              <span class="truncate">Configuración</span>
            }
          </a>

          <div class="h-px bg-slate-200/80 my-2 mx-1"></div>

          @if (showFullContent) {
            <div class="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-xs">
              <a routerLink="/perfil" (click)="onNavClick()" class="relative flex-shrink-0 cursor-pointer">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shadow-xs">
                  {{ authService.user()?.avatarText || 'AD' }}
                </div>
                <span class="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"></span>
              </a>

              <a routerLink="/perfil" (click)="onNavClick()" class="flex-1 min-w-0 cursor-pointer">
                <p class="text-xs font-semibold text-slate-900 truncate leading-tight">
                  {{ authService.user()?.name || 'Administrador' }}
                </p>
                <p class="text-[10px] text-slate-500 font-medium truncate leading-none mt-0.5">
                  {{ authService.user()?.role || 'RRHH' }}
                </p>
              </a>

              <button
                (click)="authService.logout()"
                title="Cerrar Sesión"
                class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          } @else {
            <div class="flex flex-col items-center gap-1.5 pt-1">
              <a
                routerLink="/perfil"
                class="relative w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shadow-xs"
                [title]="authService.user()?.name || 'Administrador'"
              >
                {{ authService.user()?.avatarText || 'AD' }}
                <span class="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"></span>
              </a>

              <button
                (click)="authService.logout()"
                title="Cerrar Sesión"
                class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          }
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  authService = inject(AuthService);

  @Input() isOpen = true;
  @Input() isMobile = false;
  @Output() toggle = new EventEmitter<void>();

  get showFullContent(): boolean {
    return this.isMobile || this.isOpen;
  }

  navItems: NavItem[] = [
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: 'chart' },
    { id: 'personal', path: '/personal', label: 'Personal', icon: 'users' },
    { id: 'tareo', path: '/tareo', label: 'Tareo Diario', icon: 'calendar' },
    { id: 'vacaciones', path: '/vacaciones', label: 'Vacaciones', icon: 'palm' },
    { id: 'planilla', path: '/planilla', label: 'Planilla', icon: 'sheet' },
    { id: 'reportes', path: '/reportes', label: 'Reportes', icon: 'printer' },
  ];

  onNavClick() {
    if (this.isMobile) {
      this.toggle.emit();
    }
  }
}

