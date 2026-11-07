import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 max-w-4xl">
      <!-- HEADER -->
      <div class="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <svg class="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-slate-900 tracking-tight">
                Perfil de Usuario & Credenciales
              </h1>
              <p class="text-xs text-slate-500 mt-0.5">
                Información de cuenta, rol administrativo y configuración de seguridad.
              </p>
            </div>
          </div>
        </div>

        <button
          (click)="saveProfile()"
          class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
          </svg>
          <span>Guardar Cambios</span>
        </button>
      </div>

      <!-- TARJETA PRINCIPAL DEL PERFIL -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
        <!-- Hero Perfil -->
        <div class="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div class="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white font-extrabold text-xl flex items-center justify-center shadow-md ring-4 ring-blue-50 shrink-0">
            {{ auth.currentUser()?.avatarText || 'AD' }}
            <span class="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500"></span>
          </div>

          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ auth.currentUser()?.name || 'Administrador' }}</h2>
            <p class="text-xs text-slate-500 font-mono">{{ auth.currentUser()?.email || 'admin@empresa.com' }}</p>
            <span class="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Rol: {{ auth.currentUser()?.role || 'Administrador General' }}
            </span>
          </div>
        </div>

        <!-- Campos de Datos Personales -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nombre Completo</label>
            <input
              type="text"
              [(ngModel)]="profileName"
              class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Correo Corporativo</label>
            <input
              type="email"
              [(ngModel)]="profileEmail"
              class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Teléfono Móvil</label>
            <input
              type="text"
              [(ngModel)]="profilePhone"
              class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Sede Asignada</label>
            <input
              type="text"
              readonly
              value="Sede Central - Lima"
              class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PerfilComponent {
  auth = inject(AuthService);
  toast = inject(ToastService);

  profileName = this.auth.currentUser()?.name || 'Administrador General';
  profileEmail = this.auth.currentUser()?.email || 'admin@empresa.com';
  profilePhone = '+51 984 123 456';

  saveProfile(): void {
    this.toast.show('Datos de perfil actualizados con éxito.', 'success');
  }
}

