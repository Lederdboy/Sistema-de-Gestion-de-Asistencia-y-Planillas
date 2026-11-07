import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/v1';

  getSedes(empresaId?: string): Observable<any[] | null> {
    let params = new HttpParams();
    if (empresaId) params = params.set('empresaId', empresaId);
    return this.http.get<any>(`${this.baseUrl}/sedes`, { params }).pipe(
      map((data) => (data?.offline ? null : data)),
      catchError(() => of(null))
    );
  }

  getTrabajadores(opts: { empresaId?: string; sedeId?: string; search?: string; page?: number; size?: number } = {}): Observable<any[] | null> {
    let params = new HttpParams()
      .set('page', String(opts.page ?? 0))
      .set('size', String(opts.size ?? 100));

    if (opts.empresaId) params = params.set('empresaId', opts.empresaId);
    if (opts.sedeId) params = params.set('sedeId', opts.sedeId);
    if (opts.search) params = params.set('search', opts.search);

    return this.http.get<any>(`${this.baseUrl}/trabajadores`, { params }).pipe(
      map((data) => (data?.offline ? null : data?.content || [])),
      catchError(() => of(null))
    );
  }

  getMatrizAsistencia(mes = 9, anio = 2026, sedeId = 1): Observable<any[] | null> {
    const params = new HttpParams()
      .set('mes', String(mes))
      .set('anio', String(anio))
      .set('sedeId', String(sedeId));

    return this.http.get<any>(`${this.baseUrl}/asistencia/matriz`, { params }).pipe(
      map((data) => (data?.offline ? null : data)),
      catchError(() => of(null))
    );
  }

  updateMarcacion(payload: { trabajadorId: number; sedeId: number; fecha: string; codigoAsistencia: string; observacion?: string }): Observable<boolean> {
    const body = {
      trabajadorId: payload.trabajadorId,
      fecha: payload.fecha,
      codigoAsistencia: payload.codigoAsistencia,
      observacion: payload.observacion || 'Actualizado desde Angular frontend',
      usuario: 'admin',
    };
    return this.http.put(`${this.baseUrl}/asistencia/marcacion`, body, { observe: 'response' }).pipe(
      map((res) => res.status >= 200 && res.status < 300),
      catchError(() => of(false))
    );
  }

  crearTrabajador(trabajadorData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/trabajadores`, trabajadorData).pipe(
      catchError((err) => {
        console.error('Error al registrar trabajador:', err);
        return of(null);
      })
    );
  }

  calcularPlanilla(periodo = '202609', empresaId = 1): Observable<any> {
    const p = String(periodo).replace('-', '');
    return this.http.post<any>(`${this.baseUrl}/planilla/calcular`, { periodo: p, empresaId }).pipe(
      catchError(() => of(null))
    );
  }

  cerrarPlanilla(periodo = '202609', empresaId = 1, usuarioCierre = 'Admin'): Observable<any> {
    const p = String(periodo).replace('-', '');
    return this.http.post<any>(`${this.baseUrl}/planilla/cerrar`, { periodo: p, empresaId, usuarioCierre }).pipe(
      catchError(() => of(null))
    );
  }

  getResumenPlanilla(periodo = '202609'): Observable<any> {
    const p = String(periodo).replace('-', '');
    return this.http.get<any>(`${this.baseUrl}/planilla/resumen?periodo=${p}`).pipe(
      catchError(() => of(null))
    );
  }

  getBoletaTrabajador(trabajadorId: number, periodo = '202609'): Observable<any> {
    const p = String(periodo).replace('-', '');
    return this.http.get<any>(`${this.baseUrl}/planilla/boleta/${trabajadorId}?periodo=${p}`).pipe(
      catchError(() => of(null))
    );
  }
}

