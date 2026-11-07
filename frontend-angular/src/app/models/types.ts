export interface Worker {
  id: number;
  dni: string;
  nombre: string;
  cargo: string;
  empresaId: string;
  sedeId: string;
  sueldoBase: number;
  afp: string;
  asigFamiliar: boolean;
  estado: string; // 'Activo' | 'Vacaciones' | 'Inactivo'
  fechaIngreso: string;
  regimen: string;
  email: string;
  telefono: string;
  tareo: string[];
  record?: VacationRecord;
}

export interface Empresa {
  id: string;
  nombre: string;
  ruc: string;
  direccion: string;
}

export interface Sede {
  id: string;
  empresaId: string;
  codigo: string;
  nombre: string;
  ciudad?: string;
  departamento?: string;
}

export interface Afp {
  id: string;
  nombre: string;
  aporte: number;
  comision: number;
  prima: number;
}

export interface BadgeConfigItem {
  label: string;
  desc: string;
  cls: string;
}

export interface VacationRequest {
  id: string;
  trabajadorId: number;
  nombre?: string;
  dni?: string;
  sedeId?: string;
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
  dias: number;
  tipo: string; // 'Goce Regular' | 'Fraccionamiento' | 'Venta de Vacaciones'
  estado: string; // 'Aprobada' | 'En Goce' | 'Finalizada' | 'Pendiente'
  fechaRegistro: string;
  documento?: string;
  aprobador?: string;
  aprobadoPor?: string;
  observaciones?: string;
}

export interface PlanillaCalculada {
  trabajadorId: number;
  nombre: string;
  dni: string;
  cargo: string;
  sede?: string;
  afp?: string;
  cuspp?: string;
  diasTrabajados?: number;
  diasDescanso?: number;
  diasVacaciones?: number;
  diasFalta?: number;
  sueldoBase: number;
  basicoProporcional?: number;
  asigFamiliar?: number;
  asignacionFamiliar?: number;
  sobretasaNocturna?: number;
  horasExtrasHoras?: number;
  horasExtrasMonto?: number;
  bonificaciones?: number;
  totalIngresos?: number;
  totalBruto?: number;
  afpMonto?: number;
  descuentoPension?: number;
  detallePension?: any;
  descuentoFaltas?: number;
  quintaCategoria?: number;
  renta5ta?: number;
  totalDescuentos?: number;
  netoPagar?: number;
  essalud?: number;
  aporteEsSalud?: number;
  sctr?: number;
}

export interface VacationRecord {
  diasGanados: number;
  diasGozados: number;
  totalGozados: number;
  totalVendidos: number;
  saldoPendiente: number;
  aniosCompletos: number;
  estadoRecord: string;
  estadoCls: string;
  alertaRiesgo: boolean;
}

export interface User {
  name: string;
  email: string;
  originalEmail: string;
  role: string;
  avatarText: string;
}

export interface ToastMessage {
  id?: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}
