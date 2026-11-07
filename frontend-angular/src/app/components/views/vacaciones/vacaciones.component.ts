import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanillasStateService } from '../../../services/planillas-state.service';
import { ToastService } from '../../../services/toast.service';
import { ExcelService } from '../../../services/excel.service';
import { VacationRequest } from '../../../models/types';
import { getVacationRecordForWorker, SEDES } from '../../../data/mock-data';

@Component({
  selector: 'app-vacaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- HEADER CON ACCIONES -->
      <div class="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <svg class="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2"/><path d="M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-2"/><path d="M5.89 9.71c-2.15 1.45-3 4.17-1.89 6.29"/><path d="M17.5 15c.96-1.83.6-4.04-1-5.34"/><path d="M12 12v9"/><path d="M8 21h8"/>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-slate-900 tracking-tight">
                Control de Vacaciones y Descansos (D.L. 713)
              </h1>
              <p class="text-xs text-slate-500 mt-0.5">
                Récord vacacional, control de devengados, alertas de triple vacacional e indemnizaciones SUNAFIL.
              </p>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <button
            (click)="exportExcel()"
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-2xs"
          >
            <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Exportar Récord (.xlsx)</span>
          </button>
          <button
            (click)="openNewRequestModal()"
            class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Programar Vacaciones</span>
          </button>
        </div>
      </div>

      <!-- KPIS GLOBALES CON ICONOS SVG -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div class="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-500">En Goce Vacacional</span>
            <span class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg class="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
              </svg>
            </span>
          </div>
          <div class="mt-2 text-2xl font-black text-slate-900">{{ kpis().enGoce }}</div>
          <p class="text-[11px] text-slate-400 mt-0.5">Trabajadores descansando hoy</p>
        </div>

        <div class="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-500">Saldo Global Pendiente</span>
            <span class="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </span>
          </div>
          <div class="mt-2 text-2xl font-black text-blue-600">{{ kpis().totalSaldo }} <span class="text-sm font-semibold">días</span></div>
          <p class="text-[11px] text-slate-400 mt-0.5">Días adeudados por la empresa</p>
        </div>

        <div class="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-500">Próximas Salidas</span>
            <span class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg class="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </span>
          </div>
          <div class="mt-2 text-2xl font-black text-slate-900">{{ kpis().proximasSalidas }}</div>
          <p class="text-[11px] text-slate-400 mt-0.5">Programadas para este mes</p>
        </div>

        <div class="rounded-2xl border border-rose-200 bg-rose-50/30 p-4 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-rose-700">Riesgo SUNAFIL (D.L. 713)</span>
            <span class="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <svg class="w-4 h-4 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </span>
          </div>
          <div class="mt-2 text-2xl font-black text-rose-600">{{ kpis().alertasRiesgo }}</div>
          <p class="text-[11px] text-rose-700/80 mt-0.5">Exceden plazo anual de goce</p>
        </div>
      </div>

      <!-- TABS CON ICONOS SVG -->
      <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          (click)="activeTab.set('record')"
          [ngClass]="{
            'bg-blue-600 text-white shadow-xs': activeTab() === 'record',
            'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200': activeTab() !== 'record'
          }"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          </svg>
          <span>Récord Vacacional</span>
        </button>
        <button
          (click)="activeTab.set('solicitudes')"
          [ngClass]="{
            'bg-blue-600 text-white shadow-xs': activeTab() === 'solicitudes',
            'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200': activeTab() !== 'solicitudes'
          }"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          <span>Solicitudes & Papeletas</span>
        </button>
        <button
          (click)="activeTab.set('venta')"
          [ngClass]="{
            'bg-blue-600 text-white shadow-xs': activeTab() === 'venta',
            'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200': activeTab() !== 'venta'
          }"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <span>Venta de Vacaciones (Art. 19)</span>
        </button>
      </div>

      <!-- TAB 1: RÉCORD VACACIONAL -->
      @if (activeTab() === 'record') {
        <div class="space-y-4">
          <!-- Filtros de búsqueda -->
          <div class="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs flex flex-wrap gap-3 items-center justify-between">
            <div class="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
              <div class="relative flex-1 min-w-[200px]">
                <input
                  type="text"
                  [(ngModel)]="searchRecord"
                  placeholder="Buscar por DNI, colaborador o cargo..."
                  class="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50/50"
                />
                <span class="absolute left-3 top-2.5 text-slate-400">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                  </svg>
                </span>
              </div>

              <select
                [(ngModel)]="filterSedeRecord"
                class="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white text-slate-700"
              >
                <option value="">Todas las Sedes</option>
                @for (sede of sedes; track sede.id) {
                  <option [value]="sede.id">{{ sede.nombre }}</option>
                }
              </select>

              <select
                [(ngModel)]="filterEstadoRecord"
                class="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white text-slate-700"
              >
                <option value="">Todos los Estados</option>
                <option value="Normal">Normal</option>
                <option value="Riesgo / Por Vencer">Riesgo / Por Vencer</option>
                <option value="Alerta de Vencimiento">Alerta de Vencimiento</option>
              </select>
            </div>

            <span class="text-xs text-slate-500 font-medium">
              Mostrando <strong class="text-slate-800">{{ filteredRecords().length }}</strong> colaboradores
            </span>
          </div>

          <!-- TABLA RÉCORD -->
          <div class="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th class="py-3 px-4">Colaborador</th>
                    <th class="py-3 px-3">Sede</th>
                    <th class="py-3 px-3">Fecha Ingreso</th>
                    <th class="py-3 px-3 text-center">Días Ganados</th>
                    <th class="py-3 px-3 text-center">Gozados</th>
                    <th class="py-3 px-3 text-center">Vendidos</th>
                    <th class="py-3 px-3 text-center">Saldo Actual</th>
                    <th class="py-3 px-3 text-center">Estado Legal</th>
                    <th class="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">
                  @for (worker of filteredRecords(); track worker.id) {
                    <tr class="hover:bg-slate-50/70 transition-colors">
                      <td class="py-3.5 px-4">
                        <div class="flex items-center gap-3">
                          <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {{ worker.nombre.substring(0, 2).toUpperCase() }}
                          </div>
                          <div>
                            <div class="font-bold text-slate-900">{{ worker.nombre }}</div>
                            <div class="text-[11px] text-slate-400 font-mono">DNI: {{ worker.dni }} · {{ worker.cargo }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="py-3.5 px-3">
                        <span class="text-slate-600">{{ getSedeNombre(worker.sedeId) }}</span>
                      </td>
                      <td class="py-3.5 px-3 font-mono text-slate-500">
                        {{ worker.fechaIngreso }}
                      </td>
                      <td class="py-3.5 px-3 text-center font-bold text-slate-800">
                        {{ worker.record?.diasGanados || 0 }} d
                      </td>
                      <td class="py-3.5 px-3 text-center font-semibold text-emerald-600">
                        {{ worker.record?.diasGozados || 0 }} d
                      </td>
                      <td class="py-3.5 px-3 text-center font-semibold text-amber-600">
                        {{ worker.record?.diasVendidos || 0 }} d
                      </td>
                      <td class="py-3.5 px-3 text-center font-black text-sm" [ngClass]="{
                        'text-rose-600': (worker.record?.saldoPendiente || 0) > 30,
                        'text-blue-600': (worker.record?.saldoPendiente || 0) <= 30
                      }">
                        {{ worker.record?.saldoPendiente || 0 }} d
                      </td>
                      <td class="py-3.5 px-3 text-center">
                        <span
                          [ngClass]="{
                            'bg-rose-100 text-rose-800 border-rose-200': worker.record?.estadoRecord === 'Riesgo / Por Vencer',
                            'bg-amber-100 text-amber-800 border-amber-200': worker.record?.estadoRecord === 'Alerta de Vencimiento',
                            'bg-emerald-100 text-emerald-800 border-emerald-200': worker.record?.estadoRecord === 'Normal'
                          }"
                          class="px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block"
                        >
                          {{ worker.record?.estadoRecord || 'Normal' }}
                        </span>
                      </td>
                      <td class="py-3.5 px-4 text-right">
                        <button
                          (click)="openWorkerFicha(worker)"
                          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>
                          </svg>
                          <span>Ver Ficha</span>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      <!-- TAB 2: SOLICITUDES Y PAPELETAS -->
      @if (activeTab() === 'solicitudes') {
        <div class="space-y-4">
          <div class="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs flex flex-wrap gap-3 items-center justify-between">
            <div class="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
              <input
                type="text"
                [(ngModel)]="searchReq"
                placeholder="Buscar por código, colaborador o DNI..."
                class="flex-1 min-w-[220px] px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50/50"
              />
              <select
                [(ngModel)]="filterEstadoReq"
                class="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white text-slate-700"
              >
                <option value="">Todos los Estados</option>
                <option value="En Goce">En Goce</option>
                <option value="Programada">Programada</option>
                <option value="Aprobada">Aprobada</option>
                <option value="Finalizada">Finalizada</option>
              </select>
            </div>
            <button
              (click)="openNewRequestModal()"
              class="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors cursor-pointer"
            >
              + Nueva Solicitud
            </button>
          </div>

          <div class="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th class="py-3 px-4">Código</th>
                    <th class="py-3 px-4">Colaborador</th>
                    <th class="py-3 px-3">Periodo Comp.</th>
                    <th class="py-3 px-3">Rango de Fechas</th>
                    <th class="py-3 px-3 text-center">Días</th>
                    <th class="py-3 px-3">Tipo</th>
                    <th class="py-3 px-3 text-center">Estado</th>
                    <th class="py-3 px-4 text-right">Papeleta</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">
                  @for (req of filteredRequests(); track req.id) {
                    <tr class="hover:bg-slate-50/70 transition-colors">
                      <td class="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {{ req.id }}
                      </td>
                      <td class="py-3.5 px-4">
                        <div class="font-bold text-slate-900">{{ getWorkerName(req.trabajadorId) }}</div>
                        <div class="text-[11px] text-slate-400 font-mono">DNI: {{ getWorkerDni(req.trabajadorId) }}</div>
                      </td>
                      <td class="py-3.5 px-3 font-mono text-slate-600">
                        {{ req.periodo }}
                      </td>
                      <td class="py-3.5 px-3 font-mono text-xs">
                        {{ req.fechaInicio }} <span class="text-slate-400">al</span> {{ req.fechaFin }}
                      </td>
                      <td class="py-3.5 px-3 text-center font-bold text-slate-900">
                        {{ req.dias }} d
                      </td>
                      <td class="py-3.5 px-3 font-medium text-slate-600">
                        {{ req.tipo }}
                      </td>
                      <td class="py-3.5 px-3 text-center">
                        <span
                          [ngClass]="{
                            'bg-emerald-100 text-emerald-800 border-emerald-200': req.estado === 'En Goce',
                            'bg-blue-100 text-blue-800 border-blue-200': req.estado === 'Programada' || req.estado === 'Aprobada',
                            'bg-slate-100 text-slate-700 border-slate-200': req.estado === 'Finalizada'
                          }"
                          class="px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block"
                        >
                          {{ req.estado }}
                        </span>
                      </td>
                      <td class="py-3.5 px-4 text-right">
                        <button
                          (click)="openPapeleta(req)"
                          class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs"
                        >
                          <svg class="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                          </svg>
                          <span>Papeleta</span>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      <!-- TAB 3: SIMULADOR DE VENTA DE VACACIONES -->
      @if (activeTab() === 'venta') {
        <div class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs max-w-3xl space-y-5">
          <div>
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <svg class="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              <span>Simulador de Compra/Venta de Vacaciones (Art. 19 D.L. 713)</span>
            </h3>
            <p class="text-xs text-slate-500 mt-1">
              El trabajador puede acordar por escrito con el empleador la venta de hasta un máximo de 15 días de vacaciones por periodo anual, debiendo gozar efectivamente al menos de los 15 días restantes.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Colaborador</label>
              <select
                [(ngModel)]="simWorkerId"
                class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
              >
                @for (w of state.workers(); track w.id) {
                  <option [value]="w.id">{{ w.nombre }} ({{ w.cargo }})</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Días a Vender (Máx. 15 días)</label>
              <input
                type="number"
                min="1"
                max="15"
                [(ngModel)]="simDiasVenta"
                class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          @if (simulatedWorker(); as simW) {
            <div class="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-3">
              <div class="flex items-center justify-between border-b border-blue-100 pb-2">
                <span class="text-xs font-bold text-blue-900">Liquidación Estimada de Venta</span>
                <span class="text-xs font-mono font-bold text-blue-700">{{ simDiasVenta }} Días Computables</span>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span class="text-slate-500 block text-[11px]">Sueldo Básico:</span>
                  <strong class="text-slate-800">S/ {{ simW.sueldoBase.toFixed(2) }}</strong>
                </div>
                <div>
                  <span class="text-slate-500 block text-[11px]">Remun. Diaria:</span>
                  <strong class="text-slate-800">S/ {{ (simW.sueldoBase / 30).toFixed(2) }}</strong>
                </div>
                <div>
                  <span class="text-slate-500 block text-[11px]">Compensación Bruta:</span>
                  <strong class="text-emerald-700 font-bold text-sm">S/ {{ ((simW.sueldoBase / 30) * simDiasVenta).toFixed(2) }}</strong>
                </div>
                <div>
                  <span class="text-slate-500 block text-[11px]">Aporte EsSalud (9%):</span>
                  <strong class="text-slate-800">S/ {{ (((simW.sueldoBase / 30) * simDiasVenta) * 0.09).toFixed(2) }}</strong>
                </div>
              </div>
              <div class="text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-lg border border-blue-100 flex items-start gap-2">
                <svg class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span>Este monto estará afecto a descuentos previsionales de ley (AFP / ONP) y retención de Impuesto a la Renta de 5ta Categoría al pagarse en la planilla mensual.</span>
              </div>
            </div>
          }
        </div>
      }

      <!-- MODAL FICHA DE VACACIONES EXPANDIDA (MAX-W-4XL) -->
      @if (selectedWorker(); as w) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 bg-slate-50/90 border-b border-slate-200 shrink-0">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  {{ w.nombre.substring(0, 2).toUpperCase() }}
                </div>
                <div>
                  <h2 class="text-base font-bold text-slate-900 leading-tight">
                    {{ w.nombre }}
                  </h2>
                  <p class="text-xs text-slate-500 font-mono mt-0.5">
                    DNI: {{ w.dni }} · {{ w.cargo }} · Sede: {{ getSedeNombre(w.sedeId) }} · D.L. 713
                  </p>
                </div>
              </div>

              <button
                (click)="closeWorkerFicha()"
                class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <!-- Cuerpo Scrolleable -->
            <div class="p-6 overflow-y-auto space-y-5">
              <!-- 4 KPIS DEL TRABAJADOR -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <span class="text-[11px] font-medium text-slate-500 block">DÍAS GANADOS</span>
                  <div class="text-xl font-black text-slate-900 mt-1">{{ w.record?.diasGanados || 0 }} d</div>
                  <span class="text-[10px] text-slate-400">Total acumulado</span>
                </div>
                <div class="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40">
                  <span class="text-[11px] font-semibold text-emerald-700 block">DÍAS GOZADOS</span>
                  <div class="text-xl font-black text-emerald-700 mt-1">{{ w.record?.diasGozados || 0 }} d</div>
                  <span class="text-[10px] text-emerald-600">Efectuados con goce</span>
                </div>
                <div class="p-3.5 rounded-xl border border-amber-100 bg-amber-50/40">
                  <span class="text-[11px] font-semibold text-amber-700 block">DÍAS VENDIDOS</span>
                  <div class="text-xl font-black text-amber-700 mt-1">{{ w.record?.diasVendidos || 0 }} d</div>
                  <span class="text-[10px] text-amber-600">Compensación monetaria</span>
                </div>
                <div class="p-3.5 rounded-xl border border-blue-200 bg-blue-50/60">
                  <span class="text-[11px] font-bold text-blue-800 block">SALDO DISPONIBLE</span>
                  <div class="text-xl font-black text-blue-700 mt-1">{{ w.record?.saldoPendiente || 0 }} d</div>
                  <span class="text-[10px] text-blue-600">Exigible legalmente</span>
                </div>
              </div>

              <!-- RESUMEN ECONÓMICO Y LABORAL -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs">
                <div>
                  <span class="text-slate-500 text-[11px] block">Fecha de Ingreso:</span>
                  <span class="font-bold text-slate-800 font-mono">{{ w.fechaIngreso }}</span>
                </div>
                <div>
                  <span class="text-slate-500 text-[11px] block">Sueldo Básico Actual:</span>
                  <span class="font-bold text-slate-800">S/ {{ w.sueldoBase.toFixed(2) }}</span>
                </div>
                <div>
                  <span class="text-slate-500 text-[11px] block">Provisión Económica Vacacional:</span>
                  <span class="font-black text-blue-700 text-sm">
                    S/ {{ (((w.sueldoBase / 30) * (w.record?.saldoPendiente || 0))).toFixed(2) }}
                  </span>
                </div>
              </div>

              <!-- ALERTA SUNAFIL TRIPLE VACACIONAL SI APLICA -->
              @if ((w.record?.saldoPendiente || 0) > 30) {
                <div class="p-4 rounded-xl border border-rose-200 bg-rose-50/60 flex items-start gap-3">
                  <svg class="w-5 h-5 text-rose-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <div class="text-xs">
                    <strong class="text-rose-800 block font-bold">
                      Riesgo de Indemnización Vacacional (Art. 23 D.L. 713)
                    </strong>
                    <p class="text-rose-700 mt-0.5">
                      Este colaborador mantiene más de 30 días de vacaciones vencidas acumuladas sin goce oportuno. De acuerdo a la normativa SUNAFIL, si el descanso no se otorga dentro del año siguiente al que se adquirió el derecho, la empresa queda obligada a abonar una remuneración por el trabajo realizado, una por el descanso vacacional adquirido y una indemnización equivalente a una remuneración adicional ("Triple Vacacional").
                    </p>
                  </div>
                </div>
              }

              <!-- DESGLOSE POR PERIODO COMPUTABLE -->
              <div>
                <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Desglose por Periodo Computable (D.L. 713)
                </h4>
                <div class="border border-slate-200 rounded-xl overflow-hidden">
                  <table class="w-full text-left text-xs">
                    <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                      <tr>
                        <th class="py-2.5 px-3">Periodo Laboral</th>
                        <th class="py-2.5 px-2 text-center">Ganados</th>
                        <th class="py-2.5 px-2 text-center">Gozados</th>
                        <th class="py-2.5 px-2 text-center">Saldo</th>
                        <th class="py-2.5 px-3">Fecha Límite Goce</th>
                        <th class="py-2.5 px-3 text-center">Estado del Récord</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-slate-700">
                      @for (p of w.record?.periodos; track p.periodo) {
                        <tr class="hover:bg-slate-50/50">
                          <td class="py-2.5 px-3 font-mono font-semibold text-slate-900">{{ p.periodo }}</td>
                          <td class="py-2.5 px-2 text-center font-bold">{{ p.diasGanados }} d</td>
                          <td class="py-2.5 px-2 text-center text-emerald-600 font-semibold">{{ p.diasGozados }} d</td>
                          <td class="py-2.5 px-2 text-center font-bold" [ngClass]="{ 'text-rose-600': p.saldo > 0, 'text-slate-500': p.saldo === 0 }">
                            {{ p.saldo }} d
                          </td>
                          <td class="py-2.5 px-3 font-mono text-slate-500">{{ p.fechaLimite }}</td>
                          <td class="py-2.5 px-3 text-center">
                            <span
                              [ngClass]="{
                                'bg-emerald-100 text-emerald-800': p.estado === 'Gozado Completo',
                                'bg-rose-100 text-rose-800 font-bold': p.estado === 'Vencido - Requiere Indemnización',
                                'bg-amber-100 text-amber-800': p.estado === 'Pendiente / En Plazo'
                              }"
                              class="px-2 py-0.5 rounded-full text-[10px] inline-block"
                            >
                              {{ p.estado }}
                            </span>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- HISTORIAL DE SOLICITUDES Y DESCANSOS -->
              <div>
                <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Historial de Descansos y Convenios
                </h4>
                <div class="border border-slate-200 rounded-xl overflow-hidden">
                  <table class="w-full text-left text-xs">
                    <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                      <tr>
                        <th class="py-2.5 px-3">Código</th>
                        <th class="py-2.5 px-3">Fechas</th>
                        <th class="py-2.5 px-2 text-center">Días</th>
                        <th class="py-2.5 px-3">Tipo</th>
                        <th class="py-2.5 px-3 text-center">Estado</th>
                        <th class="py-2.5 px-3 text-right">Papeleta</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-slate-700">
                      @for (sol of getWorkerRequests(w.id); track sol.id) {
                        <tr class="hover:bg-slate-50/50">
                          <td class="py-2.5 px-3 font-mono font-bold">{{ sol.id }}</td>
                          <td class="py-2.5 px-3 font-mono text-[11px]">{{ sol.fechaInicio }} al {{ sol.fechaFin }}</td>
                          <td class="py-2.5 px-2 text-center font-bold text-slate-900">{{ sol.dias }} d</td>
                          <td class="py-2.5 px-3 text-slate-600">{{ sol.tipo }}</td>
                          <td class="py-2.5 px-3 text-center">
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                              {{ sol.estado }}
                            </span>
                          </td>
                          <td class="py-2.5 px-3 text-right">
                            <button
                              (click)="openPapeleta(sol)"
                              class="text-blue-600 hover:text-blue-800 font-semibold text-[11px] underline cursor-pointer"
                            >
                              Ver Papeleta
                            </button>
                          </td>
                        </tr>
                      }
                      @if (getWorkerRequests(w.id).length === 0) {
                        <tr>
                          <td colspan="6" class="py-4 text-center text-slate-400 italic">
                            No se registran descansos vacacionales previos para este colaborador.
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Footer Modal -->
            <div class="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-200 shrink-0">
              <button
                (click)="printFicha(w)"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs"
              >
                <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>
                </svg>
                <span>Imprimir Ficha</span>
              </button>

              <div class="flex items-center gap-2">
                <button
                  (click)="closeWorkerFicha()"
                  class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Cerrar Ficha
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- MODAL PAPELETA OFICIAL -->
      @if (selectedPapeleta(); as p) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div class="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200">
              <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                <span>Papeleta de Salida Vacacional</span>
              </h3>
              <button (click)="selectedPapeleta.set(null)" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div class="p-5 text-xs space-y-4">
              <div class="text-center pb-3 border-b border-slate-200">
                <h4 class="font-black text-slate-900 text-sm">MINERA ANDINA S.A.</h4>
                <p class="text-slate-500 text-[11px]">RUC: 20489123891 · Gerencia de Gestión del Talento Humano</p>
                <div class="mt-2 font-mono font-bold text-blue-600 bg-blue-50 py-1 px-2.5 rounded-lg inline-block">
                  PAPELETA N° {{ p.id }}
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                <div>
                  <span class="text-slate-400 text-[10px] block uppercase font-bold">Colaborador</span>
                  <span class="font-bold text-slate-800">{{ getWorkerName(p.trabajadorId) }}</span>
                </div>
                <div>
                  <span class="text-slate-400 text-[10px] block uppercase font-bold">DNI</span>
                  <span class="font-mono text-slate-800">{{ getWorkerDni(p.trabajadorId) }}</span>
                </div>
                <div>
                  <span class="text-slate-400 text-[10px] block uppercase font-bold">Periodo Devengado</span>
                  <span class="font-mono text-slate-800">{{ p.periodo }}</span>
                </div>
                <div>
                  <span class="text-slate-400 text-[10px] block uppercase font-bold">Días Otorgados</span>
                  <span class="font-bold text-blue-700">{{ p.dias }} Días Naturales</span>
                </div>
                <div>
                  <span class="text-slate-400 text-[10px] block uppercase font-bold">Fecha de Salida</span>
                  <span class="font-mono text-slate-800">{{ p.fechaInicio }}</span>
                </div>
                <div>
                  <span class="text-slate-400 text-[10px] block uppercase font-bold">Fecha de Retorno</span>
                  <span class="font-mono text-slate-800">{{ p.fechaFin }}</span>
                </div>
              </div>

              <div class="pt-8 grid grid-cols-2 gap-6 text-center text-[10px] text-slate-500">
                <div class="border-t border-slate-300 pt-1">
                  Firma del Trabajador<br />(Conforme)
                </div>
                <div class="border-t border-slate-300 pt-1">
                  V°B° Jefatura de RRHH<br />Minera Andina S.A.
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 px-5 py-3 bg-slate-50 border-t border-slate-200">
              <button
                (click)="printPapeleta()"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>
                </svg>
                <span>Imprimir Papeleta</span>
              </button>
              <button
                (click)="selectedPapeleta.set(null)"
                class="px-3.5 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL NUEVA SOLICITUD DE VACACIONES -->
      @if (showNewModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div class="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200">
              <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2"/><path d="M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-2"/><path d="M12 12v9"/><path d="M8 21h8"/>
                </svg>
                <span>Programar Salida de Vacaciones</span>
              </h3>
              <button (click)="showNewModal.set(false)" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form (ngSubmit)="saveNewRequest()" class="p-5 space-y-4 text-xs">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Colaborador</label>
                <select
                  [(ngModel)]="newReqForm.trabajadorId"
                  name="trabajadorId"
                  required
                  class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">-- Seleccionar colaborador --</option>
                  @for (w of state.workers(); track w.id) {
                    <option [value]="w.id">{{ w.nombre }} ({{ w.cargo }})</option>
                  }
                </select>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    [(ngModel)]="newReqForm.fechaInicio"
                    name="fechaInicio"
                    (change)="recalcDays()"
                    required
                    class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    [(ngModel)]="newReqForm.fechaFin"
                    name="fechaFin"
                    (change)="recalcDays()"
                    required
                    class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Días Totales</label>
                  <input
                    type="number"
                    [(ngModel)]="newReqForm.dias"
                    name="dias"
                    min="1"
                    max="30"
                    required
                    class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Periodo Devengado</label>
                  <select
                    [(ngModel)]="newReqForm.periodo"
                    name="periodo"
                    class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2023-2024">2023-2024 (Vencido)</option>
                  </select>
                </div>
              </div>

              <div class="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="syncTareo"
                  [(ngModel)]="newReqForm.syncTareo"
                  name="syncTareo"
                  class="rounded text-blue-600 focus:ring-blue-500"
                />
                <label for="syncTareo" class="text-xs text-slate-700 cursor-pointer font-medium">
                  Sincronizar automáticamente con el módulo de Tareo Diario ("VAC")
                </label>
              </div>

              <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  (click)="showNewModal.set(false)"
                  class="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Confirmar Programación
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class VacacionesComponent {
  state = inject(PlanillasStateService);
  toast = inject(ToastService);
  excelService = inject(ExcelService);

  readonly sedes = SEDES;
  readonly activeTab = signal<'record' | 'solicitudes' | 'venta'>('record');

  // Filtros
  searchRecord = '';
  filterSedeRecord = '';
  filterEstadoRecord = '';

  searchReq = '';
  filterEstadoReq = '';

  // Modales
  readonly selectedWorker = signal<any>(null);
  readonly selectedPapeleta = signal<VacationRequest | null>(null);
  readonly showNewModal = signal<boolean>(false);

  // Venta
  simWorkerId = 1;
  simDiasVenta = 15;

  // Formulario nueva solicitud
  newReqForm = {
    trabajadorId: '',
    fechaInicio: '2026-09-10',
    fechaFin: '2026-09-24',
    dias: 15,
    periodo: '2024-2025',
    tipo: 'Goce Regular',
    syncTareo: true,
  };

  // Trabajadores con récord calculado
  readonly workersWithRecord = computed(() => {
    const list = this.state.workers();
    const reqs = this.state.requests();
    return list.map((w) => ({
      ...w,
      record: getVacationRecordForWorker(w, reqs),
    }));
  });

  // KPIs
  readonly kpis = computed(() => {
    const records = this.workersWithRecord();
    const reqs = this.state.requests();

    const enGoce = records.filter(
      (w) =>
        w.estado === 'Vacaciones' ||
        reqs.some((r) => r.trabajadorId === w.id && r.estado === 'En Goce')
    ).length;

    const totalSaldo = records.reduce((sum, w) => sum + (w.record?.saldoPendiente || 0), 0);
    const proximasSalidas = reqs.filter((r) => r.estado === 'Programada' || r.estado === 'Aprobada').length;
    const alertasRiesgo = records.filter((w) => w.record?.estadoRecord === 'Riesgo / Por Vencer').length;

    return { enGoce, totalSaldo, proximasSalidas, alertasRiesgo };
  });

  readonly filteredRecords = computed(() => {
    const term = this.searchRecord.toLowerCase();
    const sede = this.filterSedeRecord;
    const estado = this.filterEstadoRecord;

    return this.workersWithRecord().filter((w) => {
      const matchSearch =
        !term ||
        w.nombre.toLowerCase().includes(term) ||
        w.dni.includes(term) ||
        w.cargo.toLowerCase().includes(term);
      const matchSede = !sede || w.sedeId === sede;
      const matchEstado = !estado || w.record?.estadoRecord === estado;
      return matchSearch && matchSede && matchEstado;
    });
  });

  readonly filteredRequests = computed(() => {
    const term = this.searchReq.toLowerCase();
    const estado = this.filterEstadoReq;
    const list = this.state.requests();
    const workers = this.state.workers();

    return list.filter((r) => {
      const worker = workers.find((w) => w.id === r.trabajadorId);
      const matchSearch =
        !term ||
        (worker && worker.nombre.toLowerCase().includes(term)) ||
        (worker && worker.dni.includes(term)) ||
        r.id.toLowerCase().includes(term);
      const matchEstado = !estado || r.estado === estado;
      return matchSearch && matchEstado;
    });
  });

  readonly simulatedWorker = computed(() => {
    return this.state.workers().find((w) => w.id === Number(this.simWorkerId));
  });

  getSedeNombre(sedeId: string): string {
    return SEDES.find((s) => s.id === sedeId)?.nombre || 'Sede Principal';
  }

  getWorkerName(workerId: number): string {
    return this.state.workers().find((w) => w.id === workerId)?.nombre || `Trabajador #${workerId}`;
  }

  getWorkerDni(workerId: number): string {
    return this.state.workers().find((w) => w.id === workerId)?.dni || '-';
  }

  getWorkerRequests(workerId: number): VacationRequest[] {
    return this.state.requests().filter((r) => r.trabajadorId === workerId);
  }

  openWorkerFicha(worker: any): void {
    const full = this.workersWithRecord().find((w) => w.id === worker.id);
    this.selectedWorker.set(full || worker);
  }

  closeWorkerFicha(): void {
    this.selectedWorker.set(null);
  }

  openPapeleta(req: VacationRequest): void {
    this.selectedPapeleta.set(req);
  }

  openNewRequestModal(): void {
    this.showNewModal.set(true);
  }

  recalcDays(): void {
    if (this.newReqForm.fechaInicio && this.newReqForm.fechaFin) {
      const d1 = new Date(this.newReqForm.fechaInicio);
      const d2 = new Date(this.newReqForm.fechaFin);
      if (d2 >= d1) {
        const diffDays = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        this.newReqForm.dias = diffDays;
      }
    }
  }

  saveNewRequest(): void {
    if (!this.newReqForm.trabajadorId) {
      this.toast.show('Por favor seleccione un colaborador.', 'error');
      return;
    }

    const currentReqs = this.state.requests();
    const newId = `VAC-2026-${String(currentReqs.length + 1).padStart(3, '0')}`;
    const newReq: VacationRequest = {
      id: newId,
      trabajadorId: Number(this.newReqForm.trabajadorId),
      fechaInicio: this.newReqForm.fechaInicio,
      fechaFin: this.newReqForm.fechaFin,
      dias: Number(this.newReqForm.dias),
      tipo: this.newReqForm.tipo,
      periodo: this.newReqForm.periodo,
      estado: 'Programada',
      documento: `SOL-${newId}`,
      observaciones: 'Programada desde el portal de RRHH.',
      aprobadoPor: 'Carlos Mendoza',
      fechaRegistro: new Date().toISOString().split('T')[0],
    };

    this.state.requests.update((arr) => [newReq, ...arr]);
    this.toast.show(`Vacaciones ${newId} programadas con éxito.`, 'success');
    this.showNewModal.set(false);
  }

  exportExcel(): void {
    this.excelService.exportarRecordVacacionalExcel(this.workersWithRecord());
    this.toast.show('Récord vacacional exportado en formato Excel.', 'success');
  }

  printFicha(worker: any): void {
    window.print();
  }

  printPapeleta(): void {
    window.print();
  }
}
