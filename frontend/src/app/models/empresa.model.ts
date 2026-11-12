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
  ciudad: string;
  departamento: string;
}

