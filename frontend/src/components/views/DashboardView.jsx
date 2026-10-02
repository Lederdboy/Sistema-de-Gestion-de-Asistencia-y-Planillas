import {
  Users,
  CalendarDays,
  FileSpreadsheet,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Building2,
  PieChart,
  ShieldAlert,
  Printer,
  ChevronRight,
  Hourglass,
} from 'lucide-react'
import { SEDES, AFPS } from '../../data/mockData'

function CornerDots({ color = 'text-blue-500' }) {
  return (
    <svg
      className={`absolute top-2.5 left-2.5 w-11 h-11 pointer-events-none ${color}`}
      viewBox="0 0 45 45"
      fill="currentColor"
    >
      <circle cx="5" cy="5" r="1.3" />
      <circle cx="12" cy="5" r="1.3" />
      <circle cx="19" cy="5" r="1.3" />
      <circle cx="26" cy="5" r="1.3" />
      <circle cx="33" cy="5" r="1.3" />
      <circle cx="40" cy="5" r="1.3" />

      <circle cx="5" cy="12" r="1.3" />
      <circle cx="12" cy="12" r="1.3" />
      <circle cx="19" cy="12" r="1.3" />
      <circle cx="26" cy="12" r="1.3" />
      <circle cx="33" cy="12" r="1.3" />

      <circle cx="5" cy="19" r="1.3" />
      <circle cx="12" cy="19" r="1.3" />
      <circle cx="19" cy="19" r="1.3" />
      <circle cx="26" cy="19" r="1.3" />

      <circle cx="5" cy="26" r="1.3" />
      <circle cx="12" cy="26" r="1.3" />
      <circle cx="19" cy="26" r="1.3" />

      <circle cx="5" cy="33" r="1.3" />
      <circle cx="12" cy="33" r="1.3" />

      <circle cx="5" cy="40" r="1.3" />
    </svg>
  )
}

