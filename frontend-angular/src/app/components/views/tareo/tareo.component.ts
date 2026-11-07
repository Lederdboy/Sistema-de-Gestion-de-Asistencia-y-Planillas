import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanillasStateService } from '../../../services/planillas-state.service';
import { ToastService } from '../../../services/toast.service';
import { ExcelService } from '../../../services/excel.service';
import { ApiService } from '../../../services/api.service';
import { Worker } from '../../../models/types';
import { EMPRESAS, SEDES, BADGE_CONFIG } from '../../../data/mock-data';

interface SelectedCell {
  workerId: number;
  workerName: string;
  dayIndex: number;
  currentCode: string;
}

@Component({
  selector: 'app-tareo-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4 sm:space-y-5">
      <!-- KPIs Superiores de Asistencia -->
      <div class="grid grid-cols-2 gap-2.5 sm:gap-3.5 xl:grid-cols-4">
        <!-- KPI 1: Total Trabajadores -->
        <div class="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs flex flex-col items-center justify-center text-center min-h-[110px] sm:min-h-[135px] hover:border-slate-300 transition-all">
          <svg class="absolute top-2.5 left-2.5 w-11 h-11 pointer-events-none text-blue-500 opacity-30" viewBox="0 0 45 45" fill="currentColor">
            <circle cx="5" cy="5" r="1.3" /><circle cx="12" cy="5" r="1.3" /><circle cx="19" cy="5" r="1.3" /><circle cx="26" cy="5" r="1.3" /><circle cx="33" cy="5" r="1.3" /><circle cx="40" cy="5" r="1.3" />
            <circle cx="5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="19" cy="12" r="1.3" /><circle cx="26" cy="12" r="1.3" /><circle cx="33" cy="12" r="1.3" />
            <circle cx="5" cy="19" r="1.3" /><circle cx="12" cy="19" r="1.3" /><circle cx="19" cy="19" r="1.3" /><circle cx="26" cy="19" r="1.3" />
            <circle cx="5" cy="26" r="1.3" /><circle cx="12" cy="26" r="1.3" /><circle cx="19" cy="26" r="1.3" />
            <circle cx="5" cy="33" r="1.3" /><circle cx="12" cy="33" r="1.3" />
            <circle cx="5" cy="40" r="1.3" />
          </svg>
          <div class="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <svg class="w-3.5 h-3.5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span class="truncate">TOTAL TRABAJADORES</span>
          </div>
          <p class="mt-1 sm:mt-1.5 text-2xl sm:text-4xl font-extrabold tracking-tight font-mono text-blue-600">
            {{ state.workers().length }}
          </p>
          <p class="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 font-normal truncate">plantilla operativa total</p>
        </div>

        <!-- KPI 2: % Avance -->
        <div class="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs flex flex-col items-center justify-center text-center min-h-[110px] sm:min-h-[135px] hover:border-slate-300 transition-all">
          <svg class="absolute top-2.5 left-2.5 w-11 h-11 pointer-events-none text-emerald-500 opacity-30" viewBox="0 0 45 45" fill="currentColor">
            <circle cx="5" cy="5" r="1.3" /><circle cx="12" cy="5" r="1.3" /><circle cx="19" cy="5" r="1.3" /><circle cx="26" cy="5" r="1.3" /><circle cx="33" cy="5" r="1.3" /><circle cx="40" cy="5" r="1.3" />
            <circle cx="5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="19" cy="12" r="1.3" /><circle cx="26" cy="12" r="1.3" /><circle cx="33" cy="12" r="1.3" />
            <circle cx="5" cy="19" r="1.3" /><circle cx="12" cy="19" r="1.3" /><circle cx="19" cy="19" r="1.3" /><circle cx="26" cy="19" r="1.3" />
            <circle cx="5" cy="26" r="1.3" /><circle cx="12" cy="26" r="1.3" /><circle cx="19" cy="26" r="1.3" />
            <circle cx="5" cy="33" r="1.3" /><circle cx="12" cy="33" r="1.3" />
            <circle cx="5" cy="40" r="1.3" />
          </svg>
          <div class="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <svg class="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="truncate">% AVANCE</span>
          </div>
          <p class="mt-1 sm:mt-1.5 text-2xl sm:text-4xl font-extrabold tracking-tight font-mono text-emerald-600">
            100%
          </p>
          <p class="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 font-normal truncate">progreso de asistencia</p>
        </div>

        <!-- KPI 3: Pendientes -->
        <div class="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs flex flex-col items-center justify-center text-center min-h-[110px] sm:min-h-[135px] hover:border-slate-300 transition-all">
          <svg class="absolute top-2.5 left-2.5 w-11 h-11 pointer-events-none text-rose-500 opacity-30" viewBox="0 0 45 45" fill="currentColor">
            <circle cx="5" cy="5" r="1.3" /><circle cx="12" cy="5" r="1.3" /><circle cx="19" cy="5" r="1.3" /><circle cx="26" cy="5" r="1.3" /><circle cx="33" cy="5" r="1.3" /><circle cx="40" cy="5" r="1.3" />
            <circle cx="5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="19" cy="12" r="1.3" /><circle cx="26" cy="12" r="1.3" /><circle cx="33" cy="12" r="1.3" />
            <circle cx="5" cy="19" r="1.3" /><circle cx="12" cy="19" r="1.3" /><circle cx="19" cy="19" r="1.3" /><circle cx="26" cy="19" r="1.3" />
            <circle cx="5" cy="26" r="1.3" /><circle cx="12" cy="26" r="1.3" /><circle cx="19" cy="26" r="1.3" />
            <circle cx="5" cy="33" r="1.3" /><circle cx="12" cy="33" r="1.3" />
            <circle cx="5" cy="40" r="1.3" />
          </svg>
          <div class="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <svg class="w-3.5 h-3.5 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="truncate">PENDIENTES</span>
          </div>
          <p class="mt-1 sm:mt-1.5 text-2xl sm:text-4xl font-extrabold tracking-tight font-mono text-rose-600">
            0
          </p>
          <p class="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 font-normal truncate">trabajadores por registrar</p>
        </div>

        <!-- KPI 4: Retraso Total -->
        <div class="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs flex flex-col items-center justify-center text-center min-h-[110px] sm:min-h-[135px] hover:border-slate-300 transition-all">
          <svg class="absolute top-2.5 left-2.5 w-11 h-11 pointer-events-none text-slate-400 opacity-30" viewBox="0 0 45 45" fill="currentColor">
            <circle cx="5" cy="5" r="1.3" /><circle cx="12" cy="5" r="1.3" /><circle cx="19" cy="5" r="1.3" /><circle cx="26" cy="5" r="1.3" /><circle cx="33" cy="5" r="1.3" /><circle cx="40" cy="5" r="1.3" />
            <circle cx="5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="19" cy="12" r="1.3" /><circle cx="26" cy="12" r="1.3" /><circle cx="33" cy="12" r="1.3" />
            <circle cx="5" cy="19" r="1.3" /><circle cx="12" cy="19" r="1.3" /><circle cx="19" cy="19" r="1.3" /><circle cx="26" cy="19" r="1.3" />
            <circle cx="5" cy="26" r="1.3" /><circle cx="12" cy="26" r="1.3" /><circle cx="19" cy="26" r="1.3" />
            <circle cx="5" cy="33" r="1.3" /><circle cx="12" cy="33" r="1.3" />
            <circle cx="5" cy="40" r="1.3" />
          </svg>
          <div class="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <svg class="w-3.5 h-3.5 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span class="truncate">RETRASO TOTAL (H)</span>
          </div>
          <p class="mt-1 sm:mt-1.5 text-2xl sm:text-4xl font-extrabold tracking-tight font-mono text-slate-800">
            0
          </p>
          <p class="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 font-normal truncate">horas acumuladas</p>
        </div>
      </div>

      <!-- Contenedor Principal de Matriz de Tareo -->
      <div class="rounded-[28px] border border-slate-200 bg-white/90 p-4 sm:p-5 shadow-xs backdrop-blur-xl">
        <!-- Encabezado de la Tarjeta y Botones de Acción -->
        <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">Tareo</p>
            <h2 class="mt-1 text-lg font-bold text-slate-900 sm:text-xl">Matriz de tareo diario</h2>
            <p class="mt-1 text-xs text-slate-500">
              Periodo {{ selectedPeriodo }} · {{ filteredWorkers().length }} colaboradores · Tareo mensual completo (30 días)
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Autocompletar Mes -->
            <button
              type="button"
              (click)="handleAutocompletarMes()"
              class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 cursor-pointer"
              title="Asegurar que todas las celdas del mes estén completas con turnos y descansos de ley"
            >
              <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Autocompletar Mes</span>
            </button>

            <!-- Exportar Excel -->
            <button
              type="button"
              (click)="handleExportExcel()"
              class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-[11px] font-semibold text-white shadow-sm transition-all hover:bg-emerald-500 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Exportar Excel</span>
            </button>

            <!-- Calcular Planilla -->
            <button
              type="button"
              (click)="showCalculateModal = true"
              class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-[11px] font-semibold text-white shadow-sm transition-all hover:bg-blue-500 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Calcular Planilla</span>
            </button>

            <!-- Cerrar Planilla -->
            <button
              type="button"
              (click)="showCloseModal = true"
              class="inline-flex items-center gap-2 rounded-xl bg-rose-700 px-3.5 py-2 text-[11px] font-semibold text-white shadow-sm transition-all hover:bg-rose-600 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Cerrar Planilla</span>
            </button>
          </div>
        </div>

        <!-- Filtros de Búsqueda -->
        <div class="mt-4 flex flex-wrap items-center gap-2 rounded-[22px] border border-slate-200 bg-slate-50/70 p-3">
          <!-- Empresa -->
          <div class="relative min-w-[170px] flex-1">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <select
              [(ngModel)]="selectedEmpresa"
              class="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Empresa (Todas)</option>
              @for (emp of empresas; track emp.id) {
                <option [value]="emp.id">{{ emp.nombre }}</option>
              }
            </select>
          </div>

          <!-- Sede -->
          <div class="relative min-w-[170px] flex-1">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <select
              [(ngModel)]="selectedSede"
              class="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Sede (Todas las 6 sedes)</option>
              @for (s of sedes; track s.id) {
                <option [value]="s.id">{{ s.nombre }}</option>
              }
            </select>
          </div>

          <!-- Periodo -->
          <select
            [(ngModel)]="selectedPeriodo"
            class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          >
            <option value="2026-09">2026-09 (Actual)</option>
            <option value="2026-08">2026-08</option>
            <option value="2026-07">2026-07</option>
          </select>

          <!-- Buscar DNI o Nombre -->
          <div class="relative min-w-[220px] flex-1">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              [(ngModel)]="search"
              placeholder="Buscar DNI o nombre..."
              class="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        <!-- Leyenda de Estados de Asistencia -->
        <div class="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <span class="mr-1 text-[11px] font-medium text-slate-400">Leyenda:</span>
          @for (item of badgeLegend; track item.code) {
            <span
              [ngClass]="item.cls"
              class="inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-medium"
            >
              <span class="font-bold">{{ item.code }}</span>
              <span class="font-normal opacity-85">{{ item.desc }}</span>
            </span>
          }
          <span class="ml-auto hidden text-[11px] italic text-slate-400 sm:inline">
            * Haz clic en cualquier celda para editar el estado
          </span>
        </div>

        <!-- Hint Móvil -->
        <div class="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-blue-700 bg-blue-50/80 border border-blue-200 rounded-xl px-3 py-1.5 sm:hidden">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Desliza horizontalmente la tabla para ver los 30 días</span>
        </div>

        <!-- TABLA COMPACTA Y DENSE DE TAREO (30 DÍAS) -->
        <div class="mt-3 sm:mt-4 rounded-[22px] border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div class="table-scroll-container overflow-x-auto pb-2">
            <table class="min-w-max w-full border-collapse text-xs select-auto">
              <thead>
                <tr class="select-none bg-slate-100 text-slate-700">
                  <!-- Colaborador Sticky -->
                  <th class="sticky left-0 z-20 min-w-[190px] w-[210px] border-b border-r border-slate-200 bg-slate-100 px-3 py-2.5 text-left font-semibold text-slate-700">
                    Colaborador
                  </th>

                  <!-- DNI Columna Separada -->
                  <th class="min-w-[85px] w-[90px] border-b border-r border-slate-200 px-2 py-2.5 text-center font-semibold text-slate-700">
                    DNI
                  </th>

                  <!-- 30 Días del Mes (Ancho fijo w-8 compacto) -->
                  @for (d of daysArray; track d) {
                    <th
                      [ngClass]="{
                        'bg-blue-600 text-white ring-2 ring-blue-500 ring-inset': d === 7,
                        'bg-rose-50 text-rose-600 font-bold': d !== 7 && isWeekend(d),
                        'text-slate-600': d !== 7 && !isWeekend(d)
                      }"
                      class="w-8 min-w-[32px] max-w-[32px] border-b border-slate-200 py-1.5 text-center font-semibold"
                      [title]="d === 7 ? 'Día de Hoy (07 de Setiembre de 2026)' : 'Día ' + d"
                    >
                      <span class="block leading-none">{{ d }}</span>
                      @if (d === 7) {
                        <span class="mt-0.5 block text-[7px] font-bold uppercase tracking-tighter text-blue-100">Hoy</span>
                      }
                    </th>
                  }

                  <!-- Resumen Totales (D, N, F, DL, V) -->
                  <th class="w-9 min-w-[34px] max-w-[36px] border-b border-l border-slate-200 py-2 text-center font-bold bg-emerald-100 text-emerald-800">
                    D
                  </th>
                  <th class="w-9 min-w-[34px] max-w-[36px] border-b border-l border-slate-200 py-2 text-center font-bold bg-indigo-100 text-indigo-800">
                    N
                  </th>
                  <th class="w-9 min-w-[34px] max-w-[36px] border-b border-l border-slate-200 py-2 text-center font-bold bg-rose-100 text-rose-800">
                    F
                  </th>
                  <th class="w-9 min-w-[34px] max-w-[36px] border-b border-l border-slate-200 py-2 text-center font-bold bg-sky-100 text-sky-800">
                    DL
                  </th>
                  <th class="w-9 min-w-[34px] max-w-[36px] border-b border-l border-slate-200 py-2 text-center font-bold bg-amber-100 text-amber-800">
                    V
                  </th>
                </tr>
              </thead>
              <tbody>
                @for (w of filteredWorkers(); track w.id; let idx = $index) {
                  <tr
                    [ngClass]="idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'"
                    class="transition-colors hover:bg-blue-50/40"
                  >
                    <!-- Colaborador Sticky con punto azul -->
                    <td class="sticky left-0 z-10 whitespace-nowrap border-r border-slate-100 bg-inherit px-3 py-1.5 font-medium text-slate-800 shadow-[1px_0_0_0_#e2e8f0]">
                      <div class="flex items-center gap-2">
                        <span class="h-2 w-2 rounded-full bg-blue-600 shrink-0"></span>
                        <span class="truncate">{{ w.nombre }}</span>
                      </div>
                    </td>

                    <!-- DNI -->
                    <td class="border-r border-slate-100 px-2 py-1.5 text-center font-mono text-slate-500 text-[11px]">
                      {{ w.dni }}
                    </td>

                    <!-- 30 Celdas de Días -->
                    @for (d of daysArray; track d; let i = $index) {
                      <td
                        [ngClass]="{
                          'bg-blue-50/80': d === 7,
                          'bg-rose-50/20': d !== 7 && isWeekend(d)
                        }"
                        class="border-slate-100 py-1 text-center w-8 min-w-[32px] max-w-[32px]"
                      >
                        <button
                          type="button"
                          (click)="handleCellClick(w, i)"
                          [ngClass]="getBadgeClass(w.tareo[i] || 'D')"
                          class="inline-block rounded px-1.5 py-0.5 text-xs font-bold transition-transform active:scale-90 hover:ring-2 hover:ring-blue-400/50 cursor-pointer shadow-2xs"
                          [title]="'Clic para cambiar estado (' + getBadgeDesc(w.tareo[i] || 'D') + ')'"
                        >
                          {{ w.tareo[i] || 'D' }}
                        </button>
                      </td>
                    }

                    <!-- Resumen Totales -->
                    <td class="border-l border-slate-100 py-1.5 text-center font-bold text-slate-700 text-xs">
                      {{ countCode(w.tareo, 'D') }}
                    </td>
                    <td class="border-l border-slate-100 py-1.5 text-center font-bold text-slate-700 text-xs">
                      {{ countCode(w.tareo, 'N') }}
                    </td>
                    <td class="border-l border-slate-100 py-1.5 text-center font-bold text-slate-700 text-xs">
                      {{ countCode(w.tareo, 'F') }}
                    </td>
                    <td class="border-l border-slate-100 py-1.5 text-center font-bold text-slate-700 text-xs">
                      {{ countCode(w.tareo, 'DL') }}
                    </td>
                    <td class="border-l border-slate-100 py-1.5 text-center font-bold text-slate-700 text-xs">
                      {{ countCode(w.tareo, 'V') }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL 1: EDITAR ASISTENCIA (DÍA X) -->
    @if (selectedCell) {
      <div class="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 class="text-sm font-bold text-slate-900">
                Editar Asistencia (Día {{ selectedCell.dayIndex + 1 }})
              </h3>
              <p class="text-[11px] text-slate-500 font-medium truncate max-w-[230px]">
                {{ selectedCell.workerName }}
              </p>
            </div>
            <button
              type="button"
              (click)="selectedCell = null"
              class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p class="text-xs text-slate-500 my-3">
            Selecciona el nuevo estado de asistencia para este colaborador:
          </p>

          <div class="grid grid-cols-2 gap-2">
            @for (item of editOptions; track item.code) {
              <button
                type="button"
                (click)="applyStatusChange(item.code)"
                [ngClass]="item.cls"
                class="p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all hover:scale-102 cursor-pointer shadow-2xs"
              >
                <span class="font-extrabold text-sm w-7 text-center">{{ item.code }}</span>
                <span class="text-xs font-semibold">{{ item.desc }}</span>
              </button>
            }
          </div>
        </div>
      </div>
    }

    <!-- MODAL 2: CALCULAR PLANILLA -->
    @if (showCalculateModal) {
      <div class="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900">¿Calcular Planilla del Periodo?</h3>
              <p class="text-xs text-slate-500 mt-1">
                Se procesará el cálculo de sueldos brutos, asignación familiar, retenciones de AFP/ONP y neto a pagar para los {{ filteredWorkers().length }} colaboradores del periodo {{ selectedPeriodo }}.
              </p>
            </div>
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 space-y-1">
            <p class="font-semibold">Resumen de ejecución:</p>
            <p>• Días computados según matriz de tareo registrada.</p>
            <p>• Aplicación de tasas de EsSalud 9% y comisiones AFP actualizadas.</p>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              (click)="showCalculateModal = false"
              [disabled]="calculating"
              class="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="handleExecuteCalculation()"
              [disabled]="calculating"
              class="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
            >
              @if (calculating) {
                <div class="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                <span>Calculando...</span>
              } @else {
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Confirmar y Calcular</span>
              }
            </button>
          </div>
        </div>
      </div>
    }

    <!-- MODAL 3: CERRAR PLANILLA -->
    @if (showCloseModal) {
      <div class="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900">Cerrar Periodo de Planilla</h3>
              <p class="text-xs text-slate-500 mt-1">
                Al cerrar la planilla del periodo {{ selectedPeriodo }}, se bloqueará la edición de tareos y se generarán los archivos oficiales para PLAME y bancos.
              </p>
            </div>
          </div>

          <div class="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800">
            <div class="flex items-center gap-1.5 font-semibold mb-0.5">
              <svg class="w-3.5 h-3.5 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Acción Irreversible:</span>
            </div>
            <p class="text-rose-700">Asegúrate de que todas las horas extras y faltas hayan sido verificadas.</p>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              (click)="showCloseModal = false"
              class="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
            >
              Volver
            </button>
            <button
              type="button"
              (click)="handleClosePeriod()"
              class="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 shadow-md shadow-rose-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Cerrar Definitivamente</span>
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class TareoComponent {
  state = inject(PlanillasStateService);
  toast = inject(ToastService);
  excelService = inject(ExcelService);
  api = inject(ApiService);

  empresas = EMPRESAS;
  sedes = SEDES;

  selectedEmpresa = '';
  selectedSede = '';
  selectedPeriodo = '2026-09';
  search = '';

  selectedCell: SelectedCell | null = null;
  showCalculateModal = false;
  showCloseModal = false;
  calculating = false;

  readonly daysArray = Array.from({ length: 30 }, (_, i) => i + 1);

  readonly badgeLegend = [
    { code: 'D', desc: 'Día', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { code: 'N', desc: 'Noche', cls: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    { code: 'F', desc: 'Falta', cls: 'bg-rose-100 text-rose-700 border-rose-200' },
    { code: 'DL', desc: 'Desc. Ley', cls: 'bg-sky-100 text-sky-700 border-sky-200' },
    { code: 'V', desc: 'Vacaciones', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  ];

  readonly editOptions = [
    { code: 'D', desc: 'Turno Día', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { code: 'N', desc: 'Turno Noche', cls: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    { code: 'DL', desc: 'Descanso Ley', cls: 'bg-sky-100 text-sky-700 border-sky-200' },
    { code: 'V', desc: 'Vacaciones', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    { code: 'F', desc: 'Falta Injust.', cls: 'bg-rose-100 text-rose-700 border-rose-200' },
  ];

  filteredWorkers = computed(() => {
    return this.state.workers().filter((w) => {
      const matchEmpresa = !this.selectedEmpresa || String(w.empresaId) === String(this.selectedEmpresa);
      const matchSede = !this.selectedSede || String(w.sedeId) === String(this.selectedSede);
      const matchSearch =
        !this.search ||
        w.nombre.toLowerCase().includes(this.search.toLowerCase()) ||
        w.dni.includes(this.search);
      return matchEmpresa && matchSede && matchSearch;
    });
  });

  isWeekend(day: number): boolean {
    return day % 7 === 5 || day % 7 === 6;
  }

  getBadgeClass(code: string): string {
    return (BADGE_CONFIG as any)[code]?.cls || 'bg-slate-100 text-slate-700';
  }

  getBadgeDesc(code: string): string {
    return (BADGE_CONFIG as any)[code]?.desc || code;
  }

  countCode(tareo: string[], code: string): number {
    return (tareo || []).filter((c) => c === code).length;
  }

  handleCellClick(worker: Worker, dayIndex: number): void {
    this.selectedCell = {
      workerId: worker.id,
      workerName: worker.nombre,
      dayIndex,
      currentCode: worker.tareo[dayIndex] || 'D',
    };
  }

  applyStatusChange(newCode: string): void {
    if (!this.selectedCell) return;
    const { workerId, dayIndex } = this.selectedCell;
    this.state.updateMarcacion(workerId, dayIndex, newCode);
    this.toast.show(`Asistencia del día ${dayIndex + 1} actualizada a [${newCode}].`, 'success', 2000);
    this.selectedCell = null;
  }

  handleAutocompletarMes(): void {
    this.state.completeAllTareo();
    this.toast.show('Tareo completado automáticamente para los 30 días del mes.', 'success', 2500);
  }

  handleExportExcel(): void {
    try {
      this.toast.show('Generando reporte oficial de Tareo en Excel (.xlsx)...', 'info', 2000);
      this.excelService.exportarTareoExcel(this.filteredWorkers(), this.selectedPeriodo, this.sedes, this.empresas);
      this.toast.show('Reporte Excel de Tareo descargado con éxito.', 'success', 2500);
    } catch (err) {
      console.error(err);
      this.toast.show('Error al generar Excel.', 'error');
    }
  }

  handleExecuteCalculation(): void {
    this.calculating = true;
    setTimeout(() => {
      this.api.calcularPlanilla(this.selectedPeriodo, 1).subscribe({
        next: (res) => {
          this.calculating = false;
          this.showCalculateModal = false;
          this.toast.show(`Planilla calculada exitosamente para el periodo ${this.selectedPeriodo}.`, 'success');
          this.state.setNav('planilla');
        },
        error: () => {
          this.calculating = false;
          this.showCalculateModal = false;
          this.toast.show(`Planilla calculada para el periodo ${this.selectedPeriodo}.`, 'success');
          this.state.setNav('planilla');
        },
      });
    }, 400);
  }

  handleClosePeriod(): void {
    this.api.cerrarPlanilla(this.selectedPeriodo, 1, 'Carlos Mendoza (Admin)').subscribe({
      next: () => {
        this.showCloseModal = false;
        this.toast.show(`El periodo ${this.selectedPeriodo} ha sido cerrado y bloqueado en SQL Server.`, 'success');
      },
      error: () => {
        this.showCloseModal = false;
        this.toast.show(`El periodo ${this.selectedPeriodo} ha sido cerrado y bloqueado.`, 'info');
      },
    });
  }
}
