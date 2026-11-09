import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { BADGE_CONFIG, EMPRESAS, SEDES } from '../../data/mock-data';
import { BadgeConfigItem } from '../../models/asistencia.model';

interface CellSelection {
  workerId: number;
  workerName: string;
  dayIndex: number;
  currentCode: string;
}

@Component({
  selector: 'app-tareo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          <div class="space-y-1 sm:space-y-1.5">
            <h1 class="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
              Matriz de Control de Asistencia y Tareo Mensual
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Registro diario de turnos por colaborador (D: Día, N: Noche, F: Falta, DL: Descanso Ley, V: Vacaciones).
            </p>
          </div>

          <div class="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            <button
              (click)="exportExcel()"
              class="flex-1 sm:flex-none h-9 px-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Exportar Tareo Excel</span>
            </button>
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

      <!-- KPI Bar -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div class="bg-white border border-slate-200/90 rounded-2xl p-3.5 text-center shadow-xs">
          <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Personal</span>
          <p class="text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono mt-1">{{ filteredWorkers().length }}</p>
          <span class="text-[10px] text-slate-400">trabajadores filtrados</span>
        </div>
        <div class="bg-white border border-slate-200/90 rounded-2xl p-3.5 text-center shadow-xs">
          <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Avance del Mes</span>
          <p class="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono mt-1">100%</p>
          <span class="text-[10px] text-slate-400">días computados (1-30)</span>
        </div>
        <div class="bg-white border border-slate-200/90 rounded-2xl p-3.5 text-center shadow-xs">
          <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Faltas Totales</span>
          <p class="text-2xl sm:text-3xl font-extrabold text-rose-600 font-mono mt-1">{{ totalFaltas() }}</p>
          <span class="text-[10px] text-slate-400">descuentos aplicables</span>
        </div>
        <div class="bg-white border border-slate-200/90 rounded-2xl p-3.5 text-center shadow-xs">
          <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Días Descanso Ley</span>
          <p class="text-2xl sm:text-3xl font-extrabold text-sky-600 font-mono mt-1">{{ totalDescansos() }}</p>
          <span class="text-[10px] text-slate-400">fines de semana</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div class="relative flex-1 min-w-0">
          <svg class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            [(ngModel)]="search"
            placeholder="Buscar por colaborador o DNI..."
            class="w-full h-9 pl-9 pr-3 text-xs border border-slate-200 rounded-lg bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div class="grid grid-cols-2 sm:flex items-center gap-2">
          <select
            [(ngModel)]="selectedSede"
            class="h-9 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 truncate"
          >
            <option value="">Todas las Sedes</option>
            @for (s of sedes; track s.id) {
              <option [value]="s.id">{{ s.nombre }}</option>
            }
          </select>

          <div class="flex items-center gap-1.5 px-3 h-9 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
            <span>Periodo: Setiembre 2026</span>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex flex-wrap items-center gap-2 text-xs bg-white border border-slate-200/90 rounded-xl p-2.5 shadow-xs">
        <span class="font-bold text-slate-500 text-[11px] uppercase mr-1">Leyenda:</span>
        @for (key of badgeKeys; track key) {
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border" [ngClass]="badges[key].cls">
            <span>{{ badges[key].label }}</span>
            <span class="font-normal text-slate-600">({{ badges[key].desc }})</span>
          </span>
        }
      </div>

      <!-- Matrix Table -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div class="overflow-x-auto pb-2">
          <table class="w-full min-w-[1200px] text-xs text-left border-collapse select-none">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th class="px-3 py-2.5 sticky left-0 bg-slate-50 z-10 w-48 shadow-r">Colaborador</th>
                <th class="px-2 py-2.5 text-center w-16">Cargo</th>
                @for (d of days; track d) {
                  <th class="px-1 py-2 text-center w-7" [ngClass]="{ 'bg-slate-100/80 font-bold text-slate-800': isWeekendDay(d) }">
                    <span>{{ d }}</span>
                  </th>
                }
                <th class="px-2 py-2.5 text-center font-bold text-emerald-700 bg-emerald-50/50">D</th>
                <th class="px-2 py-2.5 text-center font-bold text-indigo-700 bg-indigo-50/50">N</th>
                <th class="px-2 py-2.5 text-center font-bold text-rose-700 bg-rose-50/50">F</th>
                <th class="px-2 py-2.5 text-center font-bold text-sky-700 bg-sky-50/50">DL</th>
                <th class="px-2 py-2.5 text-center font-bold text-amber-700 bg-amber-50/50">V</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-[11px]">
              @for (w of filteredWorkers(); track w.id) {
                <tr class="hover:bg-slate-50/70 transition-colors">
                  <!-- Worker name sticky -->
                  <td class="px-3 py-2 sticky left-0 bg-white z-10 shadow-r border-r border-slate-100">
                    <p class="font-bold text-slate-900 truncate max-w-[180px]">{{ w.nombre }}</p>
                    <p class="text-[10px] text-slate-400 font-mono">{{ w.dni }}</p>
                  </td>
                  <td class="px-2 py-2 text-slate-500 truncate max-w-[100px] text-[10px]">{{ w.cargo }}</td>

                  <!-- 30 Days cells -->
                  @for (d of days; track d; let idx = $index) {
                    <td class="p-0.5 text-center" [ngClass]="{ 'bg-slate-50/60': isWeekendDay(d) }">
                      <button
                        (click)="openEditModal(w.id, w.nombre, idx, (w.tareo && w.tareo[idx]) || 'D')"
                        [title]="'Día ' + d + ': ' + ((w.tareo && w.tareo[idx]) || 'D')"
                        class="w-6 h-6 rounded text-[10px] font-bold border transition-transform active:scale-90 hover:ring-2 hover:ring-blue-400/50 cursor-pointer"
                        [ngClass]="getBadgeClass((w.tareo && w.tareo[idx]) || 'D')"
                      >
                        {{ (w.tareo && w.tareo[idx]) || 'D' }}
                      </button>
                    </td>
                  }

                  <!-- Summaries -->
                  <td class="px-2 py-2 text-center font-bold text-emerald-700 bg-emerald-50/30 font-mono">
                    {{ countCode(w.tareo, 'D') }}
                  </td>
                  <td class="px-2 py-2 text-center font-bold text-indigo-700 bg-indigo-50/30 font-mono">
                    {{ countCode(w.tareo, 'N') }}
                  </td>
                  <td class="px-2 py-2 text-center font-bold text-rose-700 bg-rose-50/30 font-mono">
                    {{ countCode(w.tareo, 'F') }}
                  </td>
                  <td class="px-2 py-2 text-center font-bold text-sky-700 bg-sky-50/30 font-mono">
                    {{ countCode(w.tareo, 'DL') }}
                  </td>
                  <td class="px-2 py-2 text-center font-bold text-amber-700 bg-amber-50/30 font-mono">
                    {{ countCode(w.tareo, 'V') }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Edit Cell Modal -->
      @if (selectedCell(); as cell) {
        <div class="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-slate-200 animate-in fade-in duration-150">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 class="text-sm font-bold text-slate-900">Modificar Marcación</h3>
                <p class="text-xs text-slate-500">Día {{ cell.dayIndex + 1 }} · {{ cell.workerName }}</p>
              </div>
              <button (click)="selectedCell.set(null)" class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p class="text-xs text-slate-600 mb-3">Selecciona el nuevo turno o código de asistencia:</p>

            <div class="grid grid-cols-2 gap-2">
              @for (key of badgeKeys; track key) {
                <button
                  type="button"
                  (click)="updateStatus(key)"
                  class="p-2.5 rounded-xl border text-left flex items-center gap-2 hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer"
                  [ngClass]="badges[key].cls"
                >
                  <span class="w-6 h-6 rounded-lg bg-white/80 font-bold flex items-center justify-center text-xs shadow-xs">
                    {{ badges[key].label }}
                  </span>
                  <div>
                    <p class="text-xs font-bold leading-tight">{{ badges[key].desc }}</p>
                  </div>
                </button>
              }
            </div>

            <div class="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                (click)="selectedCell.set(null)"
                class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class TareoComponent {
  apiService = inject(ApiService);
  toastService = inject(ToastService);
  router = inject(Router);

  sedes = SEDES;
  search = '';
  selectedSede = '';
  days = Array.from({ length: 30 }, (_, i) => i + 1);

  badges = BADGE_CONFIG;
  badgeKeys = ['D', 'N', 'F', 'DL', 'V', 'M'];

  selectedCell = signal<CellSelection | null>(null);

  filteredWorkers = computed(() => {
    const s = this.search.toLowerCase();
    const sede = this.selectedSede;

    return this.apiService.workers().filter(w => {
      const matchSearch = !s || w.nombre.toLowerCase().includes(s) || w.dni.includes(s);
      const matchSede = !sede || String(w.sedeId) === String(sede);
      return matchSearch && matchSede;
    });
  });

  totalFaltas = computed(() => {
    return this.filteredWorkers().reduce((acc, w) => {
      return acc + (w.tareo?.filter(c => c === 'F').length || 0);
    }, 0);
  });

  totalDescansos = computed(() => {
    return this.filteredWorkers().reduce((acc, w) => {
      return acc + (w.tareo?.filter(c => c === 'DL').length || 0);
    }, 0);
  });

  isWeekendDay(day: number): boolean {
    return (day % 7 === 5) || (day % 7 === 6);
  }

  getBadgeClass(code: string): string {
    return this.badges[code]?.cls || 'bg-slate-100 text-slate-700 border-slate-200';
  }

  countCode(tareo: string[] | undefined, code: string): number {
    if (!tareo) return 0;
    return tareo.filter(c => c === code).length;
  }

  openEditModal(workerId: number, workerName: string, dayIndex: number, currentCode: string) {
    this.selectedCell.set({ workerId, workerName, dayIndex, currentCode });
  }

  async updateStatus(newCode: string) {
    const cell = this.selectedCell();
    if (!cell) return;

    await this.apiService.updateMarcacion({
      trabajadorId: cell.workerId,
      fecha: `2026-09-${String(cell.dayIndex + 1).padStart(2, '0')}`,
      codigoAsistencia: newCode,
      observacion: `Actualizado a ${newCode} desde matriz Tareo Angular`
    });

    this.toastService.show(`Día ${cell.dayIndex + 1} actualizado a ${newCode} correctamente`, 'success');
    this.selectedCell.set(null);
  }

  exportExcel() {
    this.toastService.show('Generando reporte Excel de asistencia...', 'info');

    const headers = [
      'N°', 'DNI', 'Colaborador', 'Cargo',
      ...this.days.map(d => `Día ${d}`),
      'Total D', 'Total N', 'Total F', 'Total DL', 'Total V'
    ];

    const rows = this.filteredWorkers().map((w, idx) => {
      const tareo = w.tareo || [];
      return [
        idx + 1,
        w.dni,
        w.nombre,
        w.cargo,
        ...this.days.map(d => tareo[d - 1] || 'DL'),
        this.countCode(tareo, 'D'),
        this.countCode(tareo, 'N'),
        this.countCode(tareo, 'F'),
        this.countCode(tareo, 'DL'),
        this.countCode(tareo, 'V')
      ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tareo_Setiembre_2026');
    XLSX.writeFile(workbook, 'Tareo_Consolidado_Setiembre_2026.xlsx');
  }
}