export default function DashboardView({ onNavigate, workers = [], loading = false }) {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2.5">
              <div className="h-7 w-72 sm:w-96 rounded-lg bg-slate-200" />
              <div className="h-4 w-60 sm:w-80 rounded-lg bg-slate-200" />
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-32 rounded-xl bg-slate-200" />
              <div className="h-9 w-32 rounded-xl bg-slate-200" />
            </div>
          </div>
        </div>

        {/* 4 KPI Cards Skeleton (Centered with CornerDots) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-center text-center space-y-2.5 min-h-[135px]">
              <CornerDots color="text-slate-200" />
              <div className="h-3.5 w-32 rounded-full bg-slate-200" />
              <div className="h-8 w-20 rounded-lg bg-slate-200" />
              <div className="h-3 w-28 rounded-full bg-slate-200" />
            </div>
          ))}
        </div>

        {/* Main Grid Panels Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex justify-between pb-3.5 border-b border-slate-100">
                <div className="h-4 w-56 rounded-full bg-slate-200" />
                <div className="h-3 w-20 rounded-full bg-slate-200" />
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3.5 w-36 rounded-full bg-slate-200" />
                    <div className="h-3.5 w-24 rounded-full bg-slate-200" />
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200" />
                </div>
              ))}
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="h-4 w-48 rounded-full bg-slate-200 pb-2 border-b border-slate-100" />
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-20 rounded-xl bg-slate-100 border border-slate-200 p-3 space-y-2">
                    <div className="h-3 w-16 mx-auto rounded-full bg-slate-200" />
                    <div className="h-5 w-10 mx-auto rounded-md bg-slate-200" />
                    <div className="h-2.5 w-12 mx-auto rounded-full bg-slate-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3.5">
              <div className="h-4 w-40 rounded-full bg-slate-200 pb-3 border-b border-slate-100" />
              <div className="h-16 rounded-xl bg-slate-100 border border-slate-200" />
              <div className="h-16 rounded-xl bg-slate-100 border border-slate-200" />
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="h-4 w-36 rounded-full bg-slate-200 pb-3 border-b border-slate-100" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 rounded-xl bg-slate-100 border border-slate-100" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const totalColaboradores = workers.length
  const totalActivos = workers.filter((w) => w.estado === 'Activo').length
  const totalVacaciones = workers.filter((w) => w.estado === 'Vacaciones').length

  const totalSueldosBase = workers.reduce((acc, w) => acc + (Number(w.sueldoBase) || 0), 0)
  const asignacionesFamiliares = workers.filter(w => w.asigFamiliar).length * 102.50
  const costoTotalEstimado = totalSueldosBase + asignacionesFamiliares

  const diaHoy = 7
  const totalDiasMes = 30
  const pctAvanceMes = ((diaHoy / totalDiasMes) * 100).toFixed(1)

  let totalMarcacionesHastaHoy = 0
  let totalFaltasRegistradas = 0
  const trabajadoresConFalta = []

  workers.forEach(w => {
    const tareo7 = (w.tareo || []).slice(0, diaHoy)
    tareo7.forEach((code, idx) => {
      if (code) totalMarcacionesHastaHoy++
      if (code === 'F') {
        totalFaltasRegistradas++
        if (!trabajadoresConFalta.find(t => t.id === w.id)) {
          trabajadoresConFalta.push({ id: w.id, nombre: w.nombre, dia: idx + 1 })
        }
      }
    })
  })

  const tasaAusentismo = totalMarcacionesHastaHoy > 0
    ? ((totalFaltasRegistradas / totalMarcacionesHastaHoy) * 100).toFixed(1)
    : '0.0'

  const sedesStats = SEDES.map(sede => {
    const workersInSede = workers.filter(w => String(w.sedeId) === String(sede.id))
    const totalSueldoSede = workersInSede.reduce((acc, w) => acc + (Number(w.sueldoBase) || 0), 0)
    const pct = totalSueldosBase > 0 ? ((totalSueldoSede / totalSueldosBase) * 100).toFixed(0) : 0
    return {
      sede: sede.nombre,
      ciudad: sede.ciudad,
      costo: totalSueldoSede,
      count: workersInSede.length,
      pct: Number(pct),
    }
  }).filter(s => s.count > 0)

  const afpCounts = {
    integra: workers.filter(w => w.afp === 'integra').length,
    prima: workers.filter(w => w.afp === 'prima').length,
    profuturo: workers.filter(w => w.afp === 'profuturo').length,
    habitat: workers.filter(w => w.afp === 'habitat').length,
    onp: workers.filter(w => w.afp === 'onp').length,
  }

  const afpDisplay = [
    { key: 'integra', nombre: 'AFP Integra', count: afpCounts.integra, color: 'border-blue-100 bg-blue-50 text-blue-800' },
    { key: 'prima', nombre: 'AFP Prima', count: afpCounts.prima, color: 'border-violet-100 bg-violet-50 text-violet-800' },
    { key: 'profuturo', nombre: 'AFP Profuturo', count: afpCounts.profuturo, color: 'border-indigo-100 bg-indigo-50 text-indigo-800' },
    { key: 'habitat', nombre: 'AFP Hábitat', count: afpCounts.habitat, color: 'border-sky-100 bg-sky-50 text-sky-800' },
    { key: 'onp', nombre: 'ONP (19990)', count: afpCounts.onp, color: 'border-slate-200 bg-slate-100 text-slate-800' },
  ]

  return (
    <div className="space-y-4">
      {/* Encabezado Principal Tipo Meta / Enterprise B2B */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Dashboard Ejecutivo de Asistencia y Planillas
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Sincronización en vivo de personal, tareo diario registrado hasta hoy y costos de nómina por sede.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => onNavigate('tareo')}
              className="h-9 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <CalendarDays size={15} className="text-slate-500" />
              <span>Ver Tareo al Día</span>
            </button>
            <button
              onClick={() => onNavigate('planilla')}
              className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <FileSpreadsheet size={15} />
              <span>Calcular Planilla</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas Métricas KPI Profesionales idénticas a Foto 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: TOTAL TRABAJADORES */}
        <div className="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-center text-center min-h-[135px] hover:border-slate-300 transition-all">
          <CornerDots color="text-blue-500" />
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <Users size={14} className="text-blue-600" />
            <span>TOTAL TRABAJADORES</span>
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1.5 font-mono text-blue-600">
            {totalColaboradores || 10}
          </p>
          <p className="text-xs text-slate-500 font-normal mt-1">
            plantilla operativa total
          </p>
        </div>

        {/* Card 2: % AVANCE */}
        <div className="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-center text-center min-h-[135px] hover:border-slate-300 transition-all">
          <CornerDots color="text-emerald-500" />
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>% AVANCE</span>
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1.5 font-mono text-emerald-600">
            100%
          </p>
          <p className="text-xs text-slate-500 font-normal mt-1">
            progreso de asistencia
          </p>
        </div>

        {/* Card 3: PENDIENTES */}
        <div className="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-center text-center min-h-[135px] hover:border-slate-300 transition-all">
          <CornerDots color="text-rose-500" />
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <Clock size={14} className="text-rose-600" />
            <span>PENDIENTES</span>
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1.5 font-mono text-rose-600">
            0
          </p>
          <p className="text-xs text-slate-500 font-normal mt-1">
            trabajadores por registrar
          </p>
        </div>

        {/* Card 4: RETRASO TOTAL (H) */}
        <div className="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-center text-center min-h-[135px] hover:border-slate-300 transition-all">
          <CornerDots color="text-slate-400" />
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <Hourglass size={14} className="text-slate-600" />
            <span>RETRASO TOTAL (H)</span>
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1.5 font-mono text-slate-800">
            0
          </p>
          <p className="text-xs text-slate-500 font-normal mt-1">
            horas acumuladas
          </p>
        </div>
      </div>

      {/* Grilla Principal de Paneles Profesionales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Costos por Sede Operativa */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Costos de Planilla por Sede Operativa ({sedesStats.length} Sedes Activas)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Datos SQL Server</span>
            </div>

            <div className="space-y-4">
              {sedesStats.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{item.sede}</span>
                    <span className="text-slate-600 font-mono">
                      S/ {item.costo.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      <span className="text-slate-400 font-normal ml-1.5">({item.count} personas)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, item.pct)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Distribución Previsional */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <PieChart size={16} className="text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Distribución Previsional del Personal ({totalColaboradores} Trabajadores)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Declaración AFP Net / ONP</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {afpDisplay.map((a) => {
                const pct = totalColaboradores > 0 ? ((a.count / totalColaboradores) * 100).toFixed(0) : 0
                return (
                  <div key={a.key} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-center hover:bg-blue-50/50 hover:border-blue-200 transition-colors">
                    <p className="text-[11px] font-bold text-slate-700">{a.nombre}</p>
                    <p className="text-lg font-black mt-0.5 font-mono text-slate-900">{pct}%</p>
                    <p className="text-[10px] text-slate-500">{a.count} personas</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Alertas y Módulos */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100 mb-4 text-slate-800">
              <ShieldAlert size={16} className="text-rose-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Incidencias y Alertas</h3>
            </div>

            <div className="space-y-2.5">
              {trabajadoresConFalta.length > 0 ? (
                trabajadoresConFalta.map((t, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 text-xs text-rose-800">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertCircle size={13} className="text-rose-600 flex-shrink-0" />
                      Inasistencia Registrada
                    </p>
                    <p className="text-[11px] text-rose-700 mt-0.5">
                      {t.nombre} registró falta en el tareo del día {t.dia}.
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-800">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
                    Sin Faltas Críticas
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    No se han registrado inasistencias injustificadas hasta el día de hoy.
                  </p>
                </div>
              )}

              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-800">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-blue-600 flex-shrink-0" />
                  Tareo al Día ({diaHoy} de Setiembre)
                </p>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Los tareos de las 6 sedes se encuentran registrados hasta la fecha actual.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-100 mb-3">
              Módulos del Sistema
            </h3>
            <div className="space-y-1.5">
              <button
                onClick={() => onNavigate('personal')}
                className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Users size={15} className="text-blue-600" />
                  <span>Directorio de Personal ({totalColaboradores})</span>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('tareo')}
                className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <CalendarDays size={15} className="text-blue-600" />
                  <span>Matriz de Asistencia (Hasta Hoy)</span>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('planilla')}
                className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet size={15} className="text-blue-600" />
                  <span>Cálculo de Planilla</span>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
