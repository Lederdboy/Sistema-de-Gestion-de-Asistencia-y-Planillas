import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanillasStateService } from '../../../services/planillas-state.service';
import { ToastService } from '../../../services/toast.service';
import { ExcelService } from '../../../services/excel.service';
import { ApiService } from '../../../services/api.service';
import { calcularPlanillaTrabajador } from '../../../data/mock-data';
import { PlanillaCalculada } from '../../../models/types';

@Component({
  selector: 'app-planilla',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- CABECERA PRINCIPAL -->
      <div class="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
              <svg class="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-xl font-bold text-slate-900 tracking-tight">
                  Cálculo de Planilla Mensual
                </h1>
                <span
                  [ngClass]="{
                    'bg-amber-100 text-amber-800 border-amber-200': status() === 'Pre-Planilla',
                    'bg-emerald-100 text-emerald-800 border-emerald-200': status() === 'Aprobada'
                  }"
                  class="px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
                >
                  {{ status() }}
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">
                Procesamiento automatizado de haberes, descuentos AFP/ONP, renta de 5ta y aportes patronales (EsSalud/SCTR).
              </p>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <select
            [(ngModel)]="periodo"
            class="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="2026-09">Septiembre 2026</option>
            <option value="2026-08">Agosto 2026</option>
            <option value="2026-07">Julio 2026</option>
          </select>

          <button
            (click)="exportExcel()"
            class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
          >
            <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Excel (.xlsx)</span>
          </button>

          <button
            (click)="exportTxtBancario()"
            class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
          >
            <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
            <span>Telecrédito BCP (.txt)</span>
          </button>

          @if (status() === 'Pre-Planilla') {
            <button
              (click)="openCerrarModal()"
              class="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>Aprobar & Cerrar</span>
            </button>
          } @else {
            <button
              (click)="reabrirPlanilla()"
              class="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-all cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>
              </svg>
              <span>Reabrir Planilla</span>
            </button>
          }
        </div>
      </div>

      <!-- KPIS TOTALES DE PLANILLA CON SVGS -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div class="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-500">Remuneración Bruta Total</span>
            <span class="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </span>
          </div>
          <div class="mt-2 text-xl sm:text-2xl font-black text-slate-900">
            S/ {{ formatMoney(totales().totalIngresos) }}
          </div>
          <p class="text-[11px] text-slate-400 mt-0.5">Básico + Asig. Fam + Horas Extras</p>
        </div>

        <div class="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-500">Retenciones a Colaboradores</span>
            <span class="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <svg class="w-4 h-4 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
              </svg>
            </span>
          </div>
          <div class="mt-2 text-xl sm:text-2xl font-black text-rose-600">
            S/ {{ formatMoney(totales().totalDescuentos) }}
          </div>
          <p class="text-[11px] text-slate-400 mt-0.5">Aportes AFP/ONP + Renta 5ta Cat</p>
        </div>

        <div class="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-500">Neto a Dispersar a Bancos</span>
            <span class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg class="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </span>
          </div>
          <div class="mt-2 text-xl sm:text-2xl font-black text-emerald-600">
            S/ {{ formatMoney(totales().netoPagar) }}
          </div>
          <p class="text-[11px] text-slate-400 mt-0.5">Monto líquido a transferir</p>
        </div>

        <div class="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-500">Aportes Patronales (Empleador)</span>
            <span class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg class="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </span>
          </div>
          <div class="mt-2 text-xl sm:text-2xl font-black text-indigo-700">
            S/ {{ formatMoney(totales().totalAportesPatronales) }}
          </div>
          <p class="text-[11px] text-slate-400 mt-0.5">EsSalud 9% + SCTR Salud/Pensión</p>
        </div>
      </div>

      <!-- FILTRO Y BÚSQUEDA -->
      <div class="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div class="relative flex-1 min-w-[240px]">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            placeholder="Buscar por DNI o nombre del colaborador..."
            class="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50/50"
          />
          <span class="absolute left-3 top-2.5 text-slate-400">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </span>
        </div>

        <span class="text-xs text-slate-500 font-medium">
          Total Colaboradores en Planilla: <strong class="text-slate-800">{{ filteredPlanilla().length }}</strong>
        </span>
      </div>

      <!-- TABLA DE DETALLE DE PLANILLA -->
      <div class="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th class="py-3 px-4">Colaborador</th>
                <th class="py-3 px-3 text-right">Básico</th>
                <th class="py-3 px-3 text-right">Asig. Fam.</th>
                <th class="py-3 px-3 text-right">H. Extras</th>
                <th class="py-3 px-3 text-right font-bold text-slate-700">Total Bruto</th>
                <th class="py-3 px-3 text-right">AFP / ONP</th>
                <th class="py-3 px-3 text-right">5ta Cat.</th>
                <th class="py-3 px-3 text-right font-bold text-rose-600">Total Dscto.</th>
                <th class="py-3 px-3 text-right font-black text-emerald-700 bg-emerald-50/40">Neto a Pagar</th>
                <th class="py-3 px-3 text-right">EsSalud (9%)</th>
                <th class="py-3 px-4 text-center">Boleta</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              @for (row of filteredPlanilla(); track row.trabajadorId) {
                <tr class="hover:bg-slate-50/70 transition-colors">
                  <td class="py-3 px-4">
                    <div class="font-bold text-slate-900">{{ row.nombre }}</div>
                    <div class="text-[11px] text-slate-400 font-mono">DNI: {{ row.dni }} · {{ row.afp }}</div>
                  </td>
                  <td class="py-3 px-3 text-right font-mono">S/ {{ formatMoney(row.sueldoBase) }}</td>
                  <td class="py-3 px-3 text-right font-mono">S/ {{ formatMoney(row.asignacionFamiliar || 0) }}</td>
                  <td class="py-3 px-3 text-right font-mono">S/ {{ formatMoney(row.horasExtrasMonto || 0) }}</td>
                  <td class="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    S/ {{ formatMoney(row.totalIngresos || 0) }}
                  </td>
                  <td class="py-3 px-3 text-right font-mono text-rose-600">
                    S/ {{ formatMoney(row.afpMonto || 0) }}
                  </td>
                  <td class="py-3 px-3 text-right font-mono text-rose-600">
                    S/ {{ formatMoney(row.quintaCategoria || 0) }}
                  </td>
                  <td class="py-3 px-3 text-right font-mono font-bold text-rose-700">
                    - S/ {{ formatMoney(row.totalDescuentos || 0) }}
                  </td>
                  <td class="py-3 px-3 text-right font-mono font-black text-emerald-700 bg-emerald-50/40">
                    S/ {{ formatMoney(row.netoPagar || 0) }}
                  </td>
                  <td class="py-3 px-3 text-right font-mono text-slate-500">
                    S/ {{ formatMoney(row.essalud || 0) }}
                  </td>
                  <td class="py-3 px-4 text-center">
                    <button
                      (click)="goToBoleta(row)"
                      class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs cursor-pointer shadow-2xs"
                    >
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <span>Boleta</span>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL CONFIRMAR CIERRE DE PLANILLA -->
      @if (showCerrarModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div class="p-5 text-center space-y-3">
              <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <svg class="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h3 class="text-base font-bold text-slate-900">
                ¿Aprobar y Cerrar Planilla {{ periodo }}?
              </h3>
              <p class="text-xs text-slate-500 leading-relaxed">
                Al cerrar la planilla se congelarán los tareos, horas extras y cálculos de este periodo. Las boletas quedarán emitidas oficialmente para firma y entrega a los trabajadores.
              </p>
              <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-left space-y-1">
                <div><strong>Total Neto a Pagar:</strong> S/ {{ formatMoney(totales().netoPagar) }}</div>
                <div><strong>Total Colaboradores:</strong> {{ dataPlanilla().length }} personas</div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 px-5 py-3.5 bg-slate-50 border-t border-slate-200">
              <button
                (click)="showCerrarModal.set(false)"
                class="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                (click)="confirmarCierre()"
                class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                Confirmar Cierre de Planilla
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class PlanillaComponent {
  state = inject(PlanillasStateService);
  toast = inject(ToastService);
  excelService = inject(ExcelService);
  api = inject(ApiService);

  periodo = '2026-09';
  status = signal<'Pre-Planilla' | 'Aprobada'>('Pre-Planilla');
  searchTerm = '';
  readonly showCerrarModal = signal<boolean>(false);

  readonly dataPlanilla = computed<PlanillaCalculada[]>(() => {
    return this.state.workers().map((w) => calcularPlanillaTrabajador(w));
  });

  readonly filteredPlanilla = computed<PlanillaCalculada[]>(() => {
    const term = this.searchTerm.toLowerCase();
    return this.dataPlanilla().filter(
      (p) =>
        !term ||
        p.nombre.toLowerCase().includes(term) ||
        p.dni.includes(term)
    );
  });

  readonly totales = computed(() => {
    const list = this.dataPlanilla();
    return {
      totalIngresos: list.reduce((acc, p) => acc + (p.totalIngresos || 0), 0),
      totalDescuentos: list.reduce((acc, p) => acc + (p.totalDescuentos || 0), 0),
      netoPagar: list.reduce((acc, p) => acc + (p.netoPagar || 0), 0),
      totalAportesPatronales: list.reduce((acc, p) => acc + ((p.essalud || 0) + (p.sctr || 0)), 0),
    };
  });

  formatMoney(val: number): string {
    return (val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  exportExcel(): void {
    this.excelService.exportarPlanillaExcel(this.dataPlanilla(), this.periodo);
    this.toast.show(`Planilla ${this.periodo} exportada en Excel con éxito.`, 'success');
  }

  exportTxtBancario(): void {
    this.excelService.exportarDispersiónBancariaTxt(this.dataPlanilla(), this.periodo);
    this.toast.show(`Archivo Telecrédito BCP generado para el periodo ${this.periodo}.`, 'success');
  }

  openCerrarModal(): void {
    this.showCerrarModal.set(true);
  }

  confirmarCierre(): void {
    this.showCerrarModal.set(false);
    this.api.cerrarPlanilla(this.periodo, 1, 'Carlos Mendoza').subscribe({
      next: () => {
        this.status.set('Aprobada');
        this.toast.show(`Planilla ${this.periodo} aprobada y cerrada oficialmente.`, 'success');
      },
      error: () => {
        this.status.set('Aprobada');
        this.toast.show(`Planilla ${this.periodo} cerrada (modo offline).`, 'success');
      },
    });
  }

  reabrirPlanilla(): void {
    this.status.set('Pre-Planilla');
    this.toast.show(`Planilla ${this.periodo} reabierta para edición.`, 'info');
  }

  goToBoleta(row: PlanillaCalculada): void {
    this.state.setNav('reportes');
  }
}
