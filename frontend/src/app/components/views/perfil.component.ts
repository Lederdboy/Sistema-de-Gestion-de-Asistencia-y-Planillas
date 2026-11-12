import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-4">
      <!-- Header -->
      <div class="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-bold text-slate-900">Perfil de Usuario</h1>
            <p class="text-xs text-slate-500 mt-0.5">Información de cuenta y datos del colaborador activo</p>
          </div>
          <button
            type="button"
            (click)="isEditing.set(!isEditing())"
            class="px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer"
            [ngClass]="isEditing() ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'"
          >
            {{ isEditing() ? 'Cancelar Edición' : 'Editar Datos' }}
          </button>
        </div>
      </div>

      <!-- Main Profile Card -->
      <div class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-6">
        <!-- Avatar and Banner -->
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
            {{ authService.user()?.avatarText || 'AD' }}
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ profile.nombre }}</h2>
            <p class="text-xs text-slate-500">{{ profile.cargo }} · {{ profile.departamento }}</p>
            <span class="inline-flex mt-1 items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Sesión Activa
            </span>
          </div>
        </div>

        <!-- Form / Info Grid -->
        <form (ngSubmit)="handleSave()" class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nombre Completo</label>
            <input
              type="text"
              [(ngModel)]="profile.nombre"
              name="nombre"
              [disabled]="!isEditing()"
              class="w-full h-9 px-3 border border-slate-200 rounded-lg bg-slate-50 disabled:bg-slate-100/70 text-slate-800"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              [(ngModel)]="profile.email"
              name="email"
              [disabled]="!isEditing()"
              class="w-full h-9 px-3 border border-slate-200 rounded-lg bg-slate-50 disabled:bg-slate-100/70 text-slate-800"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Teléfono Corporativo</label>
            <input
              type="text"
              [(ngModel)]="profile.telefono"
              name="telefono"
              [disabled]="!isEditing()"
              class="w-full h-9 px-3 border border-slate-200 rounded-lg bg-slate-50 disabled:bg-slate-100/70 text-slate-800"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Sede de Asignación</label>
            <input
              type="text"
              [(ngModel)]="profile.sede"
              name="sede"
              disabled
              class="w-full h-9 px-3 border border-slate-200 rounded-lg bg-slate-100 text-slate-600"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Rol en Sistema</label>
            <input
              type="text"
              [(ngModel)]="profile.cargo"
              name="cargo"
              disabled
              class="w-full h-9 px-3 border border-slate-200 rounded-lg bg-slate-100 text-slate-600"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Fecha de Ingreso</label>
            <input
              type="text"
              [(ngModel)]="profile.fechaIngreso"
              name="fechaIngreso"
              disabled
              class="w-full h-9 px-3 border border-slate-200 rounded-lg bg-slate-100 text-slate-600"
            />
          </div>

          @if (isEditing()) {
            <div class="sm:col-span-2 pt-3 flex justify-end">
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
              >
                Guardar Cambios
              </button>
            </div>
          }
        </form>
      </div>
    </div>
  `
})
export class PerfilComponent {
  authService = inject(AuthService);
  toastService = inject(ToastService);

  isEditing = signal<boolean>(false);

  profile = {
    nombre: this.authService.user()?.name || 'Carlos Mendoza (Admin)',
    email: this.authService.user()?.email || 'carlos.mendoza@minera-andina.com',
    telefono: '+51 987 654 321',
    cargo: this.authService.user()?.role || 'Administrador General',
    departamento: 'Gerencia de Recursos Humanos',
    sede: 'Sede Principal - San Isidro',
    fechaIngreso: '15/03/2020',
  };

  handleSave() {
    this.isEditing.set(false);
    this.toastService.show('Datos de perfil actualizados exitosamente.', 'success');
  }
}

