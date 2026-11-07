import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanillasStateService } from '../../../services/planillas-state.service';
import { SEDES, AFPS } from '../../../data/mock-data';

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      <!-- Cabecera Principal -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Dashboard de Gestión de Asistencia y Planillas
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Supervisión de personal, matriz de turnos y control de nómina mensual en vivo
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2.5">
            <button
              (click)="state.setNav('tareo')"
              class="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Ir a Tareo Diario</span>
              <span>→</span>
            </button>
            <button
              (click)="state.setNav('planilla')"
              class="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Ver Pre-Planilla</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 4 KPI Cards Principales -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        <!-- KPI 1 -->
        <div class="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col items-center justify-center text-center">
          <span class="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Colaboradores
          </span>
          <span class="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {{ totalColaboradores() }}
          </span>
          <span class="text-[11px] text-emerald-600 font-semibold mt-0.5">
            100% en planilla formal
          </span>
        </div>

        <!-- KPI 2 -->
        <div class="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col items-center justify-center text-center">
          <span class="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Personal en Operación
          </span>
          <span class="text-2xl sm:text-3xl font-black text-blue-600 mt-1">
            {{ totalActivos() }}
          </span>
          <span class="text-[11px] text-slate-500 font-semibold mt-0.5">
            {{ totalVacaciones() }} en descanso vacacional
          </span>
        </div>

        <!-- KPI 3 -->
        <div class="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col items-center justify-center text-center">
          <span class="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Costo de Planilla Estimado
          </span>
          <span class="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-mono">
            S/ {{ costoTotalEstimado().toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </span>
          <span class="text-[11px] text-purple-600 font-semibold mt-0.5">
            Incluye asignaciones familiares
          </span>
        </div>

        <!-- KPI 4 -->
        <div class="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col items-center justify-center text-center">
          <span class="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Tasa de Asistencia
          </span>
          <span class="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
            {{ (100 - Number(tasaAusentismo())).toFixed(1) }}%
          </span>
          <span class="text-[11px] text-slate-500 font-semibold mt-0.5">
            {{ tasaAusentismo() }}% ausentismo registrado
          </span>
        </div>
      </div>

      <!-- Grid de Paneles Detallados -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Distribución por Sedes -->
        <div class="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <h3 class="text-sm font-bold text-slate-900">
              Distribución de Personal y Masa Salarial por Sede
            </h3>
            <span class="text-xs text-slate-500 font-semibold">6 Sedes Operativas</span>
          </div>

          <div class="space-y-3.5">
            @for (sede of sedesStats(); track sede.sede) {
              <div class="space-y-1.5">
                <div class="flex justify-between text-xs">
                  <span class="font-semibold text-slate-800">{{ sede.sede }}</span>
                  <span class="text-slate-500 font-mono">
                    {{ sede.count }} colab. · S/ {{ sede.costo.toLocaleString('es-PE') }} ({{ sede.pct }}%)
                  </span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    [style.width.%]="sede.pct"
                  ></div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Panel Lateral Informativo -->
        <div class="space-y-4">
          <!-- Alertas Rápidas -->
          <div class="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 class="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Alertas y Cumplimiento Laboral
            </h3>

            <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <span class="font-bold flex items-center gap-1.5">
                <svg class="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2"/><path d="M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-2"/><path d="M5.89 9.71c-2.15 1.45-3 4.17-1.89 6.29"/><path d="M17.5 15c.96-1.83.6-4.04-1-5.34"/><path d="M12 12v9"/><path d="M8 21h8"/>
                </svg>
                Periodo Vacacional Activo
              </span>
              <p class="text-[11px] text-amber-800">
                Hay colaboradores con saldo vacacional acumulado exigible bajo normativa D.L. 713.
              </p>
            </div>

            <div class="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
              <span class="font-bold flex items-center gap-1.5">
                <svg class="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                </svg>
                Pre-Planilla 2026-09
              </span>
              <p class="text-[11px] text-blue-800">
                La liquidación mensual de tareo se encuentra abierta para cálculo y auditoría.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  state = inject(PlanillasStateService);
  Number = Number;

  totalColaboradores() {
    return this.state.workers().length;
  }

  totalActivos() {
    return this.state.workers().filter((w) => w.estado === 'Activo').length;
  }

  totalVacaciones() {
    return this.state.workers().filter((w) => w.estado === 'Vacaciones').length;
  }

  costoTotalEstimado() {
    const totalSueldosBase = this.state.workers().reduce((acc, w) => acc + (Number(w.sueldoBase) || 0), 0);
    const asignacionesFamiliares = this.state.workers().filter((w) => w.asigFamiliar).length * 102.50;
    return totalSueldosBase + asignacionesFamiliares;
  }

  tasaAusentismo() {
    const diaHoy = 7;
    let totalMarcaciones = 0;
    let totalFaltas = 0;
    this.state.workers().forEach((w) => {
      const tareo7 = (w.tareo || []).slice(0, diaHoy);
      tareo7.forEach((code) => {
        if (code) totalMarcaciones++;
        if (code === 'F') totalFaltas++;
      });
    });
    return totalMarcaciones > 0 ? ((totalFaltas / totalMarcaciones) * 100).toFixed(1) : '0.0';
  }

  sedesStats() {
    const workers = this.state.workers();
    const totalSueldos = workers.reduce((acc, w) => acc + (Number(w.sueldoBase) || 0), 0);
    return SEDES.map((sede) => {
      const inSede = workers.filter((w) => String(w.sedeId) === String(sede.id));
      const costoSede = inSede.reduce((acc, w) => acc + (Number(w.sueldoBase) || 0), 0);
      const pct = totalSueldos > 0 ? Number(((costoSede / totalSueldos) * 100).toFixed(0)) : 0;
      return {
        sede: sede.nombre,
        costo: costoSede,
        count: inSede.length,
        pct,
      };
    });
  }
}

