import { Injectable, inject, signal } from '@angular/core';
import { Worker, VacationRequest } from '../models/types';
import { INITIAL_WORKERS, INITIAL_VACACIONES_REQUESTS, createTareoCompleto } from '../data/mock-data';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class PlanillasStateService {
  private api = inject(ApiService);

  readonly workers = signal<Worker[]>(INITIAL_WORKERS);
  readonly requests = signal<VacationRequest[]>(INITIAL_VACACIONES_REQUESTS);
  readonly activeNav = signal<string>('dashboard');
  readonly selectedSede = signal<string>('1');
  readonly selectedPeriodo = signal<string>('2026-09');
  readonly isSidebarOpen = signal<boolean>(true);
  readonly viewZoom = signal<number>(this.getInitialZoom());
  readonly loading = signal<boolean>(false);
  readonly lastUpdate = signal<string>(
    new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  private getInitialZoom(): number {
    try {
      const saved = localStorage.getItem('planilla_view_zoom');
      return saved ? Number(saved) : 100;
    } catch {
      return 100;
    }
  }

  setZoom(zoom: number): void {
    this.viewZoom.set(zoom);
    try {
      localStorage.setItem('planilla_view_zoom', String(zoom));
    } catch {
      // storage disabled
    }
  }

  setNav(nav: string): void {
    if (this.activeNav() !== nav) {
      this.loading.set(true);
      this.activeNav.set(nav);
      setTimeout(() => {
        this.loading.set(false);
      }, 250);
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update((v) => !v);
  }

  syncWithDatabase(): void {
    this.api.getTrabajadores({ size: 100 }).subscribe((apiWorkers) => {
      if (!apiWorkers || apiWorkers.length === 0) return;

      this.api.getSedes().subscribe((sedesList) => {
        const sedesIds = sedesList && sedesList.length > 0 ? sedesList.map((s) => s.id) : [1, 2, 3, 4, 5, 6];

        // Mapear y enriquecer
        const enriched: Worker[] = apiWorkers.map((t: any) => {
          const matchExisting = INITIAL_WORKERS.find((w) => w.dni === t.numeroDocumento);
          return {
            id: t.id,
            dni: t.numeroDocumento,
            nombre: t.nombreCompleto || `${t.nombres} ${t.apellidoPaterno} ${t.apellidoMaterno}`,
            cargo: t.cargo,
            empresaId: String(t.empresaId || 1),
            sedeId: String(t.sedeId || 1),
            sueldoBase: Number(t.sueldoBasico) || 1500,
            afp: matchExisting ? matchExisting.afp : 'integra',
            asigFamiliar: matchExisting ? matchExisting.asigFamiliar : true,
            estado: matchExisting ? matchExisting.estado : 'Activo',
            fechaIngreso: t.fechaIngreso || '2023-01-15',
            regimen: 'D.L. 728',
            email: `${(t.nombres || 'colab').toLowerCase().split(' ')[0]}.${(t.apellidoPaterno || 'corp').toLowerCase()}@empresa.com`,
            telefono: matchExisting ? matchExisting.telefono : '984 123 456',
            tareo: matchExisting ? matchExisting.tareo : createTareoCompleto(['D', 'D', 'D', 'D', 'DL', 'DL', 'D']),
          };
        });

        this.workers.set(enriched);
        this.lastUpdate.set(
          new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
      });
    });
  }

  addWorker(newWorker: Partial<Worker>): Worker {
    const nextId = Math.max(...this.workers().map((w) => w.id), 0) + 1;
    const fullWorker: Worker = {
      id: nextId,
      dni: newWorker.dni || '',
      nombre: newWorker.nombre || '',
      cargo: newWorker.cargo || '',
      empresaId: newWorker.empresaId || '1',
      sedeId: newWorker.sedeId || '1',
      sueldoBase: Number(newWorker.sueldoBase) || 1500,
      afp: newWorker.afp || 'integra',
      asigFamiliar: Boolean(newWorker.asigFamiliar),
      estado: 'Activo',
      fechaIngreso: newWorker.fechaIngreso || new Date().toISOString().slice(0, 10),
      regimen: newWorker.regimen || 'D.L. 728',
      email: newWorker.email || `${newWorker.dni}@empresa.com`,
      telefono: newWorker.telefono || '984 123 456',
      tareo: createTareoCompleto(['D', 'D', 'D', 'D', 'DL', 'DL', 'D']),
    };

    this.workers.update((list) => [fullWorker, ...list]);
    return fullWorker;
  }

  updateMarcacion(trabajadorId: number, diaIndex: number, newCode: string): void {
    this.workers.update((list) =>
      list.map((w) => {
        if (w.id === trabajadorId) {
          const updatedTareo = [...w.tareo];
          updatedTareo[diaIndex] = newCode;
          return { ...w, tareo: updatedTareo };
        }
        return w;
      })
    );

    const fecha = `2026-09-${String(diaIndex + 1).padStart(2, '0')}`;
    this.api.updateMarcacion({
      trabajadorId,
      sedeId: 1,
      fecha,
      codigoAsistencia: newCode,
    }).subscribe();
  }

  addVacationRequest(req: VacationRequest): void {
    this.requests.update((prev) => [req, ...prev]);
  }

  completeAllTareo(): void {
    this.workers.update((list) =>
      list.map((w) => ({
        ...w,
        tareo: createTareoCompleto(w.tareo || ['D', 'D', 'D', 'D', 'DL', 'DL', 'D']),
      }))
    );
  }
}

