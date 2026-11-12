export interface SolicitudVacacion {
  id: string;
  trabajadorId: number;
  fechaInicio: string;
  fechaFin: string;
  dias: number;
  tipo: string;
  periodo: string;
  estado: 'Pendiente' | 'Aprobada' | 'En Goce' | 'Finalizada' | 'Rechazada' | 'Programada';
  documento: string;
  observaciones: string;
  aprobadoPor: string | null;
  fechaRegistro: string;
}

export interface RecordVacacional {
  aniosCompletos: number;
  diasGanados: number;
  diasGozados: number;
  diasVendidos: number;
  saldoPendiente: number;
  estadoRecord: string;
  estadoCls: string;
  periodoActual: string;
  ultimoGoce: string;
}

