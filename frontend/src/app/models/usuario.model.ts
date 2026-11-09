export interface Usuario {
  username: string;
  nombre: string;
  rol: 'Admin' | 'Operador' | 'RRHH';
  email: string;
  empresaId: string;
  sedeId: string;
}

