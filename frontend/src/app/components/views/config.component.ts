import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';
import { AFPS, SEDES, PARAMETROS_LABORALES } from '../../data/mock-data';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <svg class="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configuración y Parámetros Laborales
          </h1>
          <p class="text-xs text-slate-500 mt-0.5">Tasas de ley, datos fiscales de la empresa y porcentajes de comisiones AFP / ONP.</p>
        </div>

        <button
          (click)="handleSave()"
          class="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          <span>Guardar Cambios</span>
        </button>
      </div>

      <!-- Tabs and Content Container -->
      <div class="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <!-- Tabs Header -->
        <div class="flex border-b border-slate-200 bg-slate-50 px-4 pt-3 gap-2">
          <button
            type="button"
            (click)="activeTab.set('empresa')"
            class="pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer"
            [ngClass]="activeTab() === 'empresa' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'"
          >
            Datos de la Empresa
          </button>
          <button
            type="button"
            (click)="activeTab.set('laboral')"
            class="pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer"
            [ngClass]="activeTab() === 'laboral' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'"
          >
            Parámetros de Ley (Perú)
          </button>
          <button
            type="button"
            (click)="activeTab.set('afps')"
            class="pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer"
            [ngClass]="activeTab() === 'afps' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'"
          >
            Comisiones AFP / ONP
          </button>
          <button
            type="button"
            (click)="activeTab.set('sedes')"
            class="pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer"
            [ngClass]="activeTab() === 'sedes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'"
          >
            Sedes Operativas
          </button>
        </div>

        <div class="p-6">
          <!-- Empresa Tab -->
          @if (activeTab() === 'empresa') {
            <form (ngSubmit)="handleSave()" class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs max-w-3xl">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Razón Social</label>
                <input type="text" [(ngModel)]="empresa.nombre" name="nombre" class="w-full h-9 px-3 border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">RUC</label>
                <input type="text" [(ngModel)]="empresa.ruc" name="ruc" class="w-full h-9 px-3 border border-slate-200 rounded-lg font-mono" />
              </div>
              <div class="sm:col-span-2">
                <label class="block font-semibold text-slate-700 mb-1">Dirección Fiscal</label>
                <input type="text" [(ngModel)]="empresa.direccion" name="direccion" class="w-full h-9 px-3 border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Representante Legal</label>
                <input type="text" [(ngModel)]="empresa.representante" name="representante" class="w-full h-9 px-3 border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Actividad Económica</label>
                <input type="text" [(ngModel)]="empresa.actividad" name="actividad" class="w-full h-9 px-3 border border-slate-200 rounded-lg" />
              </div>
            </form>
          }

          <!-- Laboral Tab -->
          @if (activeTab() === 'laboral') {
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs max-w-3xl">
              <div class="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <label class="block font-bold text-slate-700">RMV (Remuneración Mínima)</label>
                <span class="text-xs text-slate-500">Sueldo mínimo legal</span>
                <input type="number" [(ngModel)]="laboral.rmv" class="w-full h-9 px-3 border border-slate-200 rounded-lg bg-white font-mono font-bold" />
              </div>

              <div class="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <label class="block font-bold text-slate-700">Asignación Familiar (10%)</label>
                <span class="text-xs text-slate-500">Ley 25129</span>
                <input type="number" [(ngModel)]="laboral.asigFamiliar" class="w-full h-9 px-3 border border-slate-200 rounded-lg bg-white font-mono font-bold" />
              </div>

              <div class="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <label class="block font-bold text-slate-700">Aporte EsSalud (%)</label>
                <span class="text-xs text-slate-500">Cargo del empleador</span>
                <input type="number" [(ngModel)]="laboral.essalud" class="w-full h-9 px-3 border border-slate-200 rounded-lg bg-white font-mono font-bold" />
              </div>

              <div class="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <label class="block font-bold text-slate-700">Seguro SCTR (%)</label>
                <span class="text-xs text-slate-500">Riesgo operativo</span>
                <input type="number" [(ngModel)]="laboral.sctr" class="w-full h-9 px-3 border border-slate-200 rounded-lg bg-white font-mono font-bold" />
              </div>

              <div class="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <label class="block font-bold text-slate-700">UIT Vigente (S/)</label>
                <span class="text-xs text-slate-500">Unidad Impositiva Tributaria</span>
                <input type="number" [(ngModel)]="laboral.uit" class="w-full h-9 px-3 border border-slate-200 rounded-lg bg-white font-mono font-bold" />
              </div>

              <div class="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <label class="block font-bold text-slate-700">Jornada Ordinaria (Horas)</label>
                <span class="text-xs text-slate-500">Límite diario legal</span>
                <input type="number" [(ngModel)]="laboral.jornada" class="w-full h-9 px-3 border border-slate-200 rounded-lg bg-white font-mono font-bold" />
              </div>
            </div>
          }

          <!-- AFPs Tab -->
          @if (activeTab() === 'afps') {
            <div class="max-w-3xl overflow-hidden rounded-xl border border-slate-200">
              <table class="w-full text-xs text-left border-collapse">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th class="px-4 py-2.5">Administradora</th>
                    <th class="px-3 py-2.5 text-center">Aporte Fondo</th>
                    <th class="px-3 py-2.5 text-center">Comisión Flujo</th>
                    <th class="px-3 py-2.5 text-center">Prima de Seguro</th>
                    <th class="px-3 py-2.5 text-right">Tasa Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (a of afpList; track a.id) {
                    <tr>
                      <td class="px-4 py-2.5 font-bold text-slate-900">{{ a.nombre }}</td>
                      <td class="px-3 py-2.5 text-center font-mono">{{ (a.aporte * 100).toFixed(2) }}%</td>
                      <td class="px-3 py-2.5 text-center font-mono">{{ (a.comision * 100).toFixed(2) }}%</td>
                      <td class="px-3 py-2.5 text-center font-mono">{{ (a.prima * 100).toFixed(2) }}%</td>
                      <td class="px-3 py-2.5 text-right font-bold font-mono text-blue-700">
                        {{ ((a.aporte + a.comision + a.prima) * 100).toFixed(2) }}%
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          <!-- Sedes Tab -->
          @if (activeTab() === 'sedes') {
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
              @for (sede of sedesList; track sede.id) {
                <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <h4 class="font-bold text-slate-800 text-xs">{{ sede.nombre }}</h4>
                    <p class="text-[10px] text-slate-500 font-mono">{{ sede.codigo }} · {{ sede.ciudad }}, {{ sede.departamento }}</p>
                  </div>
                  <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    Operativa
                  </span>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class ConfigComponent {
  toastService = inject(ToastService);

  activeTab = signal<'empresa' | 'laboral' | 'afps' | 'sedes'>('empresa');

  empresa = {
    nombre: 'Minera Andina S.A.',
    ruc: '20489123891',
    direccion: 'Av. Las Camelias 450, San Isidro, Lima',
    representante: 'Carlos A. Mendoza Ríos',
    actividad: 'Extracción de minerales metalíferos',
  };

  laboral = {
    rmv: PARAMETROS_LABORALES.rmv,
    asigFamiliar: PARAMETROS_LABORALES.asigFamiliar,
    essalud: 9,
    sctr: 1.5,
    uit: PARAMETROS_LABORALES.uit,
    jornada: 8,
  };

  afpList = AFPS;
  sedesList = SEDES;

  handleSave() {
    this.toastService.show('Parámetros de configuración guardados correctamente.', 'success');
  }
}

