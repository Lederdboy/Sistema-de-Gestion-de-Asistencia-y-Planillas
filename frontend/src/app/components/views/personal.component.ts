import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { Trabajador } from '../../models/trabajador.model';
import { SEDES, AFPS } from '../../data/mock-data';

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
            <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Directorio General de Personal
          </h2>
          <p class="text-xs text-slate-500">
            Total {{ apiService.workers().length }} trabajadores registrados · {{ filteredWorkers().length }} visibles según filtros
          </p>
        </div>

        <button
          (click)="showNewModal.set(true)"
          class="w-full sm:w-auto h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Colaborador</span>
        </button>
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
            placeholder="Buscar por DNI, nombres o cargo..."
            class="w-full h-9 pl-9 pr-3 text-xs border border-slate-200 rounded-lg bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
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

          <select
            [(ngModel)]="selectedEstado"
            class="h-9 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 truncate"
          >
            <option value="">Todos los Estados</option>
            <option value="Activo">Activo</option>
            <option value="Vacaciones">Vacaciones</option>
            <option value="Licencia">Licencia</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div class="overflow-x-auto pb-2">
          <table class="w-full min-w-[750px] text-xs text-left border-collapse select-auto">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th class="px-4 py-3">Colaborador</th>
                <th class="px-3 py-3">DNI</th>
                <th class="px-3 py-3">Cargo y Régimen</th>
                <th class="px-3 py-3">Sede / Ubicación</th>
                <th class="px-3 py-3 text-right">Sueldo Básico</th>
                <th class="px-3 py-3 text-center">Pensión</th>
                <th class="px-3 py-3 text-center">Estado</th>
                <th class="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (w of filteredWorkers(); track w.id) {
                <tr class="hover:bg-slate-50/70 transition-colors">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                        {{ w.nombre.slice(0, 2).toUpperCase() }}
                      </div>
                      <div>
                        <p class="font-semibold text-slate-900">{{ w.nombre }}</p>
                        <p class="text-[11px] text-slate-400 flex items-center gap-1">
                          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{{ w.email }}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="px-3 py-3 font-mono text-slate-600 font-medium">{{ w.dni }}</td>
                  <td class="px-3 py-3">
                    <p class="font-medium text-slate-800">{{ w.cargo }}</p>
                    <span class="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {{ w.regimen || 'D.L. 728' }}
                    </span>
                  </td>
                  <td class="px-3 py-3 text-slate-600">
                    <div class="flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{{ getSedeNombre(w.sedeId) }}</span>
                    </div>
                  </td>
                  <td class="px-3 py-3 text-right font-mono font-semibold text-slate-800">
                    S/ {{ w.sueldoBase.toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}
                  </td>
                  <td class="px-3 py-3 text-center">
                    <span class="px-2 py-0.5 rounded text-[11px] font-semibold"
                      [ngClass]="w.afp === 'onp' ? 'bg-slate-100 text-slate-700' : 'bg-blue-50 text-blue-700'">
                      {{ getAfpNombre(w.afp) }}
                    </span>
                  </td>
                  <td class="px-3 py-3 text-center">
                    <span
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                      [ngClass]="w.estado === 'Activo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
                    >
                      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="w.estado === 'Activo' ? 'bg-emerald-500' : 'bg-amber-500'"></span>
                      {{ w.estado }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <button
                      (click)="selectedWorker.set(w)"
                      class="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded border border-blue-200 transition-colors cursor-pointer"
                    >
                      Ver Ficha
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Detalle / Ficha Trabajador -->
      @if (selectedWorker(); as worker) {
        <div class="fixed inset-0 z-[60] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in duration-150">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                  {{ worker.nombre.slice(0, 2).toUpperCase() }}
                </div>
                <div>
                  <h3 class="text-base font-bold text-slate-900">{{ worker.nombre }}</h3>
                  <p class="text-xs text-slate-500">{{ worker.cargo }} · {{ worker.regimen }}</p>
                </div>
              </div>
              <button (click)="selectedWorker.set(null)" class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span class="text-slate-400 block text-[10px] uppercase font-bold">DNI</span>
                <span class="font-bold text-slate-800 font-mono text-sm">{{ worker.dni }}</span>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span class="text-slate-400 block text-[10px] uppercase font-bold">Sueldo Básico</span>
                <span class="font-bold text-slate-800 font-mono text-sm">S/ {{ worker.sueldoBase.toFixed(2) }}</span>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span class="text-slate-400 block text-[10px] uppercase font-bold">Sistema de Pensión</span>
                <span class="font-bold text-slate-800">{{ getAfpNombre(worker.afp) }}</span>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span class="text-slate-400 block text-[10px] uppercase font-bold">Asignación Familiar</span>
                <span class="font-bold text-slate-800">{{ worker.asigFamiliar ? 'Sí (+ S/ 102.50)' : 'No' }}</span>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span class="text-slate-400 block text-[10px] uppercase font-bold">Sede</span>
                <span class="font-bold text-slate-800">{{ getSedeNombre(worker.sedeId) }}</span>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span class="text-slate-400 block text-[10px] uppercase font-bold">Fecha de Ingreso</span>
                <span class="font-bold text-slate-800">{{ worker.fechaIngreso }}</span>
              </div>
              <div class="col-span-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span class="text-slate-400 block text-[10px] uppercase font-bold">Contacto</span>
                <p class="font-medium text-slate-800 mt-0.5">Email: {{ worker.email }}</p>
                <p class="font-medium text-slate-800">Teléfono: {{ worker.telefono }}</p>
              </div>
            </div>

            <div class="mt-5 flex justify-end">
              <button
                (click)="selectedWorker.set(null)"
                class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modal Nuevo Trabajador -->
      @if (showNewModal()) {
        <div class="fixed inset-0 z-[60] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in duration-150">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Registrar Nuevo Colaborador
              </h3>
              <button (click)="showNewModal.set(false)" class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form (ngSubmit)="handleCreateWorker()" class="space-y-3.5">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">DNI *</label>
                  <input
                    type="text"
                    maxlength="8"
                    required
                    [(ngModel)]="form.dni"
                    name="dni"
                    placeholder="8 dígitos"
                    class="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Nombres *</label>
                  <input
                    type="text"
                    required
                    [(ngModel)]="form.nombres"
                    name="nombres"
                    placeholder="Ej. Juan Carlos"
                    class="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Apellido Paterno *</label>
                  <input
                    type="text"
                    required
                    [(ngModel)]="form.apellidoPaterno"
                    name="apellidoPaterno"
                    placeholder="Ej. Pérez"
                    class="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Apellido Materno</label>
                  <input
                    type="text"
                    [(ngModel)]="form.apellidoMaterno"
                    name="apellidoMaterno"
                    placeholder="Ej. Gómez"
                    class="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Cargo *</label>
                  <input
                    type="text"
                    required
                    [(ngModel)]="form.cargo"
                    name="cargo"
                    placeholder="Ej. Operario de Planta"
                    class="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Sueldo Básico (S/) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    [(ngModel)]="form.sueldoBase"
                    name="sueldoBase"
                    placeholder="1500.00"
                    class="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Sede *</label>
                  <select
                    [(ngModel)]="form.sedeId"
                    name="sedeId"
                    class="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    @for (s of sedes; track s.id) {
                      <option [value]="s.id">{{ s.nombre }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Sistema de Pensión *</label>
                  <select
                    [(ngModel)]="form.afp"
                    name="afp"
                    class="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    @for (a of afps; track a.id) {
                      <option [value]="a.id">{{ a.nombre }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="asigFam"
                  [(ngModel)]="form.asigFamiliar"
                  name="asigFamiliar"
                  class="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label for="asigFam" class="text-xs text-slate-700 cursor-pointer">
                  Aplica Asignación Familiar (Ley 25129: + S/ 102.50)
                </label>
              </div>

              <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  (click)="showNewModal.set(false)"
                  class="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
                >
                  Guardar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class PersonalComponent {
  apiService = inject(ApiService);
  toastService = inject(ToastService);

  sedes = SEDES;
  afps = AFPS;

  search = '';
  selectedSede = '';
  selectedEstado = '';

  showNewModal = signal<boolean>(false);
  selectedWorker = signal<Trabajador | null>(null);

  form = {
    dni: '',
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    cargo: '',
    empresaId: '1',
    sedeId: '1',
    sueldoBase: 1500,
    afp: 'integra',
    asigFamiliar: true,
    regimen: 'D.L. 728',
  };

  filteredWorkers = computed(() => {
    const s = this.search.toLowerCase();
    const sede = this.selectedSede;
    const est = this.selectedEstado;

    return this.apiService.workers().filter(w => {
      const matchSearch = !s ||
        w.nombre.toLowerCase().includes(s) ||
        w.dni.includes(s) ||
        w.cargo.toLowerCase().includes(s);
      const matchSede = !sede || String(w.sedeId) === String(sede);
      const matchEstado = !est || w.estado === est;
      return matchSearch && matchSede && matchEstado;
    });
  });

  getSedeNombre(sedeId: string): string {
    return this.sedes.find(s => s.id === String(sedeId))?.nombre || 'Sede Principal';
  }

  getAfpNombre(afpId: string): string {
    return this.afps.find(a => a.id === afpId)?.nombre || (afpId ? afpId.toUpperCase() : 'AFP');
  }

  async handleCreateWorker() {
    if (!this.form.dni || !this.form.nombres || !this.form.apellidoPaterno || !this.form.cargo || !this.form.sueldoBase) {
      this.toastService.show('Por favor completa todos los campos requeridos.', 'error');
      return;
    }

    const apMaterno = this.form.apellidoMaterno.trim() || this.form.apellidoPaterno.trim();
    const fullName = `${this.form.nombres.trim()} ${this.form.apellidoPaterno.trim()} ${apMaterno}`.trim();

    const data: Partial<Trabajador> = {
      dni: this.form.dni.trim(),
      nombre: fullName,
      cargo: this.form.cargo.trim(),
      empresaId: this.form.empresaId,
      sedeId: this.form.sedeId,
      sueldoBase: Number(this.form.sueldoBase),
      afp: this.form.afp,
      asigFamiliar: this.form.asigFamiliar,
      regimen: this.form.regimen,
      email: `${this.form.nombres.toLowerCase().replace(/\s+/g, '.')}@empresa.com`,
      telefono: '999 888 777'
    };

    const res = await this.apiService.crearTrabajador(data);
    if (res) {
      this.showNewModal.set(false);
      this.toastService.show(`Colaborador ${res.nombre} registrado con éxito.`, 'success');
      this.form = {
        dni: '',
        nombres: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        cargo: '',
        empresaId: '1',
        sedeId: '1',
        sueldoBase: 1500,
        afp: 'integra',
        asigFamiliar: true,
        regimen: 'D.L. 728',
      };
    }
  }
}

