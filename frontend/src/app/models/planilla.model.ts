export interface DetallePension {
  fondo: number;
  comision: number;
  prima: number;
}

export interface PlanillaItem {
  trabajadorId: number;
  dni: string;
  nombre: string;
  cargo: string;
  diasTrabajados: number;
  diasDescanso: number;
  diasVacaciones: number;
  diasFalta: number;
  sueldoBase: number;
  basicoProporcional: number;
  asigFamiliar: number;
  sobretasaNocturna: number;
  totalBruto: number;
  afp: string;
  descuentoPension: number;
  detallePension: DetallePension;
  descuentoFaltas: number;
  renta5ta: number;
  totalDescuentos: number;
  netoPagar: number;
  aporteEsSalud: number;
}

export interface ResumenPlanilla {
  periodo: string;
  empresaId?: string;
  totalTrabajadores: number;
  totalBruto: number;
  totalDescuentos: number;
  totalNeto: number;
  totalEsSalud: number;
  estado: 'Borrador' | 'Calculado' | 'Cerrado';
  detalles?: PlanillaItem[];
}

