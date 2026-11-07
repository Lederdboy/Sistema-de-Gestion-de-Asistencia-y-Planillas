import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';
import { SEDES, AFPS, PARAMETROS_LABORALES } from '../../../data/mock-data';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5 w-full">
      <!-- HEADER PRINCIPAL -->
      <div class="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0 border border-blue-100">
            <svg class="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-semibold uppercase tracking-wider text-blue-600">Configuración Corporativa</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Ejercicio 2026
              </span>
            </div>
            <h1 class="text-xl font-bold text-slate-900 tracking-tight">
              Configuración del Sistema & Parámetros Laborales
            </h1>
            <p class="text-xs text-slate-500 mt-0.5">
              Valores legales vigentes en el Perú (MINTRA / SUNAT), datos fiscales, comisiones SBS y sedes de operación.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            (click)="resetDefaults()"
            class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
            title="Restablecer a valores legales oficiales 2026"
          >
            <svg class="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            <span>Restablecer</span>
          </button>

          <button
            type="button"
            (click)="saveConfig()"
            class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
            </svg>
            <span>Guardar Cambios</span>
          </button>
        </div>
      </div>

      <!-- TABS DE NAVEGACIÓN -->
      <div class="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          (click)="activeTab.set('parametros')"
          [ngClass]="{
            'bg-blue-600 text-white shadow-xs': activeTab() === 'parametros',
            'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200': activeTab() !== 'parametros'
          }"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
          </svg>
          <span>Parámetros de Ley Perú</span>
        </button>

        <button
          type="button"
          (click)="activeTab.set('empresa')"
          [ngClass]="{
            'bg-blue-600 text-white shadow-xs': activeTab() === 'empresa',
            'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200': activeTab() !== 'empresa'
          }"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
          </svg>
          <span>Empresa Empleadora</span>
        </button>

        <button
          type="button"
          (click)="activeTab.set('afps')"
          [ngClass]="{
            'bg-blue-600 text-white shadow-xs': activeTab() === 'afps',
            'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200': activeTab() !== 'afps'
          }"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
          </svg>
          <span>Comisiones AFP / ONP</span>
        </button>

        <button
          type="button"
          (click)="activeTab.set('sedes')"
          [ngClass]="{
            'bg-blue-600 text-white shadow-xs': activeTab() === 'sedes',
            'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200': activeTab() !== 'sedes'
          }"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span>Sedes y Sucursales</span>
        </button>

        <button
          type="button"
          (click)="activeTab.set('conexion')"
          [ngClass]="{
            'bg-blue-600 text-white shadow-xs': activeTab() === 'conexion',
            'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200': activeTab() !== 'conexion'
          }"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
          </svg>
          <span>Conexión & Puertos</span>
        </button>
      </div>

      <!-- GRID PRINCIPAL DE CONTENIDO (2 Columnas Formulario + 1 Columna Auditoría) -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <!-- ÁREA PRINCIPAL (2 COLUMNAS) -->
        <div class="xl:col-span-2 space-y-5">
          <!-- TAB 1: PARÁMETROS LABORALES -->
          @if (activeTab() === 'parametros') {
            <div class="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 class="text-base font-bold text-slate-900">Variables Legales y Previsionales (Ejercicio Fiscal 2026)</h3>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Estos importes rigen las fórmulas automáticas de boleta, gratificaciones, CTS, retenciones y liquidaciones.
                  </p>
                </div>
                <span class="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                  SUNAT / MTPE
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <!-- RMV -->
                <div class="space-y-1">
                  <label class="block font-semibold text-slate-700">Remuneración Mínima Vital (RMV)</label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">S/</span>
                    <input
                      type="number"
                      step="0.01"
                      [(ngModel)]="laboral.rmv"
                      (ngModelChange)="onRmvChange()"
                      class="w-full h-10 pl-8 pr-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono text-slate-900 font-medium"
                    />
                  </div>
                  <span class="text-[10px] text-slate-400 block">D.S. N° 003-2022-TR vigente en Perú</span>
                </div>

                <!-- Asignación Familiar -->
                <div class="space-y-1">
                  <label class="block font-semibold text-slate-700">Asignación Familiar (10% de la RMV)</label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">S/</span>
                    <input
                      type="number"
                      step="0.01"
                      [(ngModel)]="laboral.asigFamiliar"
                      class="w-full h-10 pl-8 pr-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono text-slate-900 font-medium"
                    />
                  </div>
                  <span class="text-[10px] text-slate-400 block">Ley 25129: Aplica para colaboradores con carga familiar</span>
                </div>

                <!-- UIT -->
                <div class="space-y-1">
                  <label class="block font-semibold text-slate-700">Unidad Impositiva Tributaria (UIT)</label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">S/</span>
                    <input
                      type="number"
                      step="1"
                      [(ngModel)]="laboral.uit"
                      class="w-full h-10 pl-8 pr-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono text-slate-900 font-medium"
                    />
                  </div>
                  <span class="text-[10px] text-slate-400 block">Valor de referencia SUNAT para deducción de 5ta categoría</span>
                </div>

                <!-- EsSalud -->
                <div class="space-y-1">
                  <label class="block font-semibold text-slate-700">Aporte de Salud Empleador (EsSalud)</label>
                  <div class="relative">
                    <input
                      type="number"
                      step="0.1"
                      [(ngModel)]="laboral.essalud"
                      class="w-full h-10 px-3 pr-8 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono text-slate-900 font-medium"
                    />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">%</span>
                  </div>
                  <span class="text-[10px] text-slate-400 block">Tasa legal obligatoria: 9.00% a cargo del empleador</span>
                </div>

                <!-- SCTR -->
                <div class="space-y-1">
                  <label class="block font-semibold text-slate-700">Seguro Complementario Trabajo de Riesgo (SCTR)</label>
                  <div class="relative">
                    <input
                      type="number"
                      step="0.01"
                      [(ngModel)]="laboral.sctr"
                      class="w-full h-10 px-3 pr-8 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono text-slate-900 font-medium"
                    />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">%</span>
                  </div>
                  <span class="text-[10px] text-slate-400 block">Tasa promedio sector minero, manufactura e industrial</span>
                </div>

                <!-- Jornada Horas -->
                <div class="space-y-1">
                  <label class="block font-semibold text-slate-700">Jornada Ordinaria Diaria</label>
                  <div class="relative">
                    <input
                      type="number"
                      step="1"
                      [(ngModel)]="laboral.jornadaHoras"
                      class="w-full h-10 px-3 pr-12 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono text-slate-900 font-medium"
                    />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Horas</span>
                  </div>
                  <span class="text-[10px] text-slate-400 block">Constitución: Máximo 8 horas diarias o 48 semanales</span>
                </div>
              </div>

              <!-- Tasas Adicionales de Horas Extras y Trabajo Nocturno -->
              <div class="pt-4 border-t border-slate-100">
                <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Sobretasas y Recargos de Ley</h4>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span class="text-[11px] font-semibold text-slate-600 block">Primeras 2 Horas Extras</span>
                    <span class="text-base font-extrabold font-mono text-blue-600 mt-0.5 block">+25%</span>
                    <span class="text-[10px] text-slate-400">D.L. 854 Art. 10</span>
                  </div>
                  <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span class="text-[11px] font-semibold text-slate-600 block">A partir de la 3ra Hora Extra</span>
                    <span class="text-base font-extrabold font-mono text-indigo-600 mt-0.5 block">+35%</span>
                    <span class="text-[10px] text-slate-400">Tasa legal acumulable</span>
                  </div>
                  <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span class="text-[11px] font-semibold text-slate-600 block">Sobretasa Nocturna (22:00 a 06:00)</span>
                    <span class="text-base font-extrabold font-mono text-amber-600 mt-0.5 block">+35%</span>
                    <span class="text-[10px] text-slate-400">Mínimo RMV + 35%</span>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- TAB 2: DATOS DE LA EMPRESA -->
          @if (activeTab() === 'empresa') {
            <div class="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 class="text-base font-bold text-slate-900">Identificación Fiscal y Razón Social</h3>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Información corporativa que figura en boletas de pago, contratos, convenios y reportes SUNAT.
                  </p>
                </div>
                <span class="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  RUC Activo y Habido
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div class="sm:col-span-2 space-y-1">
                  <label class="block font-semibold text-slate-700">Razón Social *</label>
                  <input
                    type="text"
                    [(ngModel)]="empresa.nombre"
                    class="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                  />
                </div>

                <div class="space-y-1">
                  <label class="block font-semibold text-slate-700">RUC (11 Dígitos) *</label>
                  <input
                    type="text"
                    [(ngModel)]="empresa.ruc"
                    class="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono font-medium text-slate-900"
                  />
                </div>

                <div class="space-y-1">
                  <label class="block font-semibold text-slate-700">Representante Legal *</label>
                  <input
                    type="text"
                    [(ngModel)]="empresa.representante"
                    class="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                  />
                </div>

                <div class="sm:col-span-2 space-y-1">
                  <label class="block font-semibold text-slate-700">Dirección Fiscal Principal *</label>
                  <input
                    type="text"
                    [(ngModel)]="empresa.direccion"
                    class="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                  />
                </div>

                <div class="sm:col-span-2 space-y-1">
                  <label class="block font-semibold text-slate-700">Actividad Económica Principal (CIIU)</label>
                  <input
                    type="text"
                    [(ngModel)]="empresa.actividad"
                    class="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-900"
                  />
                </div>
              </div>
            </div>
          }

          <!-- TAB 3: COMISIONES AFP / ONP -->
          @if (activeTab() === 'afps') {
            <div class="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 class="text-base font-bold text-slate-900">Comisiones y Primas AFP / ONP (SBS)</h3>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Tablas oficiales vigentes publicadas por la Superintendencia de Banca, Seguros y AFP.
                  </p>
                </div>
                <span class="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
                  SBS Actualizado
                </span>
              </div>

              <div class="overflow-hidden rounded-xl border border-slate-200">
                <table class="w-full text-left text-xs border-collapse">
                  <thead class="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    <tr>
                      <th class="px-4 py-3">Administradora</th>
                      <th class="px-3 py-3 text-right">Aporte Obligatorio</th>
                      <th class="px-3 py-3 text-right">Comisión Flujo</th>
                      <th class="px-3 py-3 text-right">Prima Seguro</th>
                      <th class="px-4 py-3 text-right text-blue-700">Retención Total</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (a of afpsList; track a.id) {
                      <tr class="hover:bg-slate-50/70 transition-colors">
                        <td class="px-4 py-3 font-bold text-slate-900 flex items-center gap-2">
                          <span class="w-2 h-2 rounded-full" [ngClass]="a.id === 'onp' ? 'bg-amber-500' : 'bg-blue-600'"></span>
                          <span>{{ a.nombre }}</span>
                        </td>
                        <td class="px-3 py-3 text-right font-mono text-slate-700">
                          {{ (a.aporte * 100).toFixed(2) }}%
                        </td>
                        <td class="px-3 py-3 text-right font-mono text-slate-700">
                          {{ (a.comision * 100).toFixed(2) }}%
                        </td>
                        <td class="px-3 py-3 text-right font-mono text-slate-700">
                          {{ (a.prima * 100).toFixed(2) }}%
                        </td>
                        <td class="px-4 py-3 text-right font-mono font-bold text-blue-700 bg-blue-50/40">
                          {{ ((a.aporte + a.comision + a.prima) * 100).toFixed(2) }}%
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
              <p class="text-[11px] text-slate-400 italic">
                * Las tasas de prima de seguro son reguladas por la SBS mediante licitación pública (SISCO).
              </p>
            </div>
          }

          <!-- TAB 4: SEDES Y SUCURSALES -->
          @if (activeTab() === 'sedes') {
            <div class="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 class="text-base font-bold text-slate-900">Sedes Operativas y Centros de Trabajo</h3>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Puntos de marcación biométrica, turnos rotativos y control de asistencia nacional.
                  </p>
                </div>
                <span class="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {{ sedes.length }} Sedes Habilitadas
                </span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                @for (s of sedes; track s.id) {
                  <div class="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-2">
                    <div class="flex items-start justify-between">
                      <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                          <svg class="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                        </div>
                        <div>
                          <h4 class="font-bold text-slate-900">{{ s.nombre }}</h4>
                          <span class="text-[10px] font-mono text-slate-400">{{ s.codigo }}</span>
                        </div>
                      </div>
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Operativa
                      </span>
                    </div>

                    <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{{ s.ciudad }}, {{ s.departamento }}</span>
                      <span class="font-medium text-slate-700">Centro de Costo Activo</span>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- TAB 5: CONEXIÓN & PUERTOS -->
          @if (activeTab() === 'conexion') {
            <div class="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 class="text-base font-bold text-slate-900">Arquitectura de Servicios y Puertos Asignados</h3>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Monitoreo estricto de puertos locales para garantizar cero colisiones con otros proyectos del usuario.
                  </p>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span class="text-[11px] font-semibold text-emerald-700">Sin Conflictos</span>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <!-- Angular -->
                <div class="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Frontend Angular 22</span>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200/60 text-emerald-900">Activo</span>
                  </div>
                  <div class="font-mono font-bold text-slate-900 text-sm">http://localhost:4200</div>
                  <p class="text-[11px] text-emerald-700">Aplicación Standalone migrada con Signals</p>
                </div>

                <!-- React -->
                <div class="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Frontend React Vite</span>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-200/60 text-blue-900">Activo</span>
                  </div>
                  <div class="font-mono font-bold text-slate-900 text-sm">http://localhost:5175</div>
                  <p class="text-[11px] text-blue-700">Puerto estricto asignado (sin interferir con 5173)</p>
                </div>

                <!-- Backend -->
                <div class="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Backend Spring Boot</span>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">Auto-Fallback</span>
                  </div>
                  <div class="font-mono font-bold text-slate-900 text-sm">http://localhost:8080/api</div>
                  <p class="text-[11px] text-slate-500">API RESTful con fallback mock automático integrado</p>
                </div>

                <!-- SQL Server -->
                <div class="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Base de Datos</span>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">Puerto 1433</span>
                  </div>
                  <div class="font-mono font-bold text-slate-900 text-sm">SistemaPlanillasDB (SQL Server)</div>
                  <p class="text-[11px] text-slate-500">Esquema corporativo con procedimientos almacenados</p>
                </div>
              </div>

              <!-- Lista de Puertos Protegidos -->
              <div class="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 text-xs">
                <span class="font-semibold text-slate-700 block mb-1">Puertos Reservados y Protegidos del Sistema:</span>
                <p class="text-[11px] text-slate-500 leading-relaxed font-mono">
                  80, 135, 445, 1433, 3000, 3004, 3008, 5040, 5173, 5180, 5678, 7070 (Intactos y respetados).
                </p>
              </div>
            </div>
          }
        </div>

        <!-- PANEL LATERAL DE AUDITORÍA & RESUMEN LEGAL (1 COLUMNA) -->
        <div class="space-y-4">
          <!-- Card Resumen Normativo -->
          <div class="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-slate-100">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Resumen Legal Vigente</h4>
              </div>
              <span class="text-[10px] font-mono text-slate-400">Año 2026</span>
            </div>

            <div class="space-y-2 text-xs">
              <div class="flex items-center justify-between py-1 border-b border-slate-50">
                <span class="text-slate-500">Sueldo Básico Mínimo</span>
                <span class="font-mono font-bold text-slate-800">S/ {{ laboral.rmv.toFixed(2) }}</span>
              </div>
              <div class="flex items-center justify-between py-1 border-b border-slate-50">
                <span class="text-slate-500">Asignación Familiar</span>
                <span class="font-mono font-bold text-slate-800">S/ {{ laboral.asigFamiliar.toFixed(2) }}</span>
              </div>
              <div class="flex items-center justify-between py-1 border-b border-slate-50">
                <span class="text-slate-500">Valor UIT SUNAT</span>
                <span class="font-mono font-bold text-slate-800">S/ {{ laboral.uit.toFixed(2) }}</span>
              </div>
              <div class="flex items-center justify-between py-1 border-b border-slate-50">
                <span class="text-slate-500">Aporte Empleador EsSalud</span>
                <span class="font-mono font-bold text-slate-800">{{ laboral.essalud.toFixed(1) }}%</span>
              </div>
              <div class="flex items-center justify-between py-1 border-b border-slate-50">
                <span class="text-slate-500">Tasa SCTR</span>
                <span class="font-mono font-bold text-slate-800">{{ laboral.sctr.toFixed(2) }}%</span>
              </div>
              <div class="flex items-center justify-between py-1">
                <span class="text-slate-500">Jornada Ordinaria</span>
                <span class="font-mono font-bold text-slate-800">{{ laboral.jornadaHoras }} hrs / día</span>
              </div>
            </div>
          </div>

          <!-- Card de Cumplimiento Legal SUNAFIL -->
          <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 class="text-xs font-bold text-white uppercase tracking-wider">Garantía Normativa</h4>
                <p class="text-[10px] text-slate-300">Auditoría laboral continua</p>
              </div>
            </div>

            <p class="text-[11px] text-slate-300 leading-relaxed">
              El motor de cálculo valida automáticamente los descansos semanales según el D.L. 713 y las retenciones del Sistema Privado de Pensiones (SPP).
            </p>

            <div class="space-y-1.5 pt-1 text-[11px] text-slate-300">
              <div class="flex items-center gap-2">
                <svg class="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Validado con PDT 601 PLAME</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Archivos AFP Net listos para exportar</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Telecrédito BCP y BBVA integrable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ConfigComponent {
  toast = inject(ToastService);

  readonly activeTab = signal<'parametros' | 'empresa' | 'afps' | 'sedes' | 'conexion'>('parametros');
  readonly sedes = SEDES;
  readonly afpsList = AFPS;

  empresa = {
    nombre: 'Minera Andina S.A.',
    ruc: '20489123891',
    direccion: 'Av. Las Camelias 450, San Isidro, Lima - Perú',
    representante: 'Carlos A. Mendoza Ríos',
    actividad: 'Extracción de minerales metalíferos no ferrosos',
  };

  laboral = {
    rmv: PARAMETROS_LABORALES.rmv,
    asigFamiliar: PARAMETROS_LABORALES.asigFamiliar,
    uit: PARAMETROS_LABORALES.uit,
    essalud: 9.0,
    sctr: 1.5,
    jornadaHoras: 8,
  };

  onRmvChange(): void {
    // Si cambia la RMV, recalculamos automáticamente el 10% de la asignación familiar
    if (this.laboral.rmv) {
      this.laboral.asigFamiliar = Number((this.laboral.rmv * 0.1).toFixed(2));
    }
  }

  resetDefaults(): void {
    this.laboral = {
      rmv: PARAMETROS_LABORALES.rmv,
      asigFamiliar: PARAMETROS_LABORALES.asigFamiliar,
      uit: PARAMETROS_LABORALES.uit,
      essalud: 9.0,
      sctr: 1.5,
      jornadaHoras: 8,
    };
    this.toast.show('Parámetros restablecidos a los valores legales oficiales.', 'info');
  }

  saveConfig(): void {
    this.toast.show('Parámetros y configuración guardados correctamente.', 'success');
  }
}
