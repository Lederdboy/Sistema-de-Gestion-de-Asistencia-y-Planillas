import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SEDES } from '../../data/mock-data';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-3.5 sm:space-y-4">
      <!-- Header -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          <div class="space-y-1 sm:space-y-1.5">
            <h1 class="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
              Dashboard Ejecutivo de Asistencia y Planillas
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Sincronización en vivo de personal, tareo diario registrado hasta hoy y costos de nómina por sede.
            </p>
          </div>

          <div class="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            <a
              routerLink="/tareo"
              class="flex-1 sm:flex-none h-9 px-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Ver Tareo al Día</span>
            </a>
            <a
              routerLink="/planilla"
              class="flex-1 sm:flex-none h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Calcular Planilla</span>
            </a>
          </div>
        </div>
      </div>

      <!-- KPI Cards 4 Columns -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        <!-- KPI 1 -->
        <div class="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col items-center justify-center text-center min-h-[110px] sm:min-h-[135px] hover:border-slate-300 transition-all">
          <div class="flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <svg class="w-3.5 h-3.5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span class="truncate">TOTAL TRABAJADORES</span>
          </div>
          <p class="text-2xl sm:text-4xl font-extrabold tracking-tight mt-1 sm:mt-1.5 font-mono text-blue-600">
            {{ totalColaboradores() }}
          </p>
          <p class="text-[10px] sm:text-xs text-slate-500 font-normal mt-0.5 sm:mt-1 truncate max-w-full">
            plantilla operativa total
          </p>
        </div>

        <!-- KPI 2 -->
        <div class="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col items-center justify-center text-center min-h-[110px] sm:min-h-[135px] hover:border-slate-300 transition-all">
          <div class="flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <svg class="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="truncate">% AVANCE</span>
          </div>
          <p class="text-2xl sm:text-4xl font-extrabold tracking-tight mt-1 sm:mt-1.5 font-mono text-emerald-600">
            100%
          </p>
          <p class="text-[10px] sm:text-xs text-slate-500 font-normal mt-0.5 sm:mt-1 truncate max-w-full">
            progreso de asistencia
          </p>
        </div>

        <!-- KPI 3 -->
        <div class="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col items-center justify-center text-center min-h-[110px] sm:min-h-[135px] hover:border-slate-300 transition-all">
          <div class="flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <svg class="w-3.5 h-3.5 text-rose-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="truncate">PENDIENTES</span>
          </div>
          <p class="text-2xl sm:text-4xl font-extrabold tracking-tight mt-1 sm:mt-1.5 font-mono text-rose-600">
            0
          </p>
          <p class="text-[10px] sm:text-xs text-slate-500 font-normal mt-0.5 sm:mt-1 truncate max-w-full">
            trabajadores por registrar
          </p>
        </div>

        <!-- KPI 4 -->
        <div class="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col items-center justify-center text-center min-h-[110px] sm:min-h-[135px] hover:border-slate-300 transition-all">
          <div class="flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <svg class="w-3.5 h-3.5 text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="truncate">RETRASO TOTAL (H)</span>
          </div>
          <p class="text-2xl sm:text-4xl font-extrabold tracking-tight mt-1 sm:mt-1.5 font-mono text-slate-800">
            0
          </p>
          <p class="text-[10px] sm:text-xs text-slate-500 font-normal mt-0.5 sm:mt-1 truncate max-w-full">
            horas acumuladas
          </p>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2 space-y-4">
          <!-- Costos por Sede -->
          <div class="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div class="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Costos de Planilla por Sede Operativa ({{ sedesStats().length }} Sedes Activas)
                </h3>
              </div>
              <span class="text-[11px] text-slate-400 font-medium">Datos SQL Server</span>
            </div>

            <div class="space-y-4">
              @for (item of sedesStats(); track item.sede) {
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-semibold text-slate-800">{{ item.sede }}</span>
                    <span class="text-slate-600 font-mono">
                      S/ {{ item.costo.toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}
                      <span class="text-slate-400 font-normal ml-1.5">({{ item.count }} personas)</span>
                    </span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div class="bg-blue-600 h-2 rounded-full transition-all duration-500" [style.width.%]="item.pct || 5"></div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Previsión AFP / ONP -->
          <div class="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div class="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Distribución Previsional del Personal ({{ totalColaboradores() }} Trabajadores)
                </h3>
              </div>
              <span class="text-[11px] text-slate-400 font-medium">Declaración AFP Net / ONP</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              @for (a of afpDisplay(); track a.key) {
                <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-center hover:bg-blue-50/50 hover:border-blue-200 transition-colors">
                  <p class="text-[11px] font-bold text-slate-700">{{ a.nombre }}</p>
                  <p class="text-lg font-black mt-0.5 font-mono text-slate-900">{{ a.pct }}%</p>
                  <p class="text-[10px] text-slate-500">{{ a.count }} personas</p>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Sidebar panels -->
        <div class="space-y-4">
          <!-- Alertas -->
          <div class="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div class="flex items-center gap-2 pb-3.5 border-b border-slate-100 mb-4 text-slate-800">
              <svg class="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 class="text-xs font-bold uppercase tracking-wider">Incidencias y Alertas</h3>
            </div>

            <div class="space-y-2.5">
              @if (trabajadoresConFalta().length > 0) {
                @for (t of trabajadoresConFalta(); track t.id) {
                  <div class="p-3 rounded-xl bg-rose-50/60 border border-rose-200 text-xs text-rose-800">
                    <p class="font-bold flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5 text-rose-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Inasistencia Registrada
                    </p>
                    <p class="text-[11px] text-rose-700 mt-0.5">
                      {{ t.nombre }} registró falta en el tareo del día {{ t.dia }}.
                    </p>
                  </div>
                }
              } @else {
                <div class="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-800">
                  <p class="font-bold flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Sin Faltas Críticas
                  </p>
                  <p class="text-[11px] text-emerald-700 mt-0.5">
                    No se han registrado inasistencias injustificadas hasta el día de hoy.
                  </p>
                </div>
              }

              <div class="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-800">
                <p class="font-bold flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Tareo al Día (7 de Setiembre)
                </p>
                <p class="text-[11px] text-blue-700 mt-0.5">
                  Los tareos de las 6 sedes se encuentran registrados hasta la fecha actual.
                </p>
              </div>
            </div>
          </div>

          <!-- Shortcuts -->
          <div class="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-100 mb-3">
              Módulos del Sistema
            </h3>
            <div class="space-y-1.5">
              <a
                routerLink="/personal"
                class="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-2.5">
                  <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Directorio de Personal ({{ totalColaboradores() }})</span>
                </div>
                <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>

              <a
                routerLink="/tareo"
                class="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-2.5">
                  <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Matriz de Asistencia (Hasta Hoy)</span>
                </div>
                <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>

              <a
                routerLink="/planilla"
                class="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-2.5">
                  <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Cálculo de Planilla</span>
                </div>
                <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  apiService = inject(ApiService);

  totalColaboradores = computed(() => this.apiService.workers().length);

  sedesStats = computed(() => {
    const workers = this.apiService.workers();
    const totalSueldosBase = workers.reduce((acc, w) => acc + (Number(w.sueldoBase) || 0), 0);

    return SEDES.map(sede => {
      const workersInSede = workers.filter(w => String(w.sedeId) === String(sede.id));
      const totalSueldoSede = workersInSede.reduce((acc, w) => acc + (Number(w.sueldoBase) || 0), 0);
      const pct = totalSueldosBase > 0 ? ((totalSueldoSede / totalSueldosBase) * 100).toFixed(0) : 0;
      return {
        sede: sede.nombre,
        ciudad: sede.ciudad,
        costo: totalSueldoSede,
        count: workersInSede.length,
        pct: Number(pct),
      };
    }).filter(s => s.count > 0);
  });

  afpDisplay = computed(() => {
    const workers = this.apiService.workers();
    const total = workers.length;

    const afpCounts: Record<string, number> = {
      integra: workers.filter(w => w.afp === 'integra').length,
      prima: workers.filter(w => w.afp === 'prima').length,
      profuturo: workers.filter(w => w.afp === 'profuturo').length,
      habitat: workers.filter(w => w.afp === 'habitat').length,
      onp: workers.filter(w => w.afp === 'onp').length,
    };

    return [
      { key: 'integra', nombre: 'AFP Integra', count: afpCounts['integra'], pct: total > 0 ? Math.round((afpCounts['integra'] / total) * 100) : 0 },
      { key: 'prima', nombre: 'AFP Prima', count: afpCounts['prima'], pct: total > 0 ? Math.round((afpCounts['prima'] / total) * 100) : 0 },
      { key: 'profuturo', nombre: 'AFP Profuturo', count: afpCounts['profuturo'], pct: total > 0 ? Math.round((afpCounts['profuturo'] / total) * 100) : 0 },
      { key: 'habitat', nombre: 'AFP Hábitat', count: afpCounts['habitat'], pct: total > 0 ? Math.round((afpCounts['habitat'] / total) * 100) : 0 },
      { key: 'onp', nombre: 'ONP (19990)', count: afpCounts['onp'], pct: total > 0 ? Math.round((afpCounts['onp'] / total) * 100) : 0 },
    ];
  });

  trabajadoresConFalta = computed(() => {
    const list: { id: number; nombre: string; dia: number }[] = [];
    this.apiService.workers().forEach(w => {
      const tareo7 = (w.tareo || []).slice(0, 7);
      tareo7.forEach((code, idx) => {
        if (code === 'F' && !list.find(t => t.id === w.id)) {
          list.push({ id: w.id, nombre: w.nombre, dia: idx + 1 });
        }
      });
    });
    return list;
  });
}

