import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Empresa, Sede } from '../models/empresa.model';
import { Trabajador } from '../models/trabajador.model';
import { MarcacionUpdate, MatrizAsistenciaResponse } from '../models/asistencia.model';
import { PlanillaItem, ResumenPlanilla } from '../models/planilla.model';
import {
  EMPRESAS,
  SEDES,
  INITIAL_WORKERS,
  createTareoCompleto,
  calcularPlanillaTrabajador
} from '../data/mock-data';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = '/api/v1';

  // Reactividad global compartida
  empresas = signal<Empresa[]>(EMPRESAS);
  sedes = signal<Sede[]>(SEDES);
  activeEmpresa = signal<Empresa>(EMPRESAS[0]);
  activeSede = signal<Sede>(SEDES[0]);
  workers = signal<Trabajador[]>(INITIAL_WORKERS);
  loading = signal<boolean>(false);
  lastUpdate = signal<string>(new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }));

  constructor(private http: HttpClient) {}

  async getSedes(empresaId?: string): Promise<Sede[]> {
    try {
      let params = new HttpParams();
      if (empresaId) params = params.set('empresaId', empresaId);
      const res = await firstValueFrom(this.http.get<any>(`${this.baseUrl}/sedes`, { params }));
      if (res && !res.offline && Array.isArray(res)) {
        this.sedes.set(res);
        return res;
      }
      return SEDES;
    } catch {
      return SEDES;
    }
  }

  async getTrabajadores(options: {
    empresaId?: string;
    sedeId?: string;
    search?: string;
    page?: number;
    size?: number;
  } = {}): Promise<Trabajador[]> {
    try {
      let params = new HttpParams();
      if (options.empresaId) params = params.set('empresaId', options.empresaId);
      if (options.sedeId) params = params.set('sedeId', options.sedeId);
      if (options.search) params = params.set('search', options.search);
      if (options.page !== undefined) params = params.set('page', options.page.toString());
      if (options.size !== undefined) params = params.set('size', options.size.toString());

      const res = await firstValueFrom(this.http.get<any>(`${this.baseUrl}/trabajadores`, { params }));
      if (res && !res.offline && res.content) {
        return res.content;
      }
      return this.workers();
    } catch {
      return this.workers();
    }
  }

  async crearTrabajador(trabajadorData: Partial<Trabajador>): Promise<Trabajador | null> {
    try {
      const res = await firstValueFrom(
        this.http.post<Trabajador>(`${this.baseUrl}/trabajadores`, trabajadorData)
      );
      if (res) {
        this.workers.update(list => [res, ...list]);
        return res;
      }
      return null;
    } catch {
      // Fallback local si backend está desconectado
      const nuevo: Trabajador = {
        id: Date.now(),
        dni: trabajadorData.dni || '00000000',
        nombre: trabajadorData.nombre || 'Nuevo Colaborador',
        cargo: trabajadorData.cargo || 'Operario',
        empresaId: trabajadorData.empresaId || this.activeEmpresa().id,
        sedeId: trabajadorData.sedeId || this.activeSede().id,
        sueldoBase: trabajadorData.sueldoBase || 1500,
        afp: trabajadorData.afp || 'integra',
        asigFamiliar: !!trabajadorData.asigFamiliar,
        estado: 'Activo',
        fechaIngreso: trabajadorData.fechaIngreso || new Date().toISOString().split('T')[0],
        regimen: trabajadorData.regimen || 'D.L. 728',
        email: trabajadorData.email || 'colaborador@empresa.com',
        telefono: trabajadorData.telefono || '999 888 777',
        tareo: createTareoCompleto(['D', 'D', 'D', 'D', 'DL', 'DL', 'D'])
      };
      this.workers.update(list => [nuevo, ...list]);
      return nuevo;
    }
  }

  async getMatrizAsistencia(mes = 9, anio = 2026, sedeId = 1): Promise<MatrizAsistenciaResponse | null> {
    try {
      const params = new HttpParams()
        .set('mes', mes.toString())
        .set('anio', anio.toString())
        .set('sedeId', sedeId.toString());
      const res = await firstValueFrom(
        this.http.get<MatrizAsistenciaResponse>(`${this.baseUrl}/asistencia/matriz`, { params })
      );
      if (res && !res.offline) return res;
      return null;
    } catch {
      return null;
    }
  }

  async updateMarcacion(update: MarcacionUpdate): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.put(`${this.baseUrl}/asistencia/marcacion`, {
          ...update,
          observacion: update.observacion || 'Actualizado desde frontend Angular',
          usuario: update.usuario || 'admin'
        })
      );
      return true;
    } catch {
      // Actualizar en memoria local si no hay backend
      this.workers.update(list =>
        list.map(w => {
          if (w.id === update.trabajadorId && w.tareo) {
            const fecha = new Date(update.fecha);
            const diaIndex = fecha.getDate() - 1;
            const nuevoTareo = [...w.tareo];
            if (diaIndex >= 0 && diaIndex < nuevoTareo.length) {
              nuevoTareo[diaIndex] = update.codigoAsistencia;
            }
            return { ...w, tareo: nuevoTareo };
          }
          return w;
        })
      );
      return true;
    }
  }

  async calcularPlanilla(periodo = '202609', empresaId = 1): Promise<any> {
    try {
      const p = String(periodo).replace('-', '');
      return await firstValueFrom(
        this.http.post(`${this.baseUrl}/planilla/calcular`, { periodo: p, empresaId })
      );
    } catch {
      // Fallback cálculo local
      const items = this.workers().map(w => calcularPlanillaTrabajador(w));
      const totalBruto = items.reduce((sum, i) => sum + i.totalBruto, 0);
      const totalDescuentos = items.reduce((sum, i) => sum + i.totalDescuentos, 0);
      const totalNeto = items.reduce((sum, i) => sum + i.netoPagar, 0);
      const totalEsSalud = items.reduce((sum, i) => sum + i.aporteEsSalud, 0);

      const resumen: ResumenPlanilla = {
        periodo,
        totalTrabajadores: items.length,
        totalBruto,
        totalDescuentos,
        totalNeto,
        totalEsSalud,
        estado: 'Calculado',
        detalles: items
      };
      return resumen;
    }
  }

  async cerrarPlanilla(periodo = '202609', empresaId = 1, usuarioCierre = 'Admin'): Promise<any> {
    try {
      const p = String(periodo).replace('-', '');
      return await firstValueFrom(
        this.http.post(`${this.baseUrl}/planilla/cerrar`, { periodo: p, empresaId, usuarioCierre })
      );
    } catch {
      return { ok: true, mensaje: 'Planilla cerrada satisfactoriamente (modo local)', periodo };
    }
  }

  async getResumenPlanilla(periodo = '202609'): Promise<ResumenPlanilla | null> {
    try {
      const p = String(periodo).replace('-', '');
      const params = new HttpParams().set('periodo', p);
      return await firstValueFrom(
        this.http.get<ResumenPlanilla>(`${this.baseUrl}/planilla/resumen`, { params })
      );
    } catch {
      return null;
    }
  }

  async getBoletaTrabajador(trabajadorId: number, periodo = '202609'): Promise<any> {
    try {
      const p = String(periodo).replace('-', '');
      const params = new HttpParams().set('periodo', p);
      return await firstValueFrom(
        this.http.get<any>(`${this.baseUrl}/planilla/boleta/${trabajadorId}`, { params })
      );
    } catch {
      const worker = this.workers().find(w => w.id === trabajadorId);
      if (worker) {
        return calcularPlanillaTrabajador(worker);
      }
      return null;
    }
  }
}

