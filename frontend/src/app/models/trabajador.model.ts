export interface AFP {
  id: string;
  nombre: string;
  aporte: number;
  comision: number;
  prima: number;
}

export interface Trabajador {
  id: number;
  dni: string;
  nombre: string;
  cargo: string;
  empresaId: string;
  sedeId: string;
  sueldoBase: number;
  afp: string;
  asigFamiliar: boolean;
  estado: string;
  fechaIngreso: string;
  regimen: string;
  email: string;
  telefono: string;
  tareo?: string[];
}

export interface ParametrosLaborales {
  rmv: number;
  asigFamiliar: number;
  essaludPorcentaje: number;
  sctrPorcentaje: number;
  uit: number;
  jornadaHoras: number;
}

