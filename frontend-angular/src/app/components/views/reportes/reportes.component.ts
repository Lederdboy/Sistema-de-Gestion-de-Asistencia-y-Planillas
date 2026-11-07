import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanillasStateService } from '../../../services/planillas-state.service';
import { ToastService } from '../../../services/toast.service';
import { PdfService } from '../../../services/pdf.service';
import { ExcelService } from '../../../services/excel.service';
import { calcularPlanillaTrabajador, EMPRESAS } from '../../../data/mock-data';
import { PlanillaCalculada } from '../../../models/types';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- HEADER -->
      <div class="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center font-bold">
              <svg class="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-slate-900 tracking-tight">
                Emisión de Boletas & Declaraciones SUNAT / AFPNet
              </h1>
              <p class="text-xs text-slate-500 mt-0.5">
                Generación oficial de boletas de pago PDF (D.S. 001-98-TR), interfaz PLAME T-Registro y archivos AFPNet.
              </p>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <button
            (click)="descargarLoteBoletas()"
            class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m16 16 2 2 4-4"/><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
            </svg>
            <span>Descargar Lote Boletas (PDF)</span>
          </button>
        </div>
      </div>

      <!-- TABS CON ICONOS SVG -->
      <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          (click)="activeTab.set('boletas')"
          [ngClass]="{
            'bg-blue-600 text-white shadow-xs': activeTab() === 'boletas',
            'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200': activeTab() !== 'boletas'
          }"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <span>Boletas de Pago Digitales</span>
        </button>
        <button
          (click)="activeTab.set('plame')"
          [ngClass]="{
            'bg-blue-600 text-white shadow-xs': activeTab() === 'plame',
            'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200': activeTab() !== 'plame'
          }"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
          </svg>
          <span>Exportar SUNAT PLAME (.rem)</span>
        </button>
        <button
          (click)="activeTab.set('afpnet')"
          [ngClass]="{
            'bg-blue-600 text-white shadow-xs': activeTab() === 'afpnet',
            'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200': activeTab() !== 'afpnet'
          }"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
          <span>Exportar AFPNet (.txt)</span>
        </button>
      </div>

      <!-- TAB 1: BOLETAS DE PAGO -->
      @if (activeTab() === 'boletas') {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <!-- Columna izquierda: Lista de colaboradores -->
          <div class="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3 flex flex-col h-[720px]">
            <div class="relative">
              <input
                type="text"
                [(ngModel)]="searchWorker"
                placeholder="Buscar colaborador o DNI..."
                class="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50/50"
              />
              <span class="absolute left-2.5 top-2 text-slate-400">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
              </span>
            </div>

            <div class="flex-1 overflow-y-auto space-y-1.5 pr-1">
              @for (w of filteredWorkers(); track w.id) {
                <button
                  type="button"
                  (click)="selectWorker(w.id)"
                  [ngClass]="{
                    'bg-blue-50 border-blue-300 shadow-2xs': selectedWorkerId() === w.id,
                    'border-slate-100 hover:bg-slate-50': selectedWorkerId() !== w.id
                  }"
                  class="w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between"
                >
                  <div class="min-w-0 pr-2">
                    <p class="text-xs font-bold text-slate-900 truncate">{{ w.nombre }}</p>
                    <p class="text-[11px] text-slate-500 font-mono mt-0.5">DNI: {{ w.dni }} · {{ w.cargo }}</p>
                  </div>
                  <span class="text-xs font-bold text-blue-700 shrink-0 font-mono">
                    S/ {{ formatMoney(calcularPlanilla(w).netoPagar || 0) }}
                  </span>
                </button>
              }
            </div>
          </div>

          <!-- Columna derecha: Visor Oficial de Boleta -->
          <div class="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            @if (currentBoleta(); as b) {
              <div class="space-y-4">
                <!-- Barra de acciones de la boleta -->
                <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 class="text-base font-bold text-slate-900">
                      Boleta de Pago Oficial
                    </h3>
                    <p class="text-xs text-slate-500">Periodo Laboral: Septiembre 2026 · D.S. 001-98-TR</p>
                  </div>

                  <div class="flex items-center gap-2">
                    <button
                      (click)="imprimirBoleta()"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs"
                    >
                      <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>
                      </svg>
                      <span>Imprimir</span>
                    </button>
                    <button
                      (click)="descargarBoletaPdf(b)"
                      class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                    >
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      <span>Descargar PDF</span>
                    </button>
                  </div>
                </div>

                <!-- Plantilla Visual de la Boleta -->
                <div class="border border-slate-300 rounded-xl p-5 space-y-4 bg-white text-xs shadow-2xs">
                  <!-- Membrete Empresa -->
                  <div class="flex justify-between items-start border-b border-slate-200 pb-3">
                    <div>
                      <h4 class="font-black text-slate-900 text-sm tracking-tight">{{ empresa.nombre }}</h4>
                      <p class="text-slate-500 text-[11px]">RUC: {{ empresa.ruc }} · {{ empresa.direccion }}</p>
                    </div>
                    <div class="text-right">
                      <div class="font-mono font-black text-blue-700 bg-blue-50 py-1 px-3 rounded-lg border border-blue-200 text-xs inline-block">
                        BOLETA DE PAGO ELECTRONICA
                      </div>
                      <p class="text-[10px] text-slate-400 mt-1">Periodo: 2026-09</p>
                    </div>
                  </div>

                  <!-- Datos del Colaborador -->
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50/70 p-3 rounded-lg border border-slate-200 text-[11px]">
                    <div>
                      <span class="text-slate-400 block font-semibold">COLABORADOR:</span>
                      <strong class="text-slate-800">{{ b.nombre }}</strong>
                    </div>
                    <div>
                      <span class="text-slate-400 block font-semibold">DNI:</span>
                      <strong class="text-slate-800 font-mono">{{ b.dni }}</strong>
                    </div>
                    <div>
                      <span class="text-slate-400 block font-semibold">CARGO:</span>
                      <strong class="text-slate-800">{{ b.cargo }}</strong>
                    </div>
                    <div>
                      <span class="text-slate-400 block font-semibold">REGIMEN PREVISIONAL:</span>
                      <strong class="text-slate-800">{{ b.afp }}</strong>
                    </div>
                    <div>
                      <span class="text-slate-400 block font-semibold">DIAS COMPUTABLES:</span>
                      <strong class="text-slate-800 font-mono">30 días</strong>
                    </div>
                    <div>
                      <span class="text-slate-400 block font-semibold">HORAS TRABAJADAS:</span>
                      <strong class="text-slate-800 font-mono">240 horas</strong>
                    </div>
                    <div>
                      <span class="text-slate-400 block font-semibold">FECHA DE PAGO:</span>
                      <strong class="text-slate-800 font-mono">30/09/2026</strong>
                    </div>
                    <div>
                      <span class="text-slate-400 block font-semibold">MODO DE PAGO:</span>
                      <strong class="text-slate-800">Telecrédito BCP</strong>
                    </div>
                  </div>

                  <!-- Cuadros de Ingresos vs Descuentos -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <!-- Ingresos -->
                    <div class="border border-slate-200 rounded-lg overflow-hidden">
                      <div class="bg-blue-50/80 px-3 py-1.5 font-bold text-blue-900 border-b border-blue-100 flex justify-between">
                        <span>INGRESOS DEL TRABAJADOR</span>
                        <span>MONTO (S/)</span>
                      </div>
                      <div class="p-3 space-y-1.5">
                        <div class="flex justify-between">
                          <span class="text-slate-600">0121 Remuneración Básica</span>
                          <span class="font-mono font-medium">S/ {{ formatMoney(b.sueldoBase) }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-slate-600">0201 Asignación Familiar</span>
                          <span class="font-mono font-medium">S/ {{ formatMoney(b.asignacionFamiliar || 0) }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-slate-600">0105 Horas Extras</span>
                          <span class="font-mono font-medium">S/ {{ formatMoney(b.horasExtrasMonto || 0) }}</span>
                        </div>
                        <div class="border-t border-slate-200 pt-1.5 mt-2 flex justify-between font-bold text-slate-900">
                          <span>TOTAL INGRESOS BRUTOS</span>
                          <span class="font-mono">S/ {{ formatMoney(b.totalIngresos || 0) }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Descuentos -->
                    <div class="border border-slate-200 rounded-lg overflow-hidden">
                      <div class="bg-rose-50/80 px-3 py-1.5 font-bold text-rose-900 border-b border-rose-100 flex justify-between">
                        <span>DESCUENTOS AL TRABAJADOR</span>
                        <span>MONTO (S/)</span>
                      </div>
                      <div class="p-3 space-y-1.5">
                        <div class="flex justify-between">
                          <span class="text-slate-600">0601 Aporte Previsional ({{ b.afp }})</span>
                          <span class="font-mono text-rose-700">S/ {{ formatMoney(b.afpMonto || 0) }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-slate-600">0605 Renta de 5ta Categoría</span>
                          <span class="font-mono text-rose-700">S/ {{ formatMoney(b.quintaCategoria || 0) }}</span>
                        </div>
                        <div class="border-t border-slate-200 pt-1.5 mt-6 flex justify-between font-bold text-rose-800">
                          <span>TOTAL DESCUENTOS</span>
                          <span class="font-mono">S/ {{ formatMoney(b.totalDescuentos || 0) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Resumen Neto -->
                  <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <span class="text-[11px] font-bold text-emerald-800 uppercase block">NETO A PAGAR EN CUENTA BANCARIA</span>
                      <span class="text-xs text-emerald-700">Depósito abonado en cuenta de ahorros</span>
                    </div>
                    <div class="text-xl font-black text-emerald-800 font-mono">
                      S/ {{ formatMoney(b.netoPagar || 0) }}
                    </div>
                  </div>

                  <!-- Aportes Empleador -->
                  <div class="border border-slate-200 rounded-lg p-3 bg-slate-50/50 flex justify-between text-[11px] text-slate-600">
                    <span>Aportaciones Empleador: 0804 EsSalud (9%): <strong>S/ {{ formatMoney(b.essalud || 0) }}</strong></span>
                    <span>SCTR Salud/Pensión (1.5%): <strong>S/ {{ formatMoney(b.sctr || 0) }}</strong></span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- TAB 2: PLAME SUNAT -->
      @if (activeTab() === 'plame') {
        <div class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs max-w-3xl space-y-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <svg class="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
              </svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900">
                Generador de Interfaz SUNAT PLAME (Formulario Virtual N° 0601)
              </h3>
              <p class="text-xs text-slate-500">
                Estructura oficial para la importación del archivo de remuneraciones (.rem) en la Planilla Mensual de Pagos.
              </p>
            </div>
          </div>

          <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-600">Empresa / RUC:</span>
              <strong class="text-slate-800">{{ empresa.nombre }} ({{ empresa.ruc }})</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">Periodo Tributario:</span>
              <strong class="font-mono text-slate-800">2026-09</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">Colaboradores a declarar:</span>
              <strong class="text-blue-700">{{ state.workers().length }} registros</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">Nombre de archivo normativo:</span>
              <strong class="font-mono text-slate-700">0601202609{{ empresa.ruc }}.rem</strong>
            </div>
          </div>

          <button
            (click)="descargarPlame()"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Descargar Archivo PLAME (.rem)</span>
          </button>
        </div>
      }

      <!-- TAB 3: AFPNET -->
      @if (activeTab() === 'afpnet') {
        <div class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs max-w-3xl space-y-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <svg class="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900">
                Generador de Planillas Previsionales AFPNet
              </h3>
              <p class="text-xs text-slate-500">
                Archivo de texto delimitado para carga masiva de aportes obligatorios en el portal web de la Asociación de AFP.
              </p>
            </div>
          </div>

          <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-600">Periodo Devengado:</span>
              <strong class="font-mono text-slate-800">2026-09</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">Colaboradores afiliados a SPP:</span>
              <strong class="text-blue-700">{{ getAfpWorkersCount() }} registros</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">Formato:</span>
              <strong class="font-mono text-slate-700">Texto delimitado por tabulaciones (Tab-separated)</strong>
            </div>
          </div>

          <button
            (click)="descargarAfpNet()"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Descargar Archivo AFPNet (.txt)</span>
          </button>
        </div>
      }
    </div>
  `,
})
export class ReportesComponent {
  state = inject(PlanillasStateService);
  toast = inject(ToastService);
  pdfService = inject(PdfService);
  excelService = inject(ExcelService);

  readonly empresa = EMPRESAS[0];
  readonly activeTab = signal<'boletas' | 'plame' | 'afpnet'>('boletas');

  searchWorker = '';
  readonly selectedWorkerId = signal<number>(1);

  readonly filteredWorkers = computed(() => {
    const term = this.searchWorker.toLowerCase();
    return this.state.workers().filter(
      (w) =>
        !term ||
        w.nombre.toLowerCase().includes(term) ||
        w.dni.includes(term) ||
        w.cargo.toLowerCase().includes(term)
    );
  });

  readonly currentWorker = computed(() => {
    return this.state.workers().find((w) => w.id === this.selectedWorkerId()) || this.state.workers()[0];
  });

  readonly currentBoleta = computed<PlanillaCalculada | null>(() => {
    const w = this.currentWorker();
    return w ? calcularPlanillaTrabajador(w) : null;
  });

  selectWorker(id: number): void {
    this.selectedWorkerId.set(id);
  }

  calcularPlanilla(w: any): PlanillaCalculada {
    return calcularPlanillaTrabajador(w);
  }

  formatMoney(val: number): string {
    return (val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getAfpWorkersCount(): number {
    return this.state.workers().filter((w) => w.afp !== 'ONP').length;
  }

  descargarBoletaPdf(b: PlanillaCalculada): void {
    this.pdfService.generarBoletaPDF(b);
    this.toast.show(`Boleta de ${b.nombre} generada en PDF.`, 'success');
  }

  descargarLoteBoletas(): void {
    const all = this.state.workers().map((w) => calcularPlanillaTrabajador(w));
    this.pdfService.generarLoteBoletasPDF(all);
    this.toast.show('Lote completo de boletas generado exitosamente.', 'success');
  }

  imprimirBoleta(): void {
    window.print();
  }

  descargarPlame(): void {
    const all = this.state.workers().map((w) => calcularPlanillaTrabajador(w));
    this.excelService.exportarPlameRemTxt(all, '2026-09');
    this.toast.show('Archivo SUNAT PLAME (.rem) descargado.', 'success');
  }

  descargarAfpNet(): void {
    const all = this.state.workers().map((w) => calcularPlanillaTrabajador(w));
    this.excelService.exportarAfpNetTxt(all, '2026-09');
    this.toast.show('Archivo AFPNet (.txt) descargado.', 'success');
  }
}
