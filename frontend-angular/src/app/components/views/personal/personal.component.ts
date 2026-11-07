import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanillasStateService } from '../../../services/planillas-state.service';
import { ToastService } from '../../../services/toast.service';
import { Worker } from '../../../models/types';
import { EMPRESAS, SEDES, AFPS, BADGE_CONFIG, PARAMETROS_LABORALES } from '../../../data/mock-data';

@Component({
  selector: 'app-personal-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <!-- Barra Superior de Filtros y Acciones -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-xl font-bold tracking-tight text-slate-900">
            Directorio de Personal y Legajo Laboral
          </h2>
          <p class="text-xs text-slate-500 font-medium">
            Gestión centralizada de colaboradores, contratos y expedientes digitales
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            (click)="showNewModal.set(true)"
            class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>+</span>
            <span>Nuevo Colaborador</span>
          </button>
        </div>
      </div>

      <!-- Filtros Rápidos -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center gap-3">
        <!-- Búsqueda -->
        <div class="flex-1 min-w-[200px]">
          <input
            type="text"
            [(ngModel)]="search"
            placeholder="Buscar por DNI, nombres o cargo..."
            class="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <!-- Filtro Sede -->
        <select
          [(ngModel)]="selectedSede"
          class="h-9 px-3 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="">Todas las Sedes</option>
          @for (s of sedes; track s.id) {
            <option [value]="s.id">{{ s.nombre }}</option>
          }
        </select>

        <!-- Filtro Estado -->
        <select
          [(ngModel)]="selectedEstado"
          class="h-9 px-3 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="">Todos los Estados</option>
          <option value="Activo">Activos</option>
          <option value="Vacaciones">En Vacaciones</option>
        </select>
      </div>

      <!-- Tabla de Colaboradores -->
      <div class="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div class="table-scroll-container">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th class="px-4 py-3">Colaborador</th>
                <th class="px-4 py-3">DNI</th>
                <th class="px-4 py-3">Cargo</th>
                <th class="px-4 py-3">Sede</th>
                <th class="px-4 py-3 text-right">Sueldo Básico</th>
                <th class="px-4 py-3 text-center">Pensión</th>
                <th class="px-4 py-3 text-center">Estado</th>
                <th class="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (w of filteredWorkers(); track w.id) {
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <td class="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2.5">
                    <div class="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                      {{ w.nombre.slice(0, 2).toUpperCase() }}
                    </div>
                    <span>{{ w.nombre }}</span>
                  </td>
                  <td class="px-4 py-3 font-mono text-slate-600">{{ w.dni }}</td>
                  <td class="px-4 py-3 text-slate-700">{{ w.cargo }}</td>
                  <td class="px-4 py-3 text-slate-600">{{ getSedeNombre(w.sedeId) }}</td>
                  <td class="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    S/ {{ w.sueldoBase.toFixed(2) }}
                  </td>
                  <td class="px-4 py-3 text-center font-bold text-slate-700 uppercase">
                    {{ w.afp }}
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span
                      [ngClass]="{
                        'bg-emerald-100 text-emerald-800 border-emerald-200': w.estado === 'Activo',
                        'bg-amber-100 text-amber-800 border-amber-200': w.estado === 'Vacaciones'
                      }"
                      class="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                    >
                      {{ w.estado }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <button
                      (click)="selectedWorker.set(w)"
                      class="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded border border-blue-200 transition-colors cursor-pointer"
                    >
                      Ver Ficha
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <!-- MODAL FICHA INTEGRAL DEL COLABORADOR (LEGAJO LABORAL EXPANDIDO)       -->
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    @if (selectedWorker(); as w) {
      <div class="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
          
          <!-- Header Bar -->
          <div class="flex items-center justify-between px-6 py-4 bg-slate-50/80 border-b border-slate-200 shrink-0">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-sm">
                <svg class="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-900 leading-tight">
                  Ficha Integral del Colaborador
                </h3>
                <p class="text-xs text-slate-500">
                  Legajo Laboral Oficial · Expediente Digital Centralizado
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                (click)="printDoc()"
                class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer"
                title="Imprimir o guardar como PDF"
              >
                <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>
                </svg>
                <span>Imprimir</span>
              </button>
              <button
                (click)="selectedWorker.set(null)"
                class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Scrollable Body -->
          <div class="p-6 space-y-6 overflow-y-auto">
            
            <!-- Hero Profile Card -->
            <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-extrabold flex items-center justify-center text-xl shadow-md ring-4 ring-white/10 shrink-0">
                    {{ w.nombre.slice(0, 2).toUpperCase() }}
                  </div>
                  <div class="space-y-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <h4 class="text-xl font-bold text-white tracking-tight">
                        {{ w.nombre }}
                      </h4>
                      <span
                        [ngClass]="{
                          'bg-emerald-500/20 text-emerald-300 border-emerald-500/30': w.estado === 'Activo',
                          'bg-amber-500/20 text-amber-300 border-amber-500/30': w.estado === 'Vacaciones'
                        }"
                        class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                      >
                        <span
                          [ngClass]="{
                            'bg-emerald-400 animate-pulse': w.estado === 'Activo',
                            'bg-amber-400': w.estado === 'Vacaciones'
                          }"
                          class="w-1.5 h-1.5 rounded-full"
                        ></span>
                        {{ w.estado }}
                      </span>
                    </div>

                    <div class="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                      <span class="font-semibold text-blue-200 flex items-center gap-1">
                        <svg class="w-3.5 h-3.5 text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                        </svg>
                        {{ w.cargo }}
                      </span>
                      <span class="text-slate-500">•</span>
                      <span class="font-mono bg-white/10 px-2 py-0.5 rounded text-[11px] text-slate-200 font-medium">
                        DNI: {{ w.dni }}
                      </span>
                      <span class="text-slate-500">•</span>
                      <span class="text-slate-300 flex items-center gap-1">
                        <svg class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        {{ getSedeNombre(w.sedeId) }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    (click)="copyDni(w.dni)"
                    class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white font-medium flex items-center gap-1.5 transition-colors border border-white/10 cursor-pointer"
                  >
                    @if (copiedDni()) {
                      <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span>Copiado</span>
                    } @else {
                      <svg class="w-3.5 h-3.5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                      </svg>
                      <span>Copiar DNI</span>
                    }
                  </button>
                </div>
              </div>

              <!-- Quick Metadata Strip -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10 text-xs">
                <div class="flex items-center gap-2 text-slate-300">
                  <svg class="w-3.5 h-3.5 text-blue-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  <span class="truncate">{{ w.email || w.dni + '@empresa.com' }}</span>
                </div>
                <div class="flex items-center gap-2 text-slate-300">
                  <svg class="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <span>{{ w.telefono || '+51 984 123 456' }}</span>
                </div>
                <div class="flex items-center gap-2 text-slate-300">
                  <svg class="w-3.5 h-3.5 text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>Ingreso: {{ w.fechaIngreso || '2022-03-15' }} ({{ getAntiguedad(w.fechaIngreso) }})</span>
                </div>
              </div>
            </div>

            <!-- 2-Column Grid: Remuneraciones vs Previsión -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <!-- Card 1: Estructura Remunerativa -->
              <div class="bg-slate-50/70 border border-slate-200 rounded-xl p-4.5 space-y-3.5">
                <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h5 class="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    Estructura Salarial y Compensaciones
                  </h5>
                  <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                    Régimen {{ w.regimen || 'D.L. 728' }}
                  </span>
                </div>

                <div class="space-y-2 text-xs">
                  <div class="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span class="text-slate-600">Sueldo Básico Mensual</span>
                    <span class="font-bold text-slate-900 font-mono text-sm">
                      S/ {{ w.sueldoBase.toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span class="text-slate-600">Asignación Familiar (Ley 25129)</span>
                    <span class="font-semibold text-slate-900 font-mono">
                      {{ w.asigFamiliar ? 'S/ 102.50' : 'No aplica (S/ 0.00)' }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center py-1.5 px-2 bg-blue-50/80 rounded-lg border border-blue-100">
                    <span class="font-bold text-blue-900">Total Remuneración Bruta</span>
                    <span class="font-extrabold text-blue-700 font-mono text-sm">
                      S/ {{ (w.sueldoBase + (w.asigFamiliar ? 102.5 : 0)).toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}
                    </span>
                  </div>

                  <!-- Tasas diarias y por hora -->
                  <div class="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div class="p-2 rounded-lg bg-white border border-slate-200/70">
                      <span class="text-slate-400 block text-[10px] uppercase font-bold">Valor Diario (30d)</span>
                      <span class="font-bold text-slate-800 font-mono">
                        S/ {{ ((w.sueldoBase + (w.asigFamiliar ? 102.5 : 0)) / 30).toFixed(2) }}
                      </span>
                    </div>
                    <div class="p-2 rounded-lg bg-white border border-slate-200/70">
                      <span class="text-slate-400 block text-[10px] uppercase font-bold">Valor Hora (8h)</span>
                      <span class="font-bold text-slate-800 font-mono">
                        S/ {{ ((w.sueldoBase + (w.asigFamiliar ? 102.5 : 0)) / 240).toFixed(2) }}
                      </span>
                    </div>
                  </div>

                  <!-- Costos Empleador -->
                  <div class="pt-2 border-t border-slate-200/60 space-y-1.5 text-[11px]">
                    <span class="text-[10px] uppercase font-bold text-slate-400 block">
                      Aportes del Empleador (Costo Empresa)
                    </span>
                    <div class="flex justify-between text-slate-600">
                      <span>EsSalud Regular (9.00%)</span>
                      <span class="font-semibold text-slate-800 font-mono">
                        S/ {{ ((w.sueldoBase + (w.asigFamiliar ? 102.5 : 0)) * 0.09).toFixed(2) }}
                      </span>
                    </div>
                    <div class="flex justify-between text-slate-600">
                      <span>Seguro SCTR / Vida Ley (1.50%)</span>
                      <span class="font-semibold text-slate-800 font-mono">
                        S/ {{ ((w.sueldoBase + (w.asigFamiliar ? 102.5 : 0)) * 0.015).toFixed(2) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Card 2: Régimen Previsional -->
              <div class="bg-slate-50/70 border border-slate-200 rounded-xl p-4.5 space-y-3.5">
                <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h5 class="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                    Sistema Previsional y Descuentos
                  </h5>
                  <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                    {{ getAfpNombre(w.afp) }}
                  </span>
                </div>

                <div class="space-y-2 text-xs">
                  <div class="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span class="text-slate-600">Entidad Administradora</span>
                    <span class="font-bold text-slate-900">{{ getAfpNombre(w.afp) }}</span>
                  </div>
                  <div class="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span class="text-slate-600">CUSPP Afiliado</span>
                    <span class="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {{ w.dni }}{{ w.nombre.slice(0, 2).toUpperCase() }}0
                    </span>
                  </div>

                  <div class="space-y-1 pt-1 text-[11px]">
                    <span class="text-[10px] uppercase font-bold text-slate-400 block">
                      Retenciones de Ley
                    </span>
                    <div class="flex justify-between text-slate-600 py-0.5">
                      <span>Fondo de Pensiones (10.00%)</span>
                      <span class="font-mono font-semibold text-slate-800">
                        S/ {{ ((w.sueldoBase + (w.asigFamiliar ? 102.5 : 0)) * 0.10).toFixed(2) }}
                      </span>
                    </div>
                    <div class="flex justify-between text-slate-600 py-0.5">
                      <span>Prima de Seguro SIS + Comisión</span>
                      <span class="font-mono font-semibold text-slate-800">
                        S/ {{ ((w.sueldoBase + (w.asigFamiliar ? 102.5 : 0)) * 0.0325).toFixed(2) }}
                      </span>
                    </div>
                  </div>

                  <!-- Sueldo Neto en Mano -->
                  <div class="flex justify-between items-center py-2 px-3 bg-emerald-50 rounded-lg border border-emerald-200 mt-2">
                    <div>
                      <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                        Sueldo Líquido Estimado en Mano
                      </span>
                      <span class="text-[10px] text-emerald-600">Abono directo en cuenta de haberes</span>
                    </div>
                    <span class="font-black text-emerald-700 font-mono text-base">
                      S/ {{ ((w.sueldoBase + (w.asigFamiliar ? 102.5 : 0)) * 0.8675).toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            <!-- Card 3: Control Operativo de Asistencia y Matriz de Tareo -->
            <div class="bg-slate-50/70 border border-slate-200 rounded-xl p-4.5 space-y-3.5">
              <div class="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <h5 class="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Control Operativo de Asistencia del Mes
                </h5>
                <span class="text-xs text-slate-500">
                  Cumplimiento: <strong class="text-slate-900">100%</strong>
                </span>
              </div>

              <!-- Strip de 30 Días Visual -->
              <div class="space-y-1.5 pt-1">
                <span class="text-[10px] uppercase font-bold text-slate-400 block">
                  Secuencia de Asistencia del Mes (Días 1 al 30)
                </span>
                <div class="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-30 gap-1 overflow-x-auto py-1">
                  @for (code of (w.tareo || []); track $index) {
                    <div class="flex flex-col items-center justify-center p-1 rounded bg-white border border-slate-200 min-w-[24px]">
                      <span class="text-[8px] text-slate-400 font-mono leading-none">{{ $index + 1 }}</span>
                      <span
                        [ngClass]="getBadgeClass(code)"
                        class="text-[10px] font-black mt-0.5 px-1 rounded"
                      >
                        {{ code }}
                      </span>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- 3-Column Info: Empresa, Contrato y Bancario -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div class="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                <span class="font-bold text-slate-800 flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
                  </svg>
                  Empresa Empleadora
                </span>
                <p class="font-semibold text-slate-900 leading-tight">SERVICIOS CORPORATIVOS DE ASISTENCIA S.A.C.</p>
                <p class="font-mono text-[11px] text-slate-500">RUC: 20100088899</p>
              </div>

              <div class="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                <span class="font-bold text-slate-800 flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  Sede y Horario
                </span>
                <p class="font-semibold text-slate-900 leading-tight">{{ getSedeNombre(w.sedeId) }}</p>
                <p class="text-[11px] text-slate-500">Jornada: 48h Semanales (6x1)</p>
              </div>

              <div class="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                <span class="font-bold text-slate-800 flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                  Cuenta de Haberes
                </span>
                <p class="font-semibold text-slate-900 leading-tight">Banco de Crédito (BCP)</p>
                <p class="font-mono text-[11px] text-slate-500">N° 193-{{ w.dni }}-0-01</p>
              </div>
            </div>

          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-200 shrink-0">
            <span class="text-xs text-slate-500 font-mono">
              ID Sistema: #{{ String(w.id).padStart(5, '0') }} · Auditoría: Conforme
            </span>
            <div class="flex items-center gap-2">
              <button
                (click)="printDoc()"
                class="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Imprimir Legajo
              </button>
              <button
                (click)="selectedWorker.set(null)"
                class="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-md cursor-pointer"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>

        </div>
      </div>
    }

    <!-- Modal Nuevo Colaborador -->
    @if (showNewModal()) {
      <div class="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">Registrar Nuevo Colaborador</h3>
            <button (click)="showNewModal.set(false)" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <form (ngSubmit)="handleSaveNewWorker()" class="mt-4 space-y-3 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">DNI (8 dígitos)</label>
                <input
                  type="text"
                  maxlength="8"
                  [(ngModel)]="newForm.dni"
                  name="dni"
                  required
                  placeholder="45891234"
                  class="w-full h-9 px-3 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Cargo</label>
                <input
                  type="text"
                  [(ngModel)]="newForm.cargo"
                  name="cargo"
                  required
                  placeholder="Operario, Analista..."
                  class="w-full h-9 px-3 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Nombres Completos</label>
              <input
                type="text"
                [(ngModel)]="newForm.nombre"
                name="nombre"
                required
                placeholder="Juan Carlos Pérez"
                class="w-full h-9 px-3 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Sueldo Básico (S/)</label>
                <input
                  type="number"
                  [(ngModel)]="newForm.sueldoBase"
                  name="sueldoBase"
                  required
                  class="w-full h-9 px-3 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Sede Asignada</label>
                <select
                  [(ngModel)]="newForm.sedeId"
                  name="sedeId"
                  class="w-full h-9 px-3 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  @for (s of sedes; track s.id) {
                    <option [value]="s.id">{{ s.nombre }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                (click)="showNewModal.set(false)"
                class="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-md cursor-pointer"
              >
                Guardar y Activar
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class PersonalComponent {
  state = inject(PlanillasStateService);
  toast = inject(ToastService);
  String = String;

  sedes = SEDES;
  search = '';
  selectedSede = '';
  selectedEstado = '';

  selectedWorker = signal<Worker | null>(null);
  showNewModal = signal(false);
  copiedDni = signal(false);

  newForm = {
    dni: '',
    nombre: '',
    cargo: '',
    sueldoBase: 1500,
    sedeId: '1',
    afp: 'integra',
    asigFamiliar: true,
  };

  filteredWorkers = computed(() => {
    return this.state.workers().filter((w) => {
      const matchSearch =
        !this.search ||
        w.nombre.toLowerCase().includes(this.search.toLowerCase()) ||
        w.dni.includes(this.search) ||
        w.cargo.toLowerCase().includes(this.search.toLowerCase());
      const matchSede = !this.selectedSede || String(w.sedeId) === String(this.selectedSede);
      const matchEstado = !this.selectedEstado || w.estado === this.selectedEstado;
      return matchSearch && matchSede && matchEstado;
    });
  });

  getSedeNombre(sedeId: string): string {
    return SEDES.find((s) => String(s.id) === String(sedeId))?.nombre || 'Sede Central';
  }

  getAfpNombre(afpId: string): string {
    return AFPS.find((a) => a.id.toLowerCase() === (afpId || '').toLowerCase())?.nombre || 'AFP Integra';
  }

  getBadgeClass(code: string): string {
    return (BADGE_CONFIG as any)[code]?.cls || 'bg-slate-100 text-slate-700';
  }

  getAntiguedad(fechaStr: string): string {
    if (!fechaStr) return '1 año';
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return '1 año';
    const hoy = new Date();
    let anios = hoy.getFullYear() - fecha.getFullYear();
    let meses = hoy.getMonth() - fecha.getMonth();
    if (meses < 0) {
      anios--;
      meses += 12;
    }
    if (anios <= 0) return `${meses || 1} meses`;
    return `${anios} año${anios > 1 ? 's' : ''}${meses > 0 ? `, ${meses} m` : ''}`;
  }

  copyDni(dni: string): void {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(dni);
    }
    this.copiedDni.set(true);
    setTimeout(() => this.copiedDni.set(false), 2000);
  }

  printDoc(): void {
    window.print();
  }

  handleSaveNewWorker(): void {
    if (!this.newForm.dni || !this.newForm.nombre) {
      this.toast.show('Por favor completa los campos obligatorios.', 'error');
      return;
    }
    this.state.addWorker(this.newForm);
    this.showNewModal.set(false);
    this.toast.show(`Colaborador ${this.newForm.nombre} registrado correctamente.`, 'success');
    this.newForm = {
      dni: '',
      nombre: '',
      cargo: '',
      sueldoBase: 1500,
      sedeId: '1',
      afp: 'integra',
      asigFamiliar: true,
    };
  }
}

