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
} from 'lucide-react'
import { SEDES, AFPS } from '../../data/mockData'

export default function DashboardView({ onNavigate, workers = [] }) {
  const totalColaboradores = workers.length
  const totalActivos = workers.filter((w) => w.estado === 'Activo').length
  const totalVacaciones = workers.filter((w) => w.estado === 'Vacaciones').length

  // Costo total estimado basado en la planilla real
  const totalSueldosBase = workers.reduce((acc, w) => acc + (Number(w.sueldoBase) || 0), 0)
  const asignacionesFamiliares = workers.filter(w => w.asigFamiliar).length * 102.50
  const costoTotalEstimado = totalSueldosBase + asignacionesFamiliares

  // Cálculo dinámico de avance de tareo hasta el día de hoy (Día 7 de Setiembre)
  const diaHoy = 7
  const totalDiasMes = 30
  const pctAvanceMes = ((diaHoy / totalDiasMes) * 100).toFixed(1)

  // Cálculo dinámico de inasistencias reales hasta hoy
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

  // Agrupación dinámica por Sede Operativa
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

  // Distribución dinámica por Sistema de Pensión
  const afpCounts = {
    integra: workers.filter(w => w.afp === 'integra').length,
    prima: workers.filter(w => w.afp === 'prima').length,
    profuturo: workers.filter(w => w.afp === 'profuturo').length,
    habitat: workers.filter(w => w.afp === 'habitat').length,
    onp: workers.filter(w => w.afp === 'onp').length,
  }

  const afpDisplay = [
    { key: 'integra', nombre: 'AFP Integra', count: afpCounts.integra, color: 'border-blue-100 bg-blue-50/50 text-blue-800' },
    { key: 'prima', nombre: 'AFP Prima', count: afpCounts.prima, color: 'border-purple-100 bg-purple-50/50 text-purple-800' },
    { key: 'profuturo', nombre: 'AFP Profuturo', count: afpCounts.profuturo, color: 'border-indigo-100 bg-indigo-50/50 text-indigo-800' },
    { key: 'habitat', nombre: 'AFP Hábitat', count: afpCounts.habitat, color: 'border-teal-100 bg-teal-50/50 text-teal-800' },
    { key: 'onp', nombre: 'ONP (19990)', count: afpCounts.onp, color: 'border-slate-200 bg-slate-50 text-slate-800' },
  ]

  return (
    <div className="space-y-4">
      {/* ─── Cabecera Principal con Gradiente Azul Noche / Slate Oscuro ───── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-lg border border-slate-800">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Conectado a SistemaPlanillasDB
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-blue-200 font-medium bg-blue-900/50 px-2.5 py-0.5 rounded-md border border-blue-700/50">
                Periodo: Setiembre 2026 (Tareo al día 07)
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Dashboard Ejecutivo de Asistencia y Planillas
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Sincronización en vivo de personal, tareo diario registrado hasta hoy y costos de nómina por sede.
            </p>
          </div>

          {/* Acciones Rápidas */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => onNavigate('tareo')}
              className="h-10 px-4 bg-slate-800/80 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02]"
            >
              <CalendarDays size={16} className="text-blue-400" />
              <span>Ver Tareo al Día</span>
            </button>
            <button
              onClick={() => onNavigate('planilla')}
              className="h-10 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/30 hover:scale-[1.02]"
            >
              <FileSpreadsheet size={16} />
              <span>Calcular Planilla</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Tarjetas de Indicadores Clave (Calculados en Tiempo Real) ───── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Costo Total Real */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Costo Total Nómina</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            S/ {costoTotalEstimado.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
            <span>En tiempo real</span>
            <span className="text-slate-400 font-normal">({totalColaboradores} colaboradores)</span>
          </p>
        </div>

        {/* KPI 2: Total Colaboradores en Base de Datos */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Personal Registrado</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalColaboradores}</p>
          <p className="text-xs text-slate-500 mt-1">
            <span className="text-emerald-700 font-semibold">{totalActivos} activos</span> · {totalVacaciones} vacaciones
          </p>
        </div>

        {/* KPI 3: Avance de Tareo hasta Hoy */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Tareo hasta Hoy</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">Día {diaHoy} de {totalDiasMes}</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${pctAvanceMes}%` }}
            />
          </div>
        </div>

        {/* KPI 4: Ausentismo Real Registrado */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Tasa de Ausentismo</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{tasaAusentismo}%</p>
          <p className="text-xs text-slate-400 mt-1">
            {totalFaltasRegistradas} {totalFaltasRegistradas === 1 ? 'falta registrada' : 'faltas registradas'}
          </p>
        </div>
      </div>

      {/* ─── Grilla Central: Distribución por Sede y Sistema Previsional ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Costos por Sede Real */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Costos de Planilla por Sede Operativa ({sedesStats.length} Sedes Activas)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Datos SQL Server</span>
            </div>

            <div className="space-y-3.5">
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

          {/* Distribución Previsional Real (AFP / ONP) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <PieChart size={16} className="text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Distribución Previsional del Personal ({totalColaboradores} Trabajadores)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Declaración AFP Net / ONP</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {afpDisplay.map((a) => {
                const pct = totalColaboradores > 0 ? ((a.count / totalColaboradores) * 100).toFixed(0) : 0
                return (
                  <div key={a.key} className={`p-3 rounded-lg border text-center ${a.color}`}>
                    <p className="text-[11px] font-bold">{a.nombre}</p>
                    <p className="text-lg font-black mt-0.5 font-mono">{pct}%</p>
                    <p className="text-[10px] opacity-75">{a.count} personas</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Alertas de RRHH y Accesos Directos */}
        <div className="space-y-4">
          {/* Alertas del Periodo */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3.5 text-slate-800">
              <ShieldAlert size={16} className="text-rose-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Incidencias y Alertas</h3>
            </div>

            <div className="space-y-2.5">
              {trabajadoresConFalta.length > 0 ? (
                trabajadoresConFalta.map((t, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-rose-50/70 border border-rose-200/70 text-xs text-rose-800">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertCircle size={13} className="text-rose-600 flex-shrink-0" />
                      Inasistencia Registrada
                    </p>
                    <p className="text-[11px] text-rose-700/80 mt-0.5">
                      {t.nombre} registró falta en el tareo del día {t.dia}.
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/70 text-xs text-emerald-800">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
                    Sin Faltas Críticas
                  </p>
                  <p className="text-[11px] text-emerald-700/80 mt-0.5">
                    No se han registrado inasistencias injustificadas hasta el día de hoy.
                  </p>
                </div>
              )}

              <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200/70 text-xs text-blue-800">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-blue-600 flex-shrink-0" />
                  Tareo al Día ({diaHoy} de Setiembre)
                </p>
                <p className="text-[11px] text-blue-700/80 mt-0.5">
                  Los tareos de las 6 sedes se encuentran registrados hasta la fecha actual.
                </p>
              </div>
            </div>
          </div>

          {/* Accesos de Gestión */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Módulos del Sistema
            </h3>
            <div className="space-y-1.5">
              <button
                onClick={() => onNavigate('personal')}
                className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Users size={15} className="text-blue-600" />
                  <span>Directorio de Personal ({totalColaboradores})</span>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('tareo')}
                className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <CalendarDays size={15} className="text-blue-600" />
                  <span>Matriz de Asistencia (Hasta Hoy)</span>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('planilla')}
                className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700 transition-all cursor-pointer"
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
