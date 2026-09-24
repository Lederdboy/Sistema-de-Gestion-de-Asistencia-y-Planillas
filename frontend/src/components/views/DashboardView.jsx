import { useState, useEffect } from 'react'
import {
  Users, CalendarDays, FileSpreadsheet, TrendingUp, AlertCircle,
  CheckCircle2, Clock, Building2, PieChart, ShieldAlert, Printer, ChevronRight,
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { AFPS } from '../../data/mockData'

export default function DashboardView({ onNavigate, workers = [], user }) {
  const [sedesStats, setSedesStats] = useState([])
  const [loadingSedes, setLoadingSedes] = useState(false)

  const esGerenteGeneral = user?.rol === 'GERENTE_GENERAL'

  useEffect(() => {
    if (!esGerenteGeneral) return
    setLoadingSedes(true)
    Promise.all([
      supabase.from('sedes').select('id, nombre, ciudad').eq('activo', true),
      supabase.from('trabajadores').select('sede_id, sueldo_basico').eq('activo', true),
    ]).then(([{ data: sedes }, { data: trabajadores }]) => {
      if (!sedes || !trabajadores) return
      const totalSueldos = trabajadores.reduce((acc, t) => acc + Number(t.sueldo_basico || 0), 0)
      const stats = sedes.map((s) => {
        const enSede = trabajadores.filter((t) => t.sede_id === s.id)
        const costoSede = enSede.reduce((acc, t) => acc + Number(t.sueldo_basico || 0), 0)
        return {
          sede: s.nombre,
          ciudad: s.ciudad,
          count: enSede.length,
          costo: costoSede,
          pct: totalSueldos > 0 ? Math.round((costoSede / totalSueldos) * 100) : 0,
        }
      }).filter((s) => s.count > 0)
      setSedesStats(stats)
    }).finally(() => setLoadingSedes(false))
  }, [esGerenteGeneral])

  const totalColaboradores = workers.length
  const totalActivos = workers.filter((w) => w.estado === 'Activo').length
  const totalVacaciones = workers.filter((w) => w.estado === 'Vacaciones').length
  const totalSueldosBase = workers.reduce((acc, w) => acc + (Number(w.sueldoBase) || 0), 0)
  const asignacionesFamiliares = workers.filter((w) => w.asigFamiliar).length * 102.50
  const costoTotalEstimado = totalSueldosBase + asignacionesFamiliares

  const diaHoy = 7
  const totalDiasMes = 30
  const pctAvanceMes = ((diaHoy / totalDiasMes) * 100).toFixed(1)

  let totalMarcacionesHastaHoy = 0
  let totalFaltasRegistradas = 0
  const trabajadoresConFalta = []
  workers.forEach((w) => {
    const tareo7 = (w.tareo || []).slice(0, diaHoy)
    tareo7.forEach((code, idx) => {
      if (code) totalMarcacionesHastaHoy++
      if (code === 'F' && !trabajadoresConFalta.find((t) => t.id === w.id)) {
        totalFaltasRegistradas++
        trabajadoresConFalta.push({ id: w.id, nombre: w.nombre, dia: idx + 1 })
      }
    })
  })

  const tasaAusentismo = totalMarcacionesHastaHoy > 0
    ? ((totalFaltasRegistradas / totalMarcacionesHastaHoy) * 100).toFixed(1)
    : '0.0'

  const afpDisplay = [
    { key: 'integra', nombre: 'AFP Integra', count: workers.filter((w) => w.afp === 'integra').length, color: 'border-blue-100 bg-blue-50 text-blue-800' },
    { key: 'prima', nombre: 'AFP Prima', count: workers.filter((w) => w.afp === 'prima').length, color: 'border-violet-100 bg-violet-50 text-violet-800' },
    { key: 'profuturo', nombre: 'AFP Profuturo', count: workers.filter((w) => w.afp === 'profuturo').length, color: 'border-indigo-100 bg-indigo-50 text-indigo-800' },
    { key: 'habitat', nombre: 'AFP Hábitat', count: workers.filter((w) => w.afp === 'habitat').length, color: 'border-sky-100 bg-sky-50 text-sky-800' },
    { key: 'onp', nombre: 'ONP (19990)', count: workers.filter((w) => w.afp === 'onp').length, color: 'border-slate-200 bg-slate-100 text-slate-800' },
  ]

  const statsSedesParaGrafico = esGerenteGeneral && sedesStats.length > 0 ? sedesStats : []

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-[0_22px_45px_rgba(30,64,175,0.18)] border border-blue-700/30">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-200 text-xs font-semibold border border-emerald-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Conectado a Supabase
              </span>
              <span className="text-xs text-blue-100 font-medium bg-blue-500/10 px-2.5 py-0.5 rounded-md border border-blue-400/30">
                Periodo: Setiembre 2026
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Dashboard {esGerenteGeneral ? 'Ejecutivo General' : 'de Sede'}
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {esGerenteGeneral
                ? 'Resumen consolidado de todas las sedes activas, personal y costos de nómina.'
                : 'Resumen de personal, tareo y costos de tu sede.'}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => onNavigate('tareo')}
              className="h-10 px-4 bg-white/8 hover:bg-white/12 text-slate-100 border border-white/15 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer">
              <CalendarDays size={16} className="text-blue-200" />
              Ver Tareo
            </button>
            <button onClick={() => onNavigate('planilla')}
              className="h-10 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer">
              <FileSpreadsheet size={16} />
              Calcular Planilla
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-[0_10px_20px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Costo Total Nómina</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><TrendingUp size={16} /></div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            S/ {costoTotalEstimado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-emerald-600 font-medium mt-1">{totalColaboradores} colaboradores</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-[0_10px_20px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Personal Registrado</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Users size={16} /></div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalColaboradores}</p>
          <p className="text-xs text-slate-500 mt-1">
            <span className="text-emerald-700 font-semibold">{totalActivos} activos</span> · {totalVacaciones} vacaciones
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-[0_10px_20px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Tareo hasta Hoy</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><Clock size={16} /></div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">Día {diaHoy} de {totalDiasMes}</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${pctAvanceMes}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-[0_10px_20px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Tasa de Ausentismo</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center"><AlertCircle size={16} /></div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{tasaAusentismo}%</p>
          <p className="text-xs text-slate-400 mt-1">{totalFaltasRegistradas} faltas registradas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Costos por sede — Supabase para GERENTE_GENERAL, workers para otros */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_10px_20px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Costos de Planilla por Sede
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                {esGerenteGeneral ? 'Supabase · Tiempo real' : 'Datos locales'}
              </span>
            </div>

            {loadingSedes ? (
              <div className="text-center text-xs text-slate-400 py-4">Cargando datos de sedes...</div>
            ) : (
              <div className="space-y-3.5">
                {(statsSedesParaGrafico.length > 0 ? statsSedesParaGrafico : []).map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{item.sede}</span>
                      <span className="text-slate-600 font-mono">
                        S/ {item.costo.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        <span className="text-slate-400 font-normal ml-1.5">({item.count} personas)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                        style={{ width: `${Math.max(5, item.pct)}%` }} />
                    </div>
                  </div>
                ))}
                {statsSedesParaGrafico.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">Sin datos de sedes disponibles.</p>
                )}
              </div>
            )}
          </div>

          {/* AFP */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_10px_20px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <PieChart size={16} className="text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Distribución Previsional ({totalColaboradores} Trabajadores)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">AFP Net / ONP</span>
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

        <div className="space-y-4">
          {/* Alertas */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_10px_20px_rgba(15,23,42,0.04)]">
            <div className="flex items-center gap-2 mb-3.5 text-slate-800">
              <ShieldAlert size={16} className="text-rose-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Incidencias y Alertas</h3>
            </div>
            <div className="space-y-2.5">
              {trabajadoresConFalta.length > 0 ? (
                trabajadoresConFalta.map((t, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertCircle size={13} className="text-rose-600 flex-shrink-0" />
                      Inasistencia Registrada
                    </p>
                    <p className="text-[11px] text-rose-700/80 mt-0.5">{t.nombre} — día {t.dia}</p>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
                    Sin Faltas Críticas
                  </p>
                  <p className="text-[11px] text-emerald-700/80 mt-0.5">No hay inasistencias injustificadas.</p>
                </div>
              )}
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-blue-600 flex-shrink-0" />
                  Tareo al Día {diaHoy}
                </p>
                <p className="text-[11px] text-blue-700/80 mt-0.5">Tareos registrados hasta la fecha actual.</p>
              </div>
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_10px_20px_rgba(15,23,42,0.04)]">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Módulos del Sistema</h3>
            <div className="space-y-1.5">
              <button onClick={() => onNavigate('personal')}
                className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2.5"><Users size={15} className="text-blue-600" /><span>Personal ({totalColaboradores})</span></div>
                <ChevronRight size={14} className="text-slate-400" />
              </button>
              <button onClick={() => onNavigate('tareo')}
                className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2.5"><CalendarDays size={15} className="text-blue-600" /><span>Matriz de Asistencia</span></div>
                <ChevronRight size={14} className="text-slate-400" />
              </button>
              <button onClick={() => onNavigate('planilla')}
                className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2.5"><FileSpreadsheet size={15} className="text-blue-600" /><span>Cálculo de Planilla</span></div>
                <ChevronRight size={14} className="text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
