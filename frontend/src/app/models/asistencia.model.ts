export type CodigoAsistencia = 'D' | 'N' | 'F' | 'DL' | 'V' | 'M';

export interface BadgeConfigItem {
  label: string;
  desc: string;
  cls: string;
}

export type BadgeConfigMap = Record<string, BadgeConfigItem>;

export interface MarcacionUpdate {
  trabajadorId: number;
  sedeId?: string | number;
  fecha: string;
  codigoAsistencia: CodigoAsistencia | string;
  observacion?: string;
  usuario?: string;
}

export interface MatrizAsistenciaResponse {
  mes: number;
  anio: number;
  sedeId: number;
  dias: number;
  trabajadores: {
    trabajadorId: number;
    nombre: string;
    dni: string;
    cargo: string;
    marcaciones: Record<number, string>;
  }[];
  offline?: boolean;
}

