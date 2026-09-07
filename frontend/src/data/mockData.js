// ─── Configuración de Badges de Asistencia ─────────────────────────────────
export const BADGE_CONFIG = {
  D:  { label: 'D',  desc: 'Día',        cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  N:  { label: 'N',  desc: 'Noche',      cls: 'bg-indigo-100 text-indigo-700 border-indigo-200'   },
  F:  { label: 'F',  desc: 'Falta',      cls: 'bg-rose-100 text-rose-700 border-rose-200'       },
  DL: { label: 'DL', desc: 'Desc. Ley',  cls: 'bg-sky-100 text-sky-700 border-sky-200'         },
  V:  { label: 'V',  desc: 'Vacaciones', cls: 'bg-amber-100 text-amber-700 border-amber-200'     },
  M:  { label: 'M',  desc: 'Mixto',      cls: 'bg-purple-100 text-purple-700 border-purple-200'   },
}

// ─── Empresas y Sedes Reales desde SistemaPlanillasDB ───────────────────────
export const EMPRESAS = [
  { id: '1', nombre: 'SERVICIOS CORPORATIVOS DE ASISTENCIA S.A.C.', ruc: '20100088899', direccion: 'Av. Javier Prado Este 456, San Isidro, Lima' },
  { id: '2', nombre: 'Minera Andina S.A.', ruc: '20489123891', direccion: 'Av. Las Camelias 450, San Isidro, Lima' },
]

export const SEDES = [
  { id: '1', empresaId: '1', codigo: 'SED-001', nombre: 'Sede Central - San Isidro', ciudad: 'Lima', departamento: 'Lima' },
  { id: '2', empresaId: '1', codigo: 'SED-002', nombre: 'Planta Operativa - Lurín', ciudad: 'Lima Sur', departamento: 'Lima' },
  { id: '3', empresaId: '1', codigo: 'SED-003', nombre: 'Almacén Principal - Callao', ciudad: 'Callao', departamento: 'Callao' },
  { id: '4', empresaId: '1', codigo: 'SED-004', nombre: 'Sede Arequipa - Parque Industrial', ciudad: 'Arequipa', departamento: 'Arequipa' },
  { id: '5', empresaId: '1', codigo: 'SED-005', nombre: 'Sede Cusco - Mina Antapaccay', ciudad: 'Espinar', departamento: 'Cusco' },
  { id: '6', empresaId: '1', codigo: 'SED-006', nombre: 'Sede Trujillo - Zona Franca', ciudad: 'Trujillo', departamento: 'La Libertad' },
]

// ─── Sistema de Pensiones (Perú) ───────────────────────────────────────────
export const AFPS = [
  { id: 'integra',   nombre: 'AFP Integra',   aporte: 0.10, comision: 0.0155, prima: 0.0170 },
  { id: 'prima',     nombre: 'AFP Prima',     aporte: 0.10, comision: 0.0160, prima: 0.0170 },
  { id: 'profuturo', nombre: 'AFP Profuturo', aporte: 0.10, comision: 0.0169, prima: 0.0170 },
  { id: 'habitat',   nombre: 'AFP Hábitat',   aporte: 0.10, comision: 0.0147, prima: 0.0170 },
  { id: 'onp',       nombre: 'ONP',           aporte: 0.13, comision: 0.0000, prima: 0.0000 },
]

// ─── Parámetros Laborales ──────────────────────────────────────────────────
export const PARAMETROS_LABORALES = {
  rmv: 1025.00,
  asigFamiliar: 102.50,
  essaludPorcentaje: 0.09,
  sctrPorcentaje: 0.015,
  uit: 5150.00,
  jornadaHoras: 8,
}

// ─── Helper de Tareo Registrado hasta el Día de Hoy (07 de Setiembre) ───────
// Días 1 a 7 registrados; días 8 a 30 pendientes/futuros
const createTareoHastaHoy = (patron7Dias) => {
  const result = [...patron7Dias]
  for (let i = 7; i < 30; i++) {
    const dayOfWeek = (i + 1) % 7
    result.push(dayOfWeek === 0 || dayOfWeek === 6 ? 'DL' : null)
  }
  return result
}

// ─── 16 Colaboradores Registrados en SistemaPlanillasDB ──────────────────────
export const INITIAL_WORKERS = [
  {
    id: 1,
    dni: '45891234',
    nombre: 'Pérez Gómez, Juan Carlos',
    cargo: 'Analista de Planillas',
    empresaId: '1',
    sedeId: '1',
    sueldoBase: 3500.00,
    afp: 'integra',
    asigFamiliar: true,
    estado: 'Activo',
    fechaIngreso: '2022-03-15',
    regimen: 'D.L. 728',
    email: 'juan.perez@empresa.com',
    telefono: '984 123 456',
    tareo: createTareoHastaHoy(['D','D','D','D','DL','DL','D']),
  },
  {
    id: 2,
    dni: '71234567',
    nombre: 'Torres Rojas, Maria Elena',
    cargo: 'Supervisora de Operaciones',
    empresaId: '1',
    sedeId: '1',
    sueldoBase: 4200.00,
    afp: 'prima',
    asigFamiliar: true,
    estado: 'Activo',
    fechaIngreso: '2021-06-01',
    regimen: 'D.L. 728',
    email: 'maria.torres@empresa.com',
    telefono: '951 876 543',
    tareo: createTareoHastaHoy(['D','D','D','D','DL','DL','D']),
  },
  {
    id: 3,
    dni: '40987654',
    nombre: 'Mendoza Vargas, Carlos Alberto',
    cargo: 'Operario de Almacén',
    empresaId: '1',
    sedeId: '2',
    sueldoBase: 1800.00,
    afp: 'profuturo',
    asigFamiliar: false,
    estado: 'Activo',
    fechaIngreso: '2023-01-10',
    regimen: 'D.L. 728',
    email: 'carlos.mendoza@empresa.com',
    telefono: '942 334 112',
    tareo: createTareoHastaHoy(['D','D','D','D','DL','DL','D']),
  },
  {
    id: 4,
    dni: '45123890',
    nombre: 'García Ríos, Carlos A.',
    cargo: 'Operario de Planta',
    empresaId: '1',
    sedeId: '1',
    sueldoBase: 1450.00,
    afp: 'integra',
    asigFamiliar: true,
    estado: 'Activo',
    fechaIngreso: '2022-03-15',
    regimen: 'D.L. 728',
    email: 'carlos.garcia@empresa.com',
    telefono: '984 123 456',
    tareo: createTareoHastaHoy(['D','D','N','D','DL','DL','D']),
  },
  {
    id: 5,
    dni: '72345612',
    nombre: 'Mamani Quispe, Rosa L.',
    cargo: 'Supervisora de Calidad',
    empresaId: '1',
    sedeId: '1',
    sueldoBase: 2800.00,
    afp: 'prima',
    asigFamiliar: true,
    estado: 'Vacaciones',
    fechaIngreso: '2021-06-01',
    regimen: 'D.L. 728',
    email: 'rosa.mamani@empresa.com',
    telefono: '951 876 543',
    tareo: createTareoHastaHoy(['V','V','V','V','DL','DL','V']),
  },
  {
    id: 6,
    dni: '61987234',
    nombre: 'Torres Vega, Luis M.',
    cargo: 'Técnico Electromecánico',
    empresaId: '1',
    sedeId: '4',
    sueldoBase: 2100.00,
    afp: 'profuturo',
    asigFamiliar: false,
    estado: 'Activo',
    fechaIngreso: '2023-01-10',
    regimen: 'D.L. 728',
    email: 'luis.torres@empresa.com',
    telefono: '942 334 112',
    tareo: createTareoHastaHoy(['N','N','D','D','DL','DL','N']),
  },
  {
    id: 7,
    dni: '48765432',
    nombre: 'Flores Huanca, Ana P.',
    cargo: 'Operaria de Ensamblaje',
    empresaId: '1',
    sedeId: '4',
    sueldoBase: 1350.00,
    afp: 'onp',
    asigFamiliar: true,
    estado: 'Activo',
    fechaIngreso: '2023-08-20',
    regimen: 'D.L. 728',
    email: 'ana.flores@empresa.com',
    telefono: '998 776 221',
    tareo: createTareoHastaHoy(['D','F','D','D','DL','DL','F']),
  },
  {
    id: 8,
    dni: '55432198',
    nombre: 'Condori Puma, Juan C.',
    cargo: 'Almacenero Principal',
    empresaId: '1',
    sedeId: '5',
    sueldoBase: 1600.00,
    afp: 'habitat',
    asigFamiliar: false,
    estado: 'Activo',
    fechaIngreso: '2022-11-05',
    regimen: 'D.L. 728',
    email: 'juan.condori@empresa.com',
    telefono: '976 543 210',
    tareo: createTareoHastaHoy(['D','D','D','D','DL','DL','D']),
  },
  {
    id: 9,
    dni: '43998811',
    nombre: 'Mendoza Vargas, Patricia E.',
    cargo: 'Analista de RRHH',
    empresaId: '1',
    sedeId: '1',
    sueldoBase: 3200.00,
    afp: 'integra',
    asigFamiliar: true,
    estado: 'Activo',
    fechaIngreso: '2020-04-15',
    regimen: 'D.L. 728',
    email: 'patricia.mendoza@empresa.com',
    telefono: '912 345 678',
    tareo: createTareoHastaHoy(['D','D','D','D','DL','DL','D']),
  },
  {
    id: 10,
    dni: '70889922',
    nombre: 'Paredes Castro, Raúl J.',
    cargo: 'Jefe de Operaciones',
    empresaId: '1',
    sedeId: '6',
    sueldoBase: 4500.00,
    afp: 'prima',
    asigFamiliar: true,
    estado: 'Activo',
    fechaIngreso: '2019-09-01',
    regimen: 'D.L. 728',
    email: 'raul.paredes@empresa.com',
    telefono: '933 221 445',
    tareo: createTareoHastaHoy(['D','D','D','D','DL','DL','D']),
  },
  {
    id: 11,
    dni: '46112233',
    nombre: 'Quispe Huamán, Miguel Ángel',
    cargo: 'Operario de Soldadura',
    empresaId: '1',
    sedeId: '2',
    sueldoBase: 1950.00,
    afp: 'integra',
    asigFamiliar: false,
    estado: 'Activo',
    fechaIngreso: '2023-02-14',
    regimen: 'D.L. 728',
    email: 'miguel.quispe@empresa.com',
    telefono: '944 556 677',
    tareo: createTareoHastaHoy(['D','D','D','D','DL','DL','D']),
  },
  {
    id: 12,
    dni: '73221144',
    nombre: 'Salazar Peña, Carmen Rosa',
    cargo: 'Asistente de Logística',
    empresaId: '1',
    sedeId: '3',
    sueldoBase: 1700.00,
    afp: 'onp',
    asigFamiliar: true,
    estado: 'Activo',
    fechaIngreso: '2022-07-01',
    regimen: 'D.L. 728',
    email: 'carmen.salazar@empresa.com',
    telefono: '988 112 233',
    tareo: createTareoHastaHoy(['D','D','D','D','DL','DL','D']),
  },
  {
    id: 13,
    dni: '41556677',
    nombre: 'Chávez Benites, Jorge Luis',
    cargo: 'Mecánico de Mantenimiento',
    empresaId: '1',
    sedeId: '2',
    sueldoBase: 2300.00,
    afp: 'profuturo',
    asigFamiliar: true,
    estado: 'Activo',
    fechaIngreso: '2021-10-20',
    regimen: 'D.L. 728',
    email: 'jorge.chavez@empresa.com',
    telefono: '922 445 566',
    tareo: createTareoHastaHoy(['D','D','D','D','DL','DL','D']),
  },
  {
    id: 14,
    dni: '75889900',
    nombre: 'Ramos Alarcón, Diana Beatriz',
    cargo: 'Inspectora de Seguridad',
    empresaId: '1',
    sedeId: '5',
    sueldoBase: 2600.00,
    afp: 'habitat',
    asigFamiliar: false,
    estado: 'Activo',
    fechaIngreso: '2023-05-11',
    regimen: 'D.L. 728',
    email: 'diana.ramos@empresa.com',
    telefono: '966 778 899',
    tareo: createTareoHastaHoy(['D','D','D','D','DL','DL','D']),
  },
  {
    id: 15,
    dni: '44332211',
    nombre: 'Castillo Silva, Fernando José',
    cargo: 'Conductor de Carga Pesada',
    empresaId: '1',
    sedeId: '3',
    sueldoBase: 2400.00,
    afp: 'integra',
    asigFamiliar: true,
    estado: 'Activo',
    fechaIngreso: '2020-12-03',
    regimen: 'D.L. 728',
    email: 'fernando.castillo@empresa.com',
    telefono: '911 334 455',
    tareo: createTareoHastaHoy(['D','D','D','D','DL','DL','D']),
  },
  {
    id: 16,
    dni: '72114455',
    nombre: 'Morales Rivas, Lucía Fernanda',
    cargo: 'Coordinadora de Almacén',
    empresaId: '1',
    sedeId: '6',
    sueldoBase: 3100.00,
    afp: 'prima',
    asigFamiliar: false,
    estado: 'Activo',
    fechaIngreso: '2022-01-18',
    regimen: 'D.L. 728',
    email: 'lucia.morales@empresa.com',
    telefono: '977 889 900',
    tareo: createTareoHastaHoy(['D','D','D','D','DL','DL','D']),
  },
]

// ─── Utilidades de Cálculo de Planilla ───────────────────────────────────────
export function calcularPlanillaTrabajador(trabajador) {
  const tareo = trabajador.tareo || []
  const diasTrabajados = tareo.filter(c => c === 'D' || c === 'N' || c === 'M').length
  const diasDescanso = tareo.filter(c => c === 'DL').length
  const diasVacaciones = tareo.filter(c => c === 'V').length
  const diasFalta = tareo.filter(c => c === 'F').length
  const totalDiasComputables = diasTrabajados + diasDescanso + diasVacaciones

  // Proporcional de básico según días computables (base 30 días)
  const factorDias = Math.min(30, totalDiasComputables) / 30
  const basicoProporcional = Number((trabajador.sueldoBase * factorDias).toFixed(2))

  // Asignación Familiar (10% de la RMV)
  const asigFamiliar = trabajador.asigFamiliar ? PARAMETROS_LABORALES.asigFamiliar : 0.00

  // Horas nocturnas o extras simuladas
  const noches = tareo.filter(c => c === 'N').length
  const sobretasaNocturna = noches > 0 ? Number((noches * 25).toFixed(2)) : 0.00

  // Total Remuneración Bruta
  const totalBruto = Number((basicoProporcional + asigFamiliar + sobretasaNocturna).toFixed(2))

  // Descuento por Faltas
  const valorDia = trabajador.sueldoBase / 30
  const descuentoFaltas = Number((diasFalta * valorDia).toFixed(2))

  // AFP / ONP
  const afpInfo = AFPS.find(a => a.id === trabajador.afp) || AFPS[0]
  let descuentoPension = 0
  let detallePension = {}

  if (afpInfo.id === 'onp') {
    descuentoPension = Number((totalBruto * afpInfo.aporte).toFixed(2))
    detallePension = { fondo: descuentoPension, comision: 0, prima: 0 }
  } else {
    const aporteFondo = Number((totalBruto * afpInfo.aporte).toFixed(2))
    const comision = Number((totalBruto * afpInfo.comision).toFixed(2))
    const prima = Number((totalBruto * afpInfo.prima).toFixed(2))
    descuentoPension = Number((aporteFondo + comision + prima).toFixed(2))
    detallePension = { fondo: aporteFondo, comision, prima }
  }

  // Renta de 5ta categoría simulada
  const renta5ta = totalBruto > 2800 ? Number(((totalBruto - 2800) * 0.08).toFixed(2)) : 0.00

  // Total Descuentos
  const totalDescuentos = Number((descuentoPension + descuentoFaltas + renta5ta).toFixed(2))

  // Neto a Pagar
  const netoPagar = Number((Math.max(0, totalBruto - totalDescuentos)).toFixed(2))

  // Aporte Empleador (EsSalud 9%)
  const aporteEsSalud = Number((totalBruto * PARAMETROS_LABORALES.essaludPorcentaje).toFixed(2))

  return {
    trabajadorId: trabajador.id,
    dni: trabajador.dni,
    nombre: trabajador.nombre,
    cargo: trabajador.cargo,
    diasTrabajados,
    diasDescanso,
    diasVacaciones,
    diasFalta,
    sueldoBase: trabajador.sueldoBase,
    basicoProporcional,
    asigFamiliar,
    sobretasaNocturna,
    totalBruto,
    afp: afpInfo.nombre,
    descuentoPension,
    detallePension,
    descuentoFaltas,
    renta5ta,
    totalDescuentos,
    netoPagar,
    aporteEsSalud,
  }
}

// ─── Solicitudes Iniciales de Vacaciones ─────────────────────────────────────
export const INITIAL_VACACIONES_REQUESTS = [
  {
    id: 'VAC-2026-001',
    trabajadorId: 5, // Rosa L. Mamani Quispe
    fechaInicio: '2026-09-01',
    fechaFin: '2026-09-15',
    dias: 15,
    tipo: 'Goce Regular',
    periodo: '2024-2025',
    estado: 'En Goce',
    documento: 'SOL-VAC-019',
    observaciones: 'Primer tramo vacacional programado de 15 días calendario.',
    aprobadoPor: 'Carlos Mendoza (Admin)',
    fechaRegistro: '2026-08-25',
  },
  {
    id: 'VAC-2026-002',
    trabajadorId: 4, // Carlos A. García Ríos
    fechaInicio: '2026-09-16',
    fechaFin: '2026-09-30',
    dias: 15,
    tipo: 'Goce Regular',
    periodo: '2024-2025',
    estado: 'Aprobada',
    documento: 'SOL-VAC-022',
    observaciones: 'Segundo periodo acordado con jefatura de planta operativa.',
    aprobadoPor: 'Carlos Mendoza (Admin)',
    fechaRegistro: '2026-08-28',
  },
  {
    id: 'VAC-2026-003',
    trabajadorId: 8, // Juan C. Condori Puma
    fechaInicio: '2026-10-01',
    fechaFin: '2026-10-15',
    dias: 15,
    tipo: 'Goce Regular',
    periodo: '2024-2025',
    estado: 'Programada',
    documento: 'SOL-VAC-028',
    observaciones: 'Programación anual coordinada con sede Cusco.',
    aprobadoPor: 'Carlos Mendoza (Admin)',
    fechaRegistro: '2026-09-02',
  },
  {
    id: 'VAC-2026-004',
    trabajadorId: 1, // Juan Carlos Pérez Gómez
    fechaInicio: '2026-08-01',
    fechaFin: '2026-08-15',
    dias: 15,
    tipo: 'Goce Regular',
    periodo: '2023-2024',
    estado: 'Finalizada',
    documento: 'SOL-VAC-015',
    observaciones: 'Gozado satisfactoriamente durante la primera quincena de agosto.',
    aprobadoPor: 'Carlos Mendoza (Admin)',
    fechaRegistro: '2026-07-20',
  },
  {
    id: 'VAC-2026-005',
    trabajadorId: 3, // Carlos Alberto Mendoza Vargas
    fechaInicio: '2026-07-10',
    fechaFin: '2026-07-25',
    dias: 15,
    tipo: 'Venta de Vacaciones',
    periodo: '2023-2024',
    estado: 'Aprobada',
    documento: 'CONV-RED-008',
    observaciones: 'Convenio de reducción vacacional (venta de 15 días) compensado en nómina.',
    aprobadoPor: 'Carlos Mendoza (Admin)',
    fechaRegistro: '2026-07-05',
  },
  {
    id: 'VAC-2026-006',
    trabajadorId: 11, // Miguel Ángel Quispe Huamán
    fechaInicio: '2026-10-05',
    fechaFin: '2026-10-12',
    dias: 7,
    tipo: 'Fraccionamiento (D.L. 1405)',
    periodo: '2024-2025',
    estado: 'Pendiente',
    documento: 'SOL-VAC-031',
    observaciones: 'Solicitud de fraccionamiento de 7 días continuos por trámite personal.',
    aprobadoPor: null,
    fechaRegistro: '2026-09-05',
  },
]

// ─── Helper de Cálculo de Récord Vacacional ──────────────────────────────────
export const getVacationRecordForWorker = (worker, requests = []) => {
  const workerRequests = requests.filter((r) => r.trabajadorId === worker.id)

  const ingreso = new Date(worker.fechaIngreso || '2023-01-01')
  const hoy = new Date('2026-09-07')
  const diffTime = Math.abs(hoy - ingreso)
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25)
  const aniosCompletos = Math.max(1, Math.floor(diffYears))

  // 30 días calendario por año completo de servicio
  const diasGanados = aniosCompletos * 30

  // Días gozados (finalizados o en goce o aprobados)
  const diasGozados = workerRequests
    .filter((r) => r.tipo !== 'Venta de Vacaciones' && ['En Goce', 'Finalizada', 'Aprobada'].includes(r.estado))
    .reduce((sum, r) => sum + r.dias, 0)

  // Días vendidos
  const diasVendidos = workerRequests
    .filter((r) => r.tipo === 'Venta de Vacaciones' && ['Aprobada', 'Finalizada'].includes(r.estado))
    .reduce((sum, r) => sum + r.dias, 0)

  // Base fija representativa para trabajadores sin solicitudes registradas aún
  const gocePrevioEstimado = Math.min(diasGanados - 15, Math.max(0, (aniosCompletos - 1) * 25))
  const totalGozados = diasGozados > 0 ? diasGozados : gocePrevioEstimado
  const totalVendidos = diasVendidos

  const saldoPendiente = Math.max(0, diasGanados - totalGozados - totalVendidos)

  // Estado del récord: Al Día (< 20 días pendientes), Pendiente (20-30), Alerta Riesgo (> 30 días o > 2 años sin goce)
  let estadoRecord = 'Al Día'
  let estadoCls = 'bg-emerald-50 text-emerald-700 border-emerald-200'

  if (saldoPendiente > 30 || aniosCompletos >= 3 && saldoPendiente >= 30) {
    estadoRecord = 'Riesgo / Por Vencer'
    estadoCls = 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
  } else if (saldoPendiente >= 15) {
    estadoRecord = 'Pendiente Programar'
    estadoCls = 'bg-amber-50 text-amber-700 border-amber-200'
  }

  return {
    aniosCompletos,
    diasGanados,
    diasGozados: totalGozados,
    diasVendidos: totalVendidos,
    saldoPendiente,
    estadoRecord,
    estadoCls,
    periodoActual: `${2026 - 1}-${2026}`,
    ultimoGoce: workerRequests.length > 0 ? workerRequests[0].fechaInicio : '2025-11-10',
  }
}

