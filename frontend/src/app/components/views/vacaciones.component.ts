import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { ExcelService } from '../../services/excel.service';
import { PdfService } from '../../services/pdf.service';
import { SolicitudVacacion } from '../../models/vacacion.model';
import { Trabajador } from '../../models/trabajador.model';
import { INITIAL_VACACIONES_REQUESTS, getVacationRecordForWorker, SEDES } from '../../data/mock-data';

@Component({
  selector: 'app-vacaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 class="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight flex items-center gap-2">
              <svg class="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Gestión de Vacaciones y Récord Laboral
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">
              Control legal de 30 días de descanso por año (D.L. 713 y D.L. 1405), saldos acumulados y convenios de venta.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button
              (click)="exportExcel()"
              class="h-9 px-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Exportar Excel</span>
            </button>
            <button
              (click)="showNewModal.set(true)"
              class="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Nueva Solicitud</span>
            </button>
          </div>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div class="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs text-center">
          <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Colaboradores en Goce</span>
          <p class="text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono mt-1">{{ kpis().enGoce }}</p>
          <span class="text-[10px] text-slate-400">descansando actualmente</span>
        </div>
        <div class="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs text-center">
          <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Saldo Pendiente Acumulado</span>
          <p class="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono mt-1">{{ kpis().totalSaldo }} d</p>
          <span class="text-[10px] text-slate-400">días por gozar en total</span>
        </div>
        <div class="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs text-center">
          <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Solicitudes Próximas</span>
          <p class="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono mt-1">{{ kpis().proximas }}</p>
          <span class="text-[10px] text-slate-400">programadas / aprobadas</span>
        </div>
        <div class="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs text-center">
          <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Alertas de Vencimiento</span>
          <p class="text-2xl sm:text-3xl font-extrabold text-rose-600 font-mono mt-1">{{ kpis().riesgo }}</p>
          <span class="text-[10px] text-slate-400">riesgo triple indemnización</span>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-3 gap-2">
        <button
          type="button"
          (click)="activeTab.set('record')"
          class="pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer"
          [ngClass]="activeTab() === 'record' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'"
        >
          Récord Vacacional Consolidado
        </button>
        <button
          type="button"
          (click)="activeTab() === 'solicitudes' ? null : activeTab.set('solicitudes')"
          class="pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer"
          [ngClass]="activeTab() === 'solicitudes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'"
        >
          Bandeja de Solicitudes ({{ requests().length }})
        </button>
        <button
          type="button"
          (click)="activeTab.set('venta')"
          class="pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer"
          [ngClass]="activeTab() === 'venta' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'"
        >
          Simulador de Venta de Vacaciones
        </button>
      </div>

      <!-- Tab Content 1: Récord Vacacional -->
      @if (activeTab() === 'record') {
        <div class="space-y-3">
          <!-- Filters -->
          <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row gap-2.5">
            <div class="relative flex-1">
              <svg class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                [(ngModel)]="searchRecord"
                placeholder="Buscar por colaborador o DNI..."
                class="w-full h-9 pl-9 pr-3 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Table -->
          <div class="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div class="overflow-x-auto pb-2">
              <table class="w-full min-w-[850px] text-xs text-left border-collapse">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th class="px-4 py-3">Colaborador</th>
                    <th class="px-3 py-3 text-center">F. Ingreso</th>
                    <th class="px-2 py-3 text-center">Años Serv.</th>
                    <th class="px-2 py-3 text-center">Ganados</th>
                    <th class="px-2 py-3 text-center">Gozados</th>
                    <th class="px-2 py-3 text-center">Vendidos</th>
                    <th class="px-3 py-3 text-center font-bold text-slate-900 bg-blue-50/50">Saldo Pendiente</th>
                    <th class="px-3 py-3 text-center">Estado Alerta</th>
                    <th class="px-3 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (w of filteredRecords(); track w.id) {
                    <tr class="hover:bg-slate-50 transition-colors">
                      <td class="px-4 py-2.5">
                        <p class="font-bold text-slate-900">{{ w.nombre }}</p>
                        <p class="text-[10px] text-slate-500">{{ w.cargo }} · DNI {{ w.dni }}</p>
                      </td>
                      <td class="px-3 py-2.5 text-center font-mono text-slate-600">{{ w.fechaIngreso }}</td>
                      <td class="px-2 py-2.5 text-center font-semibold text-slate-800">{{ w.record.aniosCompletos }} años</td>
                      <td class="px-2 py-2.5 text-center text-slate-700 font-mono">{{ w.record.diasGanados }} d</td>
                      <td class="px-2 py-2.5 text-center text-emerald-700 font-mono font-bold">{{ w.record.diasGozados }} d</td>
                      <td class="px-2 py-2.5 text-center text-indigo-700 font-mono">{{ w.record.diasVendidos }} d</td>
                      <td class="px-3 py-2.5 text-center font-bold text-blue-900 bg-blue-50/30 font-mono text-sm">
                        {{ w.record.saldoPendiente }} días
                      </td>
                      <td class="px-3 py-2.5 text-center">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border" [ngClass]="w.record.estadoCls">
                          {{ w.record.estadoRecord }}
                        </span>
                      </td>
                      <td class="px-3 py-2.5 text-center">
                        <button
                          (click)="openPapeleta(w)"
                          class="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 cursor-pointer"
                        >
                          Papeleta
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

      <!-- Tab Content 2: Bandeja de Solicitudes -->
      @if (activeTab() === 'solicitudes') {
        <div class="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div class="overflow-x-auto pb-2">
            <table class="w-full min-w-[800px] text-xs text-left border-collapse">
              <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th class="px-4 py-3">Código / Documento</th>
                  <th class="px-3 py-3">Colaborador</th>
                  <th class="px-3 py-3 text-center">Tipo</th>
                  <th class="px-3 py-3 text-center">Rango Fechas</th>
                  <th class="px-2 py-3 text-center">Días</th>
                  <th class="px-3 py-3 text-center">Estado</th>
                  <th class="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (req of requests(); track req.id) {
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-4 py-2.5 font-mono text-slate-700 font-bold">{{ req.documento }}</td>
                    <td class="px-3 py-2.5">
                      <p class="font-bold text-slate-900">{{ getWorkerName(req.trabajadorId) }}</p>
                      <p class="text-[10px] text-slate-400">Reg: {{ req.fechaRegistro }}</p>
                    </td>
                    <td class="px-3 py-2.5 text-center">
                      <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {{ req.tipo }}
                      </span>
                    </td>
                    <td class="px-3 py-2.5 text-center text-slate-600 font-mono text-[11px]">
                      {{ req.fechaInicio }} al {{ req.fechaFin }}
                    </td>
                    <td class="px-2 py-2.5 text-center font-bold font-mono text-slate-900">{{ req.dias }} d</td>
                    <td class="px-3 py-2.5 text-center">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        [ngClass]="{
                          'bg-emerald-50 text-emerald-700 border border-emerald-200': req.estado === 'Aprobada' || req.estado === 'En Goce',
                          'bg-amber-50 text-amber-700 border border-amber-200': req.estado === 'Pendiente' || req.estado === 'Programada',
                          'bg-slate-100 text-slate-600': req.estado === 'Finalizada'
                        }">
                        {{ req.estado }}
                      </span>
                    </td>
                    <td class="px-4 py-2.5 text-center">
                      @if (req.estado === 'Pendiente') {
                        <div class="flex items-center justify-center gap-1.5">
                          <button
                            (click)="approveRequest(req.id)"
                            class="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold cursor-pointer"
                          >
                            Aprobar
                          </button>
                        </div>
                      } @else {
                        <span class="text-slate-400 text-[11px]">Procesada</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Tab Content 3: Simulador de Venta -->
      @if (activeTab() === 'venta') {
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-2xl mx-auto space-y-4">
          <div>
            <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Convenio de Reducción Vacacional (Venta de Vacaciones)
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              Conforme al D.L. 713 y D.L. 1405, el colaborador puede acordar la venta de hasta 15 días compensados en nómina.
            </p>
          </div>

          <div class="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Seleccionar Colaborador</label>
              <select [(ngModel)]="simWorkerId" class="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg bg-white">
                @for (w of apiService.workers(); track w.id) {
                  <option [value]="w.id">{{ w.nombre }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Días a Vender (Máx. 15)</label>
              <input
                type="number"
                min="1"
                max="15"
                [(ngModel)]="simDiasVenta"
                class="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <!-- Simulation Result Box -->
          @if (simulatedWorker(); as sw) {
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div class="flex justify-between">
                <span class="text-slate-600">Sueldo Básico:</span>
                <span class="font-bold font-mono">S/ {{ sw.sueldoBase.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Valor Día Ordinario (Básico / 30):</span>
                <span class="font-bold font-mono">S/ {{ (sw.sueldoBase / 30).toFixed(2) }}</span>
              </div>
              <div class="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-emerald-800">
                <span>Compensación Bruta por {{ simDiasVenta }} días:</span>
                <span class="font-mono">S/ {{ ((sw.sueldoBase / 30) * simDiasVenta).toFixed(2) }}</span>
              </div>
            </div>

            <button
              type="button"
              (click)="registrarVenta(sw)"
              class="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Generar Convenio de Venta y Aplicar
            </button>
          }
        </div>
      }

      <!-- Papeleta Modal Documento Formal - Estilo White con Bordes Circulares y Firmas Profesionales -->
      @if (papeletaWorker(); as pw) {
        <div class="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div class="bg-white shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh] rounded-3xl">
            <!-- Action Bar Superior (Estilo White Circular) -->
            <div class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 flex-shrink-0 rounded-t-3xl">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-xs sm:text-sm font-bold tracking-tight text-slate-900">Papeleta de Autorización Vacacional</h3>
                  <p class="text-[10px] text-slate-500 font-medium">Documento Oficial · D.L. N° 713 & D.L. N° 1405</p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button
                  (click)="descargarPapeletaPDF(pw)"
                  class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:shadow-sm"
                  title="Descargar documento en formato PDF"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Descargar PDF</span>
                </button>

                <button
                  (click)="imprimirPapeleta(pw)"
                  class="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200 shadow-xs"
                  title="Imprimir documento oficial"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span class="hidden sm:inline">Imprimir</span>
                </button>

                <button
                  (click)="papeletaWorker.set(null)"
                  class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer rounded-xl ml-1"
                  title="Cerrar vista"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Cuerpo del Documento (Hoja Formal con Bordes Circulares) -->
            <div class="p-6 sm:p-8 overflow-y-auto space-y-5 bg-white text-slate-800">
              <!-- Encabezado Membretado Oficial -->
              <div class="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b-2 border-slate-900 gap-4">
                <div class="flex items-center gap-3">
                  <img src="/logo.png" alt="Logo" class="h-10 w-auto object-contain" />
                  <div>
                    <h2 class="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                      {{ apiService.activeEmpresa().nombre || 'NOMINI ENTERPRISE S.A.C.' }}
                    </h2>
                    <p class="text-[11px] text-slate-600 font-medium">
                      R.U.C. {{ apiService.activeEmpresa().ruc || '20608912341' }} · Régimen Laboral Privado D.L. 728
                    </p>
                    <p class="text-[10px] text-slate-400">
                      Sede Central Administrativa · San Isidro, Lima - Perú
                    </p>
                  </div>
                </div>

                <div class="border-2 border-slate-900 bg-white px-4 py-2.5 text-center flex-shrink-0 rounded-2xl shadow-xs">
                  <span class="text-[10px] font-bold tracking-widest text-slate-500 uppercase block">PAPELETA DE VACACIONES</span>
                  <span class="text-xs sm:text-sm font-black font-mono text-slate-900 block mt-0.5">
                    N° PAP-VAC-2026-{{ getPapeletaCodigo(pw.id) }}
                  </span>
                  <span class="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 border border-emerald-200 mt-1 inline-block rounded-full">
                    AUTORIZADA / CONFORME
                  </span>
                </div>
              </div>

              <!-- Título Central -->
              <div class="text-center pt-1 pb-1">
                <h1 class="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                  Papeleta de Autorización y Goce Vacacional
                </h1>
                <p class="text-[11px] text-slate-500 font-medium mt-0.5">
                  Conforme al Decreto Legislativo N° 713, D.L. N° 1405 y su Reglamento D.S. N° 012-92-TR
                </p>
              </div>

              <!-- Sección 1: Datos del Colaborador (Circular) -->
              <div class="border border-slate-200 overflow-hidden text-xs rounded-2xl shadow-xs">
                <div class="bg-slate-50/90 px-4 py-2 border-b border-slate-200 font-bold text-[11px] text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>I. Datos Generales del Colaborador</span>
                  <span class="text-[10px] text-slate-500 font-medium font-mono">DNI / CE: {{ pw.dni }}</span>
                </div>
                <div class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 bg-white">
                  <div>
                    <span class="text-[11px] text-slate-500 font-semibold block">Apellidos y Nombres:</span>
                    <span class="font-bold text-slate-900 text-xs sm:text-sm">{{ pw.nombre }}</span>
                  </div>
                  <div>
                    <span class="text-[11px] text-slate-500 font-semibold block">Cargo / Puesto:</span>
                    <span class="font-bold text-slate-800">{{ pw.cargo || 'Colaborador Regular' }}</span>
                  </div>
                  <div>
                    <span class="text-[11px] text-slate-500 font-semibold block">Fecha de Ingreso:</span>
                    <span class="font-mono text-slate-800 font-semibold">{{ pw.fechaIngreso || '01/01/2023' }}</span>
                  </div>
                  <div>
                    <span class="text-[11px] text-slate-500 font-semibold block">Sede / Centro de Labores:</span>
                    <span class="text-slate-800 font-medium">Sede Central - San Isidro</span>
                  </div>
                </div>
              </div>

              <!-- Sección 2: Detalle de la Salida Vacacional (Circular) -->
              <div class="border border-slate-200 overflow-hidden text-xs rounded-2xl shadow-xs">
                <div class="bg-slate-50/90 px-4 py-2 border-b border-slate-200 font-bold text-[11px] text-slate-700 uppercase tracking-wider">
                  II. Programación del Descanso y Récord Laboral
                </div>
                <div class="p-4 space-y-3.5 bg-white">
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div class="p-3 border border-slate-200 bg-slate-50/60 rounded-xl">
                      <span class="text-[10px] text-slate-500 font-bold uppercase block">Periodo Adquisitivo</span>
                      <span class="text-xs font-bold font-mono text-slate-800 block mt-0.5">{{ pw.record.periodoActual }}</span>
                    </div>
                    <div class="p-3 border border-slate-200 bg-slate-50/60 rounded-xl">
                      <span class="text-[10px] text-slate-500 font-bold uppercase block">Derecho Legal Anual</span>
                      <span class="text-xs font-bold font-mono text-slate-800 block mt-0.5">30 Días</span>
                    </div>
                    <div class="p-3 border border-blue-200 bg-blue-50/60 rounded-xl">
                      <span class="text-[10px] text-blue-700 font-bold uppercase block">Saldo Previo Acumulado</span>
                      <span class="text-xs font-extrabold font-mono text-blue-900 block mt-0.5">{{ pw.record.saldoPendiente }} Días</span>
                    </div>
                    <div class="p-3 border border-emerald-200 bg-emerald-50/60 rounded-xl">
                      <span class="text-[10px] text-emerald-700 font-bold uppercase block">Días Autorizados</span>
                      <span class="text-xs font-black font-mono text-emerald-900 block mt-0.5">15 Días</span>
                    </div>
                  </div>

                  <!-- Fechas de Goce -->
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div class="p-3 border border-slate-200 bg-slate-50/60 rounded-xl">
                      <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Fecha Inicio de Goce</span>
                      <div class="flex items-center gap-1.5 mt-1 font-mono font-bold text-slate-900 text-xs">
                        <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>15 / 09 / 2026</span>
                      </div>
                    </div>

                    <div class="p-3 border border-slate-200 bg-slate-50/60 rounded-xl">
                      <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Fecha Término de Goce</span>
                      <div class="flex items-center gap-1.5 mt-1 font-mono font-bold text-slate-900 text-xs">
                        <svg class="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>29 / 09 / 2026</span>
                      </div>
                    </div>

                    <div class="p-3 border border-emerald-200 bg-emerald-50/60 rounded-xl">
                      <span class="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Reincorporación Efectiva</span>
                      <div class="flex items-center gap-1.5 mt-1 font-mono font-black text-emerald-900 text-xs">
                        <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>30 / 09 / 2026</span>
                      </div>
                    </div>
                  </div>

                  <!-- Resumen saldo restante -->
                  <div class="flex items-center justify-between p-3 border border-sky-200 bg-sky-50/70 text-sky-950 text-[11px] font-medium rounded-xl">
                    <span>Saldo de vacaciones restante post-goce:</span>
                    <span class="font-mono font-extrabold text-xs text-sky-950">{{ pw.record.saldoPendiente > 15 ? pw.record.saldoPendiente - 15 : 0 }} días pendientes</span>
                  </div>
                </div>
              </div>

              <!-- Sección 3: Compromiso Legal y Declaración Jurada (Circular) -->
              <div class="p-3.5 border border-slate-200 bg-slate-50/70 text-[11px] text-slate-600 leading-relaxed text-justify rounded-2xl">
                <p>
                  <strong>Declaración Jurada y Base Legal:</strong> Las partes suscribientes dejan constancia que la presente programación de vacaciones se efectúa de mutuo acuerdo conforme a lo estipulado en el <strong>Decreto Legislativo N° 713</strong> y el <strong>Decreto Legislativo N° 1405</strong> que regula el fraccionamiento del descanso vacacional. El colaborador se compromete formalmente a reincorporarse a sus labores habituales en la fecha indicada, declarando bajo juramento que no prestará servicios remunerados para terceros durante el período vacacional concedido.
                </p>
              </div>

              <!-- Sección 4: Bloque Profesional de Firmas, Sellos y Huella Digital -->
              <div class="pt-2">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5 text-center">
                  Constancia de Recepción y Conformidad de las Partes
                </span>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <!-- Firma 1: Trabajador con Huella Digital y Rúbrica Realista -->
                  <div class="border border-slate-200 p-3.5 flex flex-col justify-between items-center text-center bg-white min-h-[145px] rounded-2xl shadow-xs hover:border-slate-300 transition-all">
                    <!-- Huella y Rúbrica Manuscrita -->
                    <div class="flex items-center justify-center gap-2 w-full pt-1 pb-1">
                      <!-- Huella DNI estilizada -->
                      <div class="flex flex-col items-center">
                        <svg viewBox="0 0 24 24" class="w-8 h-8 text-blue-600/70" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M12 2a9 9 0 0 0-9 9c0 3.2 1.6 6 4 7.7" />
                          <path d="M12 6a5 5 0 0 0-5 5c0 4.1 2.5 7.6 6.1 9" />
                          <path d="M12 10a1 1 0 0 0-1 1c0 3 1.5 5.5 3.8 6.9" />
                          <path d="M15 11c0-1.7-1.3-3-3-3" />
                          <path d="M18 11a6 6 0 0 0-6-6" />
                          <path d="M21 11a9 9 0 0 0-9-9" />
                        </svg>
                        <span class="text-[7.5px] font-mono text-slate-400 font-medium">HUELLA DNI</span>
                      </div>
                      <!-- Trazo Manuscrito Firma Colaborador -->
                      <div class="flex flex-col items-center">
                        <svg viewBox="0 0 150 48" class="h-10 w-28 text-blue-800 fill-none stroke-current" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M 10 32 C 18 12, 26 8, 34 26 C 40 34, 46 36, 52 20 C 58 6, 68 18, 74 28 C 80 34, 88 15, 96 22 C 104 28, 114 30, 124 18 C 130 8, 140 16, 146 14" />
                          <path d="M 20 28 C 45 26, 85 24, 138 22" stroke-width="1.5" />
                          <path d="M 58 36 C 85 38, 118 36, 142 32" stroke-width="1.2" />
                        </svg>
                        <span class="inline-flex items-center gap-1 text-[7.5px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                          <span class="w-1 h-1 rounded-full bg-emerald-600"></span> Firmado ID Digital
                        </span>
                      </div>
                    </div>
                    <!-- Datos Colaborador -->
                    <div class="w-full pt-2 border-t border-slate-200 mt-1">
                      <p class="font-bold text-slate-900 text-[11px] leading-tight truncate">{{ pw.nombre }}</p>
                      <p class="text-[10px] text-slate-500 font-mono">DNI: {{ pw.dni }}</p>
                      <p class="text-[9px] font-semibold text-slate-400 uppercase mt-0.5">Firma del Colaborador</p>
                    </div>
                  </div>

                  <!-- Firma 2: V°B° Jefatura Inmediata con Sello Institucional y Rúbrica -->
                  <div class="border border-slate-200 p-3.5 flex flex-col justify-between items-center text-center bg-white min-h-[145px] rounded-2xl shadow-xs hover:border-slate-300 transition-all">
                    <!-- Sello de Caucho Oficial Jefatura con Rúbrica Superpuesta -->
                    <div class="relative flex items-center justify-center w-full h-12 pt-1">
                      <div class="border-2 border-dashed border-blue-600/70 rounded-xl px-2.5 py-1 text-center -rotate-2 bg-blue-50/60 shadow-xs">
                        <span class="text-[7.5px] font-black tracking-widest text-blue-800 uppercase block">JEFATURA DE OPERACIONES</span>
                        <span class="text-[10px] font-black text-blue-700 tracking-wider block">★ AUTORIZADO ★</span>
                        <span class="text-[7px] font-mono text-blue-600 font-semibold block">12/09/2026 · REF: JEF-0419</span>
                      </div>
                      <!-- Trazo Manuscrito Ejecutivo Cruzado -->
                      <svg viewBox="0 0 150 48" class="absolute inset-0 m-auto h-11 w-32 text-blue-900 fill-none stroke-current opacity-90 pointer-events-none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M 12 28 C 24 10, 36 6, 46 24 C 52 34, 60 12, 70 18 C 82 24, 94 12, 104 16 C 114 20, 126 28, 140 14" />
                        <path d="M 20 24 Q 68 14 132 18" stroke-width="1.5" />
                        <path d="M 70 34 C 90 36, 118 34, 136 28" stroke-width="1.2" />
                      </svg>
                    </div>
                    <!-- Datos Jefatura -->
                    <div class="w-full pt-2 border-t border-slate-200 mt-1">
                      <p class="font-bold text-slate-900 text-[11px] leading-tight">Ing. Roberto Seminario V.</p>
                      <p class="text-[10px] text-slate-500">Jefe de Operaciones y Planta</p>
                      <p class="text-[9px] font-semibold text-slate-400 uppercase mt-0.5">Sello y Firma V°B° Jefatura</p>
                    </div>
                  </div>

                  <!-- Firma 3: V°B° Recursos Humanos con Sello de Nómina y Rúbrica -->
                  <div class="border border-slate-200 p-3.5 flex flex-col justify-between items-center text-center bg-white min-h-[145px] rounded-2xl shadow-xs hover:border-slate-300 transition-all">
                    <!-- Sello Oficial Recursos Humanos y Nómina -->
                    <div class="relative flex items-center justify-center w-full h-12 pt-1">
                      <div class="border-2 border-emerald-600/70 rounded-xl px-2.5 py-1 text-center rotate-2 bg-emerald-50/60 shadow-xs">
                        <div class="flex items-center justify-center gap-1">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          <span class="text-[7.5px] font-black tracking-widest text-emerald-800 uppercase">GESTIÓN DEL TALENTO</span>
                        </div>
                        <span class="text-[10px] font-black text-emerald-700 tracking-wider block">★ REGISTRADO · NÓMINA ★</span>
                        <span class="text-[7px] font-mono text-emerald-600 font-semibold block">CONFORME D.L. 713 / 1405</span>
                      </div>
                      <!-- Trazo Manuscrito Caligráfico RRHH -->
                      <svg viewBox="0 0 150 48" class="absolute inset-0 m-auto h-11 w-32 text-emerald-950 fill-none stroke-current opacity-90 pointer-events-none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M 14 30 C 20 8, 32 14, 42 32 C 48 18, 60 8, 72 22 C 84 30, 98 14, 110 20 C 122 24, 132 12, 144 16" />
                        <path d="M 28 32 C 58 28, 98 22, 132 20" stroke-width="1.5" />
                        <path d="M 76 38 Q 106 36, 138 30" stroke-width="1.2" />
                      </svg>
                    </div>
                    <!-- Datos RR.HH. -->
                    <div class="w-full pt-2 border-t border-slate-200 mt-1">
                      <p class="font-bold text-slate-900 text-[11px] leading-tight">Lic. Carmen Del Prado M.</p>
                      <p class="text-[10px] text-slate-500">Gestión del Talento y Nóminas</p>
                      <p class="text-[9px] font-semibold text-slate-400 uppercase mt-0.5">Recursos Humanos · Registro</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer oficial -->
              <div class="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 gap-1.5">
                <span>Copia 1: Colaborador · Copia 2: Legajo Personal RR.HH. · Copia 3: Control Asistencia</span>
                <span class="font-mono">Sistema NOMINI Enterprise · {{ apiService.lastUpdate() }}</span>
              </div>
            </div>

            <!-- Footer con Botones del Modal (Estilo White Circular) -->
            <div class="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0 rounded-b-3xl">
              <span class="text-xs text-slate-500 font-medium text-center sm:text-left">
                Documento legalmente válido para sustentación laboral ante SUNAFIL.
              </span>

              <div class="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  (click)="papeletaWorker.set(null)"
                  class="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 cursor-pointer transition-colors shadow-xs"
                >
                  Cerrar
                </button>
                <button
                  (click)="descargarPapeletaPDF(pw)"
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer transition-all shadow-xs hover:shadow-sm flex items-center gap-1.5"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Descargar Papeleta Oficial PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Nueva Solicitud Modal -->
      @if (showNewModal()) {
        <div class="fixed inset-0 z-[60] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in duration-150">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 class="text-base font-bold text-slate-900">Registrar Solicitud de Vacaciones</h3>
              <button (click)="showNewModal.set(false)" class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form (ngSubmit)="handleCreateRequest()" class="space-y-3 text-xs">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Colaborador</label>
                <select [(ngModel)]="newReqWorkerId" name="workerId" class="w-full h-9 px-3 border border-slate-200 rounded-lg bg-white">
                  @for (w of apiService.workers(); track w.id) {
                    <option [value]="w.id">{{ w.nombre }}</option>
                  }
                </select>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Fecha Inicio</label>
                  <input type="date" [(ngModel)]="newReqInicio" name="inicio" class="w-full h-9 px-3 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Fecha Fin</label>
                  <input type="date" [(ngModel)]="newReqFin" name="fin" class="w-full h-9 px-3 border border-slate-200 rounded-lg" />
                </div>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Días Solicitados</label>
                <input type="number" [(ngModel)]="newReqDias" name="dias" min="1" max="30" class="w-full h-9 px-3 border border-slate-200 rounded-lg" />
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Tipo de Solicitud</label>
                <select [(ngModel)]="newReqTipo" name="tipo" class="w-full h-9 px-3 border border-slate-200 rounded-lg bg-white">
                  <option value="Goce Regular">Goce Regular (15 o 30 días)</option>
                  <option value="Fraccionamiento (D.L. 1405)">Fraccionamiento (D.L. 1405)</option>
                  <option value="Venta de Vacaciones">Venta de Vacaciones</option>
                </select>
              </div>

              <div class="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" (click)="showNewModal.set(false)" class="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl cursor-pointer">
                  Registrar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class VacacionesComponent {
  apiService = inject(ApiService);
  toastService = inject(ToastService);
  excelService = inject(ExcelService);
  pdfService = inject(PdfService);

  activeTab = signal<'record' | 'solicitudes' | 'venta'>('record');
  requests = signal<SolicitudVacacion[]>(INITIAL_VACACIONES_REQUESTS);
  searchRecord = '';

  showNewModal = signal<boolean>(false);
  papeletaWorker = signal<any | null>(null);

  simWorkerId = 1;
  simDiasVenta = 15;

  newReqWorkerId = 1;
  newReqInicio = '2026-09-15';
  newReqFin = '2026-09-30';
  newReqDias = 15;
  newReqTipo = 'Goce Regular';

  workersWithRecord = computed(() => {
    return this.apiService.workers().map(w => ({
      ...w,
      record: getVacationRecordForWorker(w, this.requests())
    }));
  });

  filteredRecords = computed(() => {
    const s = this.searchRecord.toLowerCase();
    return this.workersWithRecord().filter(w => !s || w.nombre.toLowerCase().includes(s) || w.dni.includes(s));
  });

  kpis = computed(() => {
    const list = this.workersWithRecord();
    const reqs = this.requests();
    const enGoce = list.filter(w => w.estado === 'Vacaciones' || reqs.some(r => r.trabajadorId === w.id && r.estado === 'En Goce')).length;
    const totalSaldo = list.reduce((sum, w) => sum + w.record.saldoPendiente, 0);
    const proximas = reqs.filter(r => r.estado === 'Programada' || r.estado === 'Aprobada').length;
    const riesgo = list.filter(w => w.record.estadoRecord.includes('Riesgo')).length;
    return { enGoce, totalSaldo, proximas, riesgo };
  });

  simulatedWorker = computed(() => {
    return this.apiService.workers().find(w => w.id === Number(this.simWorkerId));
  });

  getWorkerName(id: number): string {
    return this.apiService.workers().find(w => w.id === id)?.nombre || 'Colaborador';
  }

  approveRequest(reqId: string) {
    this.requests.update(list => list.map(r => r.id === reqId ? { ...r, estado: 'Aprobada' } : r));
    this.toastService.show('Solicitud vacacional aprobada satisfactoriamente', 'success');
  }

  registrarVenta(worker: Trabajador) {
    const newReq: SolicitudVacacion = {
      id: `VAC-${Date.now()}`,
      trabajadorId: worker.id,
      fechaInicio: '2026-09-01',
      fechaFin: '2026-09-15',
      dias: this.simDiasVenta,
      tipo: 'Venta de Vacaciones',
      periodo: '2024-2025',
      estado: 'Aprobada',
      documento: `CONV-RED-${Date.now().toString().slice(-4)}`,
      observaciones: `Convenio de reducción de ${this.simDiasVenta} días acordado en nómina.`,
      aprobadoPor: 'Carlos Mendoza (Admin)',
      fechaRegistro: new Date().toISOString().split('T')[0]
    };
    this.requests.update(list => [newReq, ...list]);
    this.toastService.show(`Convenio de venta por ${this.simDiasVenta} días aplicado para ${worker.nombre}`, 'success');
  }

  exportExcel() {
    this.toastService.show('Exportando récord vacacional consolidado a Excel...', 'info');
    this.excelService.exportarRecordVacacionalExcel(this.workersWithRecord());
  }

  getPapeletaCodigo(id: any): string {
    return String(id || 1).padStart(4, '0');
  }

  openPapeleta(workerWithRecord: any) {
    this.papeletaWorker.set(workerWithRecord);
  }

  descargarPapeletaPDF(pw: any) {
    this.toastService.show(`Descargando papeleta oficial en PDF para ${pw.nombre}...`, 'success');
    this.pdfService.generarPapeletaVacacionesPDF(pw, this.apiService.activeEmpresa().nombre, this.apiService.activeEmpresa().ruc);
  }

  imprimirPapeleta(pw: any) {
    this.toastService.show(`Generando papeleta oficial en PDF para ${pw.nombre}...`, 'success');
    this.pdfService.generarPapeletaVacacionesPDF(pw, this.apiService.activeEmpresa().nombre, this.apiService.activeEmpresa().ruc);
  }

  handleCreateRequest() {
    const newReq: SolicitudVacacion = {
      id: `VAC-${Date.now()}`,
      trabajadorId: Number(this.newReqWorkerId),
      fechaInicio: this.newReqInicio,
      fechaFin: this.newReqFin,
      dias: Number(this.newReqDias),
      tipo: this.newReqTipo,
      periodo: '2024-2025',
      estado: 'Pendiente',
      documento: `SOL-VAC-${Date.now().toString().slice(-3)}`,
      observaciones: 'Registrado desde panel Angular',
      aprobadoPor: null,
      fechaRegistro: new Date().toISOString().split('T')[0]
    };

    this.requests.update(list => [newReq, ...list]);
    this.showNewModal.set(false);
    this.toastService.show('Solicitud vacacional registrada con éxito', 'success');
  }
}

