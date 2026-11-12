import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { PdfService } from '../../services/pdf.service';
import { ExcelService } from '../../services/excel.service';
import { PlanillaItem } from '../../models/planilla.model';
import { calcularPlanillaTrabajador } from '../../data/mock-data';

@Component({
  selector: 'app-planilla',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
        <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 sm:gap-4">
          <div class="flex items-start sm:items-center gap-2.5 min-w-0">
            <svg class="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-lg font-bold text-slate-900 sm:text-xl truncate">
                  Planilla Mensual de Remuneraciones
                </h2>
                <span
                  class="inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold"
                  [ngClass]="status() === 'Aprobada' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'"
                >
                  {{ status() }}
                </span>
              </div>
              <p class="mt-0.5 text-xs text-slate-500 truncate">
                Periodo {{ periodo }} · {{ planillas().length }} colaboradores procesados (D.L. 728)
              </p>
            </div>
          </div>

          <!-- Actions toolbar -->
          <div class="flex items-center gap-2 flex-nowrap overflow-x-auto pb-1 max-w-full flex-shrink-0">
            <!-- Refresh Button -->
            <button
              type="button"
              (click)="refresh()"
              [disabled]="apiService.loading()"
              class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0"
              title="Actualizar planilla"
            >
              <svg
                class="w-3.5 h-3.5 text-slate-500 transition-colors"
                [ngClass]="{ 'animate-spin text-blue-600': apiService.loading() }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{{ apiService.loading() ? 'Actualizando...' : 'Actualizar' }}</span>
            </button>

            <!-- Export Excel -->
            <button
              (click)="exportExcel()"
              class="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 shadow-xs transition-all hover:bg-sky-100 cursor-pointer whitespace-nowrap flex-shrink-0"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Exportar Excel</span>
            </button>

            <!-- Export Bank -->
            <button
              (click)="exportBank()"
              class="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-emerald-700 cursor-pointer whitespace-nowrap flex-shrink-0"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>TXT Bancos</span>
            </button>

            <!-- Batch Boletas PDF -->
            <button
              (click)="exportLotePDF()"
              class="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 shadow-xs transition-all hover:bg-indigo-100 cursor-pointer whitespace-nowrap flex-shrink-0"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Lote Boletas PDF</span>
            </button>

            <!-- Approve Button -->
            @if (status() !== 'Aprobada') {
              <button
                (click)="handleApprove()"
                class="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-700 cursor-pointer whitespace-nowrap flex-shrink-0"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Aprobar y Emitir</span>
              </button>
            } @else {
              <span class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-600 whitespace-nowrap flex-shrink-0">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Planilla Cerrada</span>
              </span>
            }
          </div>
        </div>
      </div>

      <!-- KPI Totals -->
      <div class="grid grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3">
        @if (apiService.loading()) {
          <!-- Skeleton KPI Cards -->
          <div class="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs animate-pulse">
            <div class="h-3 w-20 bg-slate-200 rounded mb-2.5"></div>
            <div class="h-7 w-32 bg-slate-200 rounded mb-2"></div>
            <div class="h-2.5 w-36 bg-slate-100 rounded"></div>
          </div>

          <div class="rounded-2xl border border-rose-200/70 bg-rose-50/50 p-3.5 shadow-xs animate-pulse">
            <div class="h-3 w-28 bg-rose-200/60 rounded mb-2.5"></div>
            <div class="h-7 w-32 bg-rose-200/70 rounded mb-2"></div>
            <div class="h-2.5 w-36 bg-rose-100 rounded"></div>
          </div>

          <div class="rounded-2xl border border-sky-200/70 bg-sky-50/50 p-3.5 shadow-xs animate-pulse">
            <div class="h-3 w-24 bg-sky-200/60 rounded mb-2.5"></div>
            <div class="h-7 w-32 bg-sky-200/70 rounded mb-2"></div>
            <div class="h-2.5 w-36 bg-sky-100 rounded"></div>
          </div>

          <div class="rounded-2xl border border-emerald-200/70 bg-emerald-50/50 p-3.5 shadow-xs animate-pulse">
            <div class="h-3 w-28 bg-emerald-200/60 rounded mb-2.5"></div>
            <div class="h-7 w-32 bg-emerald-200/70 rounded mb-2"></div>
            <div class="h-2.5 w-36 bg-emerald-100 rounded"></div>
          </div>
        } @else {
          <div class="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
            <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Bruta</p>
            <p class="mt-1 text-xl sm:text-2xl font-black text-slate-900 font-mono">
              S/ {{ totalBruto().toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}
            </p>
            <p class="text-[10px] text-slate-500 mt-0.5">Básico + Asig. Fam. + Nocturna</p>
          </div>

          <div class="rounded-2xl border border-rose-200 bg-rose-50/70 p-3.5 shadow-xs">
            <p class="text-[11px] font-semibold uppercase tracking-wider text-rose-600">Descuentos de Ley</p>
            <p class="mt-1 text-xl sm:text-2xl font-black text-rose-700 font-mono">
              - S/ {{ totalDescuentos().toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}
            </p>
            <p class="text-[10px] text-rose-600 mt-0.5">AFP, ONP, Faltas, 5ta Cat.</p>
          </div>

          <div class="rounded-2xl border border-sky-200 bg-sky-50/80 p-3.5 shadow-xs">
            <p class="text-[11px] font-semibold uppercase tracking-wider text-sky-700">Neto a Pagar</p>
            <p class="mt-1 text-xl sm:text-2xl font-black text-sky-900 font-mono">
              S/ {{ totalNeto().toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}
            </p>
            <p class="text-[10px] text-sky-700 mt-0.5">Dispersión bancaria neta</p>
          </div>

          <div class="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 shadow-xs">
            <p class="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Aportes Empleador</p>
            <p class="mt-1 text-xl sm:text-2xl font-black text-emerald-900 font-mono">
              S/ {{ totalEsSalud().toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}
            </p>
            <p class="text-[10px] text-emerald-700 mt-0.5">EsSalud 9% (PLAME)</p>
          </div>
        }
      </div>

      <!-- Search bar -->
      <div class="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="relative w-full max-w-md">
          <svg class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            [(ngModel)]="search"
            placeholder="Buscar por DNI o nombre..."
            class="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>
        <div class="text-xs font-medium text-slate-500">
          @if (apiService.loading()) {
            <span class="inline-flex items-center gap-1.5 text-blue-600 font-semibold animate-pulse">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              Sincronizando nómina...
            </span>
          } @else {
            Mostrando <span class="font-bold text-slate-800">{{ filteredPlanillas().length }}</span> de {{ planillas().length }}
          }
        </div>
      </div>

      <!-- Payroll Table -->
      <div class="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div class="overflow-x-auto pb-2">
          <table class="min-w-[980px] w-full border-collapse text-left text-xs select-auto">
            <thead class="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
              <tr>
                <th class="px-3 py-3">Colaborador</th>
                <th class="px-2 py-3 text-center">DNI</th>
                <th class="px-2 py-3 text-center">Días Comp.</th>
                <th class="px-2 py-3 text-right">Básico Prop.</th>
                <th class="px-2 py-3 text-right">Asig. Fam.</th>
                <th class="px-2 py-3 text-right">Sobretasa</th>
                <th class="bg-slate-100 px-2 py-3 text-right font-bold text-slate-800">Total Bruto</th>
                <th class="px-2 py-3 text-center">Pensión</th>
                <th class="px-2 py-3 text-right text-rose-600">Desc. AFP/ONP</th>
                <th class="px-2 py-3 text-right text-rose-600">Desc. Faltas</th>
                <th class="bg-rose-50 px-2 py-3 text-right font-bold text-rose-700">Total Desc.</th>
                <th class="bg-sky-50 px-3 py-3 text-right font-extrabold text-sky-900">Neto a Pagar</th>
                <th class="px-2 py-3 text-right text-emerald-700">EsSalud 9%</th>
                <th class="px-2 py-3 text-center">Boleta</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @if (apiService.loading()) {
                @for (item of skeletonRows; track item) {
                  <tr class="animate-pulse">
                    <td class="px-3 py-3">
                      <div class="h-3.5 w-36 bg-slate-200 rounded mb-1"></div>
                      <div class="h-2.5 w-24 bg-slate-100 rounded"></div>
                    </td>
                    <td class="px-2 py-3 text-center">
                      <div class="h-3 w-16 bg-slate-200 rounded mx-auto"></div>
                    </td>
                    <td class="px-2 py-3 text-center">
                      <div class="h-3 w-6 bg-slate-200 rounded mx-auto"></div>
                    </td>
                    <td class="px-2 py-3 text-right">
                      <div class="h-3 w-14 bg-slate-200 rounded ml-auto"></div>
                    </td>
                    <td class="px-2 py-3 text-right">
                      <div class="h-3 w-12 bg-slate-200 rounded ml-auto"></div>
                    </td>
                    <td class="px-2 py-3 text-right">
                      <div class="h-3 w-12 bg-slate-200 rounded ml-auto"></div>
                    </td>
                    <td class="bg-slate-50/70 px-2 py-3 text-right">
                      <div class="h-3.5 w-16 bg-slate-200 rounded ml-auto"></div>
                    </td>
                    <td class="px-2 py-3 text-center">
                      <div class="h-4 w-16 bg-slate-200 rounded-full mx-auto"></div>
                    </td>
                    <td class="px-2 py-3 text-right">
                      <div class="h-3 w-14 bg-rose-200/50 rounded ml-auto"></div>
                    </td>
                    <td class="px-2 py-3 text-right">
                      <div class="h-3 w-12 bg-rose-200/50 rounded ml-auto"></div>
                    </td>
                    <td class="bg-rose-50/50 px-2 py-3 text-right">
                      <div class="h-3.5 w-16 bg-rose-200/60 rounded ml-auto"></div>
                    </td>
                    <td class="bg-sky-50/50 px-3 py-3 text-right">
                      <div class="h-3.5 w-18 bg-sky-200/60 rounded ml-auto"></div>
                    </td>
                    <td class="px-2 py-3 text-right">
                      <div class="h-3 w-14 bg-emerald-200/50 rounded ml-auto"></div>
                    </td>
                    <td class="px-2 py-3 text-center">
                      <div class="h-6 w-6 bg-slate-200 rounded-lg mx-auto"></div>
                    </td>
                  </tr>
                }
              } @else {
                @for (row of filteredPlanillas(); track row.trabajadorId) {
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-3 py-2.5">
                      <p class="font-bold text-slate-900">{{ row.nombre }}</p>
                      <p class="text-[10px] text-slate-500">{{ row.cargo }}</p>
                    </td>
                    <td class="px-2 py-2.5 text-center font-mono text-slate-600">{{ row.dni }}</td>
                    <td class="px-2 py-2.5 text-center font-semibold text-slate-700">
                      {{ row.diasTrabajados + row.diasDescanso + row.diasVacaciones }}
                    </td>
                    <td class="px-2 py-2.5 text-right font-mono">S/ {{ row.basicoProporcional.toFixed(2) }}</td>
                    <td class="px-2 py-2.5 text-right font-mono">S/ {{ row.asigFamiliar.toFixed(2) }}</td>
                    <td class="px-2 py-2.5 text-right font-mono">S/ {{ row.sobretasaNocturna.toFixed(2) }}</td>
                    <td class="bg-slate-50 px-2 py-2.5 text-right font-mono font-bold text-slate-900">
                      S/ {{ row.totalBruto.toFixed(2) }}
                    </td>
                    <td class="px-2 py-2.5 text-center">
                      <span class="inline-flex rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                        {{ row.afp }}
                      </span>
                    </td>
                    <td class="px-2 py-2.5 text-right font-mono text-rose-600">-S/ {{ row.descuentoPension.toFixed(2) }}</td>
                    <td class="px-2 py-2.5 text-right font-mono text-rose-600">-S/ {{ row.descuentoFaltas.toFixed(2) }}</td>
                    <td class="bg-rose-50 px-2 py-2.5 text-right font-mono font-bold text-rose-700">
                      -S/ {{ row.totalDescuentos.toFixed(2) }}
                    </td>
                    <td class="bg-sky-50 px-3 py-2.5 text-right font-mono font-black text-sky-900">
                      S/ {{ row.netoPagar.toFixed(2) }}
                    </td>
                    <td class="px-2 py-2.5 text-right font-mono text-emerald-700">S/ {{ row.aporteEsSalud.toFixed(2) }}</td>
                    <td class="px-2 py-2.5 text-center">
                      <button
                        (click)="generarBoleta(row)"
                        title="Descargar boleta oficial en PDF"
                        class="inline-flex h-8 w-8 items-center justify-center rounded-xl text-sky-700 hover:bg-sky-100 transition-colors cursor-pointer"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                }
              }
            </tbody>
            <tfoot class="border-t border-slate-200 bg-slate-100 font-bold text-slate-800">
              @if (apiService.loading()) {
                <tr class="animate-pulse">
                  <td colspan="6" class="px-3 py-2.5 text-right text-[11px] uppercase text-slate-500">
                    Calculando totales...
                  </td>
                  <td class="px-2 py-2.5 text-right font-mono">
                    <div class="h-3.5 w-16 bg-slate-300 rounded ml-auto"></div>
                  </td>
                  <td></td>
                  <td colspan="2" class="px-2 py-2.5 text-right font-mono">
                    <div class="h-3.5 w-16 bg-rose-200 rounded ml-auto"></div>
                  </td>
                  <td class="bg-rose-100 px-2 py-2.5 text-right font-mono">
                    <div class="h-3.5 w-16 bg-rose-300 rounded ml-auto"></div>
                  </td>
                  <td class="bg-sky-100 px-3 py-2.5 text-right font-mono">
                    <div class="h-3.5 w-18 bg-sky-300 rounded ml-auto"></div>
                  </td>
                  <td class="px-2 py-2.5 text-right font-mono">
                    <div class="h-3.5 w-14 bg-emerald-300 rounded ml-auto"></div>
                  </td>
                  <td></td>
                </tr>
              } @else {
                <tr>
                  <td colspan="6" class="px-3 py-2.5 text-right text-[11px] uppercase">
                    Totales del periodo:
                  </td>
                  <td class="px-2 py-2.5 text-right font-mono">S/ {{ totalBruto().toFixed(2) }}</td>
                  <td></td>
                  <td colspan="2" class="px-2 py-2.5 text-right font-mono text-rose-700">-S/ {{ totalDescuentos().toFixed(2) }}</td>
                  <td class="bg-rose-100 px-2 py-2.5 text-right font-mono text-rose-700">-S/ {{ totalDescuentos().toFixed(2) }}</td>
                  <td class="bg-sky-100 px-3 py-2.5 text-right font-mono text-sky-900">S/ {{ totalNeto().toFixed(2) }}</td>
                  <td class="px-2 py-2.5 text-right font-mono text-emerald-800">S/ {{ totalEsSalud().toFixed(2) }}</td>
                  <td></td>
                </tr>
              }
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  `
})
export class PlanillaComponent {
  apiService = inject(ApiService);
  toastService = inject(ToastService);
  pdfService = inject(PdfService);
  excelService = inject(ExcelService);

  periodo = '2026-09';
  search = '';
  status = signal<'Pre-Planilla' | 'Aprobada'>('Pre-Planilla');
  skeletonRows = [1, 2, 3, 4, 5, 6, 7, 8];

  async refresh() {
    if (this.apiService.loading()) return;
    this.apiService.loading.set(true);
    try {
      await Promise.all([
        this.apiService.getTrabajadores(),
        new Promise(resolve => setTimeout(resolve, 800))
      ]);
      this.apiService.lastUpdate.set(new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }));
      this.toastService.show('Planilla actualizada correctamente', 'success');
    } finally {
      this.apiService.loading.set(false);
    }
  }

  planillas = computed(() => {
    return this.apiService.workers().map(w => calcularPlanillaTrabajador(w));
  });

  filteredPlanillas = computed(() => {
    const s = this.search.toLowerCase();
    return this.planillas().filter(p => !s || p.nombre.toLowerCase().includes(s) || p.dni.includes(s));
  });

  totalBruto = computed(() => this.planillas().reduce((sum, p) => sum + p.totalBruto, 0));
  totalDescuentos = computed(() => this.planillas().reduce((sum, p) => sum + p.totalDescuentos, 0));
  totalNeto = computed(() => this.planillas().reduce((sum, p) => sum + p.netoPagar, 0));
  totalEsSalud = computed(() => this.planillas().reduce((sum, p) => sum + p.aporteEsSalud, 0));

  async handleApprove() {
    this.status.set('Aprobada');
    await this.apiService.cerrarPlanilla(this.periodo, 1, 'Carlos Mendoza (Admin)');
    this.toastService.show(`Planilla ${this.periodo} aprobada y cerrada exitosamente.`, 'success');
  }

  exportExcel() {
    this.toastService.show('Descargando planilla consolidada en Excel (.xlsx)...', 'info');
    this.excelService.exportarPlanillaExcel(this.planillas(), this.periodo);
  }

  exportBank() {
    this.toastService.show('Generando archivo de dispersión bancaria BCP...', 'info');
    this.excelService.exportarDispersionBancariaTxt(this.planillas(), this.periodo);
  }

  exportLotePDF() {
    this.toastService.show('Generando lote completo de boletas de pago en PDF...', 'info');
    this.pdfService.generarLoteBoletasPDF(this.planillas(), this.periodo);
  }

  generarBoleta(item: PlanillaItem) {
    this.toastService.show(`Descargando boleta de pago para ${item.nombre}...`, 'info');
    this.pdfService.generarBoletaPDF(item, this.periodo);
  }
}

