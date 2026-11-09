import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { PdfService } from '../../services/pdf.service';
import { ExcelService } from '../../services/excel.service';
import { calcularPlanillaTrabajador } from '../../data/mock-data';
import { PlanillaItem } from '../../models/planilla.model';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <svg class="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Centro de Reportes y Declaraciones SUNAT
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
              Generación de boletas individuales, lote masivo en PDF y archivos oficiales de exportación PLAME y AFP Net.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button
              (click)="descargarLotePDF()"
              class="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Descargar Lote de Boletas PDF</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Export Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <!-- PLAME -->
        <div class="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SUNAT PDT 601</span>
              <span class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">.rem</span>
            </div>
            <h3 class="text-sm font-bold text-slate-900 mt-1">Estructura Remuneraciones PLAME</h3>
            <p class="text-xs text-slate-500 mt-1">Archivo de texto con formato SUNAT para declaración mensual de conceptos y aportes.</p>
          </div>
          <button
            (click)="descargarPlame()"
            class="w-full h-9 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Generar Archivo .rem</span>
          </button>
        </div>

        <!-- AFP Net -->
        <div class="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Planillas AFP</span>
              <span class="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">.txt</span>
            </div>
            <h3 class="text-sm font-bold text-slate-900 mt-1">Archivo de Aportes AFP Net</h3>
            <p class="text-xs text-slate-500 mt-1">Formato oficial para declaración y pago masivo de aportes de fondo, comisión y prima.</p>
          </div>
          <button
            (click)="descargarAfpNet()"
            class="w-full h-9 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Generar AFP Net .txt</span>
          </button>
        </div>

        <!-- BCP Telecrédito -->
        <div class="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dispersión Bancaria</span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">Telecrédito</span>
            </div>
            <h3 class="text-sm font-bold text-slate-900 mt-1">Archivo de Pagos Haberes BCP</h3>
            <p class="text-xs text-slate-500 mt-1">Archivo estructurado para subida en banca por internet para abono automático de sueldos.</p>
          </div>
          <button
            (click)="descargarBancos()"
            class="w-full h-9 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Generar Archivo Bancario</span>
          </button>
        </div>
      </div>

      <!-- Workers Boletas List -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Worker selector list -->
        <div class="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Colaboradores ({{ calcList().length }})</h3>
            <span class="text-[11px] text-slate-400">Clic para previsualizar</span>
          </div>

          <div class="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
            @for (item of calcList(); track item.trabajadorId) {
              <div
                (click)="selectedBoleta.set(item)"
                class="p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between"
                [ngClass]="selectedBoleta()?.trabajadorId === item.trabajadorId ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50 text-slate-700'"
              >
                <div>
                  <p class="font-bold text-xs truncate max-w-[170px]">{{ item.nombre }}</p>
                  <p class="text-[10px] text-slate-500 font-mono">DNI: {{ item.dni }} · S/ {{ item.netoPagar.toFixed(2) }}</p>
                </div>
                <button
                  type="button"
                  (click)="descargarBoletaIndividual(item); $event.stopPropagation()"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white transition-colors"
                  title="Descargar PDF"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>
            }
          </div>
        </div>

        <!-- Boleta Live Document Preview -->
        <div class="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          @if (selectedBoleta(); as boleta) {
            <div class="space-y-4">
              <div class="flex items-center justify-between pb-3.5 border-b border-slate-200">
                <div>
                  <h3 class="text-base font-bold text-slate-900">Vista Previa de Boleta de Pago</h3>
                  <p class="text-xs text-slate-500">Periodo Setiembre 2026 · Formato Oficial D.S. 001-98-TR</p>
                </div>
                <button
                  (click)="descargarBoletaIndividual(boleta)"
                  class="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Descargar PDF</span>
                </button>
              </div>

              <!-- Paper look container -->
              <div class="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4 text-xs">
                <!-- Header -->
                <div class="flex justify-between items-start border-b border-slate-200 pb-3">
                  <div>
                    <h4 class="font-extrabold text-sm text-slate-900">MINERA ANDINA S.A.</h4>
                    <p class="text-slate-500 text-[11px]">RUC: 20489123891 · Av. Javier Prado Este 456, San Isidro</p>
                  </div>
                  <div class="border border-slate-300 rounded px-3 py-1 bg-white text-right">
                    <span class="font-bold block text-[10px] text-slate-800">BOLETA DE PAGO</span>
                    <span class="text-slate-500 font-mono text-[10px]">2026-09</span>
                  </div>
                </div>

                <!-- Worker info -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span class="text-slate-400 text-[10px] block">Colaborador</span>
                    <span class="font-bold text-slate-800">{{ boleta.nombre }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 text-[10px] block">DNI</span>
                    <span class="font-bold text-slate-800 font-mono">{{ boleta.dni }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 text-[10px] block">Cargo</span>
                    <span class="font-bold text-slate-800">{{ boleta.cargo }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 text-[10px] block">Pensión</span>
                    <span class="font-bold text-slate-800">{{ boleta.afp }}</span>
                  </div>
                </div>

                <!-- Concepts Split Table -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <!-- Ingresos -->
                  <div class="border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <div class="bg-slate-100 px-3 py-1.5 font-bold text-slate-800 border-b border-slate-200 flex justify-between">
                      <span>Ingresos Computables</span>
                      <span>Importe</span>
                    </div>
                    <div class="p-3 space-y-2">
                      <div class="flex justify-between">
                        <span class="text-slate-600">0121 Básico Proporcional</span>
                        <span class="font-mono font-semibold">S/ {{ boleta.basicoProporcional.toFixed(2) }}</span>
                      </div>
                      @if (boleta.asigFamiliar > 0) {
                        <div class="flex justify-between">
                          <span class="text-slate-600">0201 Asignación Familiar</span>
                          <span class="font-mono font-semibold">S/ {{ boleta.asigFamiliar.toFixed(2) }}</span>
                        </div>
                      }
                      @if (boleta.sobretasaNocturna > 0) {
                        <div class="flex justify-between">
                          <span class="text-slate-600">0105 Sobretasa Nocturna</span>
                          <span class="font-mono font-semibold">S/ {{ boleta.sobretasaNocturna.toFixed(2) }}</span>
                        </div>
                      }
                    </div>
                    <div class="bg-slate-50 px-3 py-2 border-t border-slate-200 font-bold flex justify-between">
                      <span>Total Bruto</span>
                      <span class="font-mono">S/ {{ boleta.totalBruto.toFixed(2) }}</span>
                    </div>
                  </div>

                  <!-- Descuentos -->
                  <div class="border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <div class="bg-rose-50 px-3 py-1.5 font-bold text-rose-800 border-b border-rose-200 flex justify-between">
                      <span>Descuentos al Trabajador</span>
                      <span>Importe</span>
                    </div>
                    <div class="p-3 space-y-2">
                      <div class="flex justify-between">
                        <span class="text-slate-600">0605 Retención {{ boleta.afp }}</span>
                        <span class="font-mono font-semibold text-rose-600">-S/ {{ boleta.descuentoPension.toFixed(2) }}</span>
                      </div>
                      @if (boleta.descuentoFaltas > 0) {
                        <div class="flex justify-between">
                          <span class="text-slate-600">0701 Descuento Faltas</span>
                          <span class="font-mono font-semibold text-rose-600">-S/ {{ boleta.descuentoFaltas.toFixed(2) }}</span>
                        </div>
                      }
                      @if (boleta.renta5ta > 0) {
                        <div class="flex justify-between">
                          <span class="text-slate-600">0601 Renta 5ta Cat.</span>
                          <span class="font-mono font-semibold text-rose-600">-S/ {{ boleta.renta5ta.toFixed(2) }}</span>
                        </div>
                      }
                    </div>
                    <div class="bg-rose-50 px-3 py-2 border-t border-rose-200 font-bold text-rose-800 flex justify-between">
                      <span>Total Descuentos</span>
                      <span class="font-mono">-S/ {{ boleta.totalDescuentos.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Neto a pagar banner -->
                <div class="p-3.5 rounded-xl bg-sky-100/70 border border-sky-200 flex justify-between items-center text-sky-950 font-bold">
                  <span class="text-sm">NETO A PAGAR:</span>
                  <span class="font-mono text-base font-extrabold">S/ {{ boleta.netoPagar.toFixed(2) }}</span>
                </div>

                <!-- Aporte empleador -->
                <div class="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex justify-between">
                  <span>Aporte Empleador (EsSalud 9%):</span>
                  <span class="font-mono font-bold">S/ {{ boleta.aporteEsSalud.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class ReportesComponent {
  apiService = inject(ApiService);
  toastService = inject(ToastService);
  pdfService = inject(PdfService);
  excelService = inject(ExcelService);

  calcList = computed(() => {
    return this.apiService.workers().map(w => calcularPlanillaTrabajador(w));
  });

  selectedBoleta = signal<PlanillaItem | null>(null);

  constructor() {
    const list = this.calcList();
    if (list.length > 0) {
      this.selectedBoleta.set(list[0]);
    }
  }

  descargarLotePDF() {
    this.toastService.show('Generando lote completo de boletas en PDF...', 'info');
    this.pdfService.generarLoteBoletasPDF(this.calcList(), '2026-09');
  }

  descargarBoletaIndividual(item: PlanillaItem) {
    this.toastService.show(`Descargando boleta PDF para ${item.nombre}...`, 'info');
    this.pdfService.generarBoletaPDF(item, '2026-09');
  }

  descargarPlame() {
    this.toastService.show('Generando archivo SUNAT PLAME .rem...', 'info');
    this.excelService.exportarPlameRemTxt(this.calcList(), '2026-09');
  }

  descargarAfpNet() {
    this.toastService.show('Generando archivo de aportes AFP Net...', 'info');
    this.excelService.exportarAfpNetTxt(this.calcList(), '2026-09');
  }

  descargarBancos() {
    this.toastService.show('Generando archivo bancario Telecrédito BCP...', 'info');
    this.excelService.exportarDispersionBancariaTxt(this.calcList(), '2026-09');
  }
}

