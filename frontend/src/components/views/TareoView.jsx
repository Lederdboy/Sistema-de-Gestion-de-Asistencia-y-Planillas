import { useState } from 'react'
import {
  Users,
  CalendarDays,
  BarChart3,
  FileSpreadsheet,
  Download,
  Calculator,
  Lock,
  Building2,
  MapPin,
  Search,
  CheckCircle2,
  X,
  AlertTriangle,
} from 'lucide-react'
import { BADGE_CONFIG, EMPRESAS, SEDES } from '../../data/mockData'

const getDaysInMonth = (y, m) => new Date(y, m, 0).getDate()
const isWeekend = (y, m, d) => {
  const day = new Date(y, m - 1, d).getDay()
  return day === 0 || day === 6
}

// ─── Badge de asistencia ──────────────────────────────────────────────────────
const AttBadge = ({ code, onClick }) => {
  const cfg = BADGE_CONFIG[code]
  if (!cfg) {
    return (
      <button
        onClick={onClick}
        className="w-6 h-6 rounded flex items-center justify-center text-slate-300 text-xs hover:bg-slate-100 transition-colors"
      >
        —
      </button>
    )
  }
  return (
    <button
      onClick={onClick}
      title={`Clic para cambiar estado (${cfg.desc})`}
      className={`inline-block rounded px-1.5 py-0.5 text-xs font-bold transition-transform active:scale-90 hover:ring-2 hover:ring-blue-400/50 ${cfg.cls}`}
    >
      {cfg.label}
    </button>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, sub, iconBg, loading }) => (
  <div className="rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.04)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_52px_rgba(14,165,233,0.08)]">
    {loading ? (
      <>
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 animate-pulse rounded-2xl bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 rounded-full bg-slate-200 animate-pulse" />
            <div className="h-6 w-16 rounded-full bg-slate-200 animate-pulse" />
            <div className="h-3 w-32 rounded-full bg-slate-200 animate-pulse" />
          </div>
        </div>
      </>
    ) : (
      <>
        <div className="flex items-center gap-4">
          <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
            <Icon size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold leading-tight text-slate-900">{value}</p>
            <p className="mt-1 text-xs text-slate-400">{sub}</p>
          </div>
        </div>
      </>
    )}
  </div>
)

export default function TareoView({
  workers,
  onUpdateWorkerTareo,
  loading,
  onNavigateToPlanilla,
  showToast,
}) {
  const [filters, setFilters] = useState({
    empresa: '',
    sede: '',
    periodo: '2026-09',
    search: '',
  })

  // Modal selector de estado de celda
  const [selectedCell, setSelectedCell] = useState(null) // { workerId, day, currentCode }
  const [showCalculateModal, setShowCalculateModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [calculating, setCalculating] = useState(false)

  const [year, month] = filters.periodo.split('-').map(Number)
  const daysInMonth = getDaysInMonth(year, month)
  const dayNums = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Filtrado de trabajadores
  const filteredWorkers = workers.filter((w) => {
    const matchEmpresa = !filters.empresa || w.empresaId === filters.empresa
    const matchSede = !filters.sede || w.sedeId === filters.sede
    const matchSearch =
      !filters.search ||
      w.nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
      w.dni.includes(filters.search)
    return matchEmpresa && matchSede && matchSearch
  })

  const summary = (tareo = []) => ({
    D: tareo.filter((c) => c === 'D').length,
    N: tareo.filter((c) => c === 'N').length,
    F: tareo.filter((c) => c === 'F').length,
    DL: tareo.filter((c) => c === 'DL').length,
    V: tareo.filter((c) => c === 'V').length,
    M: tareo.filter((c) => c === 'M').length,
  })

  // Manejar cambio de estado en celda
  const handleCellClick = (workerId, dayIndex, currentCode) => {
    setSelectedCell({ workerId, dayIndex, currentCode })
  }

  const applyStatusChange = (newCode) => {
    if (!selectedCell) return
    onUpdateWorkerTareo(selectedCell.workerId, selectedCell.dayIndex, newCode)
    setSelectedCell(null)
    showToast(`Asistencia actualizada para el día ${selectedCell.dayIndex + 1}`, 'success')
  }

  // Exportar Excel
  const handleExportExcel = () => {
    showToast('Generando reporte en formato Excel (.xlsx)...', 'info')
    setTimeout(() => {
      showToast('Reporte Excel descargado correctamente.', 'success')
    }, 1000)
  }

  // Calcular Planilla
  const handleExecuteCalculation = () => {
    setCalculating(true)
    setTimeout(() => {
      setCalculating(false)
      setShowCalculateModal(false)
      showToast('Planilla calculada exitosamente para el periodo ' + filters.periodo, 'success')
      if (onNavigateToPlanilla) onNavigateToPlanilla()
    }, 1200)
  }

  // Cerrar Planilla
  const handleClosePeriod = () => {
    setShowCloseModal(false)
    showToast('El periodo ' + filters.periodo + ' ha sido cerrado y bloqueado.', 'info')
  }

  const totalSueldos = workers.reduce((acc, w) => acc + (Number(w.sueldoBase) || 0), 0)
  const totalFaltasPeriodo = workers.reduce((acc, w) => acc + ((w.tareo || []).slice(0, 7).filter(c => c === 'F').length), 0)

  const kpis = [
    {
      icon: Users,
      label: 'Total Trabajadores',
      value: String(workers.length),
      sub: `${workers.filter(w => w.estado === 'Activo').length} activos en base de datos`,
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      icon: CalendarDays,
      label: 'Tareo Registrado',
      value: 'Día 1 al 7',
      sub: 'Al día de hoy (07 set. 2026)',
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      icon: BarChart3,
      label: 'Faltas Registradas',
      value: String(totalFaltasPeriodo),
      sub: 'En el periodo actual',
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      icon: FileSpreadsheet,
      label: 'Total Neto Estimado',
      value: `S/ ${(totalSueldos * 0.87).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: 'Pre-planilla Set 2026',
      iconBg: 'bg-slate-100 text-slate-600',
    },
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <KpiCard key={i} {...k} loading={loading} />
        ))}
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white/80 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">Tareo</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">Matriz de tareo diario</h2>
            <p className="mt-1 text-xs text-slate-500">
              Periodo {filters.periodo} · {filteredWorkers.length} colaboradores · Asistencia registrada hasta hoy (07 set. 2026)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-[11px] font-semibold text-white shadow-[0_12px_25px_rgba(16,185,129,0.2)] transition-all hover:bg-emerald-700"
            >
              <Download size={13} />
              Exportar Excel
            </button>

            <button
              onClick={() => setShowCalculateModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-3.5 py-2 text-[11px] font-semibold text-white shadow-[0_12px_25px_rgba(14,165,233,0.22)] transition-all hover:bg-sky-700"
            >
              <Calculator size={13} />
              Calcular Planilla
            </button>

            <button
              onClick={() => setShowCloseModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-700 px-3.5 py-2 text-[11px] font-semibold text-white shadow-[0_12px_25px_rgba(244,63,94,0.2)] transition-all hover:bg-rose-800"
            >
              <Lock size={13} />
              Cerrar Planilla
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-[22px] border border-slate-200 bg-slate-50/70 p-3">
          <div className="relative min-w-[170px] flex-1">
            <Building2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              value={filters.empresa}
              onChange={(e) => setFilters((f) => ({ ...f, empresa: e.target.value }))}
            >
              <option value="">Empresa (Todas)</option>
              {EMPRESAS.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="relative min-w-[170px] flex-1">
            <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              value={filters.sede}
              onChange={(e) => setFilters((f) => ({ ...f, sede: e.target.value }))}
            >
              <option value="">Sede (Todas las 6 sedes)</option>
              {SEDES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          <select
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            value={filters.periodo}
            onChange={(e) => setFilters((f) => ({ ...f, periodo: e.target.value }))}
          >
            {['2026-09', '2026-08', '2026-07', '2025-07'].map((p) => (
              <option key={p} value={p}>
                {p} {p === '2026-09' ? '(Actual)' : ''}
              </option>
            ))}
          </select>

          <div className="relative min-w-[220px] flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar DNI o nombre..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <span className="mr-1 text-[11px] font-medium text-slate-400">Leyenda:</span>
          {Object.entries(BADGE_CONFIG).map(([code, { label, cls, desc }]) => (
            <span
              key={code}
              className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-medium ${cls}`}
            >
              <span className="font-bold">{label}</span>
              <span className="font-normal opacity-85">{desc}</span>
            </span>
          ))}
          <span className="ml-auto hidden text-[11px] italic text-slate-400 sm:inline">
            * Haz clic en cualquier celda para editar el estado
          </span>
        </div>

        <div className="mt-4 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_12px_24px_rgba(15,23,42,0.03)]">
          <div className="overflow-x-auto">
            <table className="min-w-max w-full border-collapse text-xs">
              <thead>
                <tr className="select-none bg-slate-100 text-slate-700">
                  <th className="sticky left-0 z-20 min-w-[190px] border-b border-r border-slate-200 bg-slate-100 px-3 py-2.5 text-left font-semibold">
                    Colaborador
                  </th>
                  <th className="min-w-[85px] border-b border-r border-slate-200 px-2 py-2.5 text-center font-semibold">
                    DNI
                  </th>
                  {dayNums.map((d) => {
                    const weekend = isWeekend(year, month, d)
                    const isToday = d === 7 && month === 9 && year === 2026
                    return (
                      <th
                        key={d}
                        className={`w-8 border-b border-slate-200 py-1.5 text-center font-semibold ${
                          isToday
                            ? 'bg-sky-600 text-white ring-2 ring-sky-500 ring-inset'
                            : weekend
                            ? 'bg-rose-50 text-rose-600'
                            : 'text-slate-600'
                        }`}
                        title={isToday ? 'Día de Hoy (07 de Setiembre de 2026)' : undefined}
                      >
                        <span className="block leading-none">{d}</span>
                        {isToday && <span className="mt-0.5 block text-[7px] font-bold uppercase tracking-tighter text-sky-100">Hoy</span>}
                      </th>
                    )
                  })}
                  {['D', 'N', 'F', 'DL', 'V'].map((k) => (
                    <th
                      key={k}
                      className={`w-9 border-b border-l border-slate-200 py-2 text-center font-bold ${BADGE_CONFIG[k]?.cls}`}
                    >
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredWorkers.map((w, idx) => {
                  const s = summary(w.tareo)
                  return (
                    <tr
                      key={w.id}
                      className={`transition-colors hover:bg-sky-50/50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                    >
                      <td className="sticky left-0 z-10 whitespace-nowrap border-r border-slate-100 bg-inherit px-3 py-1.5 font-medium text-slate-800 shadow-[1px_0_0_0_#e2e8f0]">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-sky-600" />
                          <span>{w.nombre}</span>
                        </div>
                      </td>
                      <td className="border-r border-slate-100 px-2 py-1.5 text-center font-mono text-slate-500">
                        {w.dni}
                      </td>

                      {dayNums.map((d) => {
                        const weekend = isWeekend(year, month, d)
                        const isToday = d === 7 && month === 9 && year === 2026
                        const code = w.tareo ? w.tareo[d - 1] : null
                        return (
                          <td
                            key={d}
                            className={`border-slate-100 py-1 text-center ${
                              isToday ? 'bg-sky-50/80' : weekend ? 'bg-rose-50/20' : ''
                            }`}
                          >
                            <AttBadge code={code} onClick={() => handleCellClick(w.id, d - 1, code)} />
                          </td>
                        )
                      })}

                      {['D', 'N', 'F', 'DL', 'V'].map((k) => (
                        <td key={k} className="border-l border-slate-100 py-1.5 text-center font-bold text-slate-700">
                          {s[k] || 0}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>


      {/* Modal Rápido de Cambio de Estado en Celda */}
      {selectedCell && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">
                Editar Asistencia (Día {selectedCell.dayIndex + 1})
              </h3>
              <button
                onClick={() => setSelectedCell(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-500 my-3">
              Selecciona el nuevo estado de asistencia para este colaborador:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(BADGE_CONFIG).map(([code, cfg]) => (
                <button
                  key={code}
                  onClick={() => applyStatusChange(code)}
                  className={`p-2.5 rounded-lg border text-left flex items-center gap-2.5 transition-all hover:scale-102 cursor-pointer ${cfg.cls}`}
                >
                  <span className="font-extrabold text-sm w-6 text-center">{code}</span>
                  <span className="text-xs font-medium">{cfg.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Calcular Planilla */}
      {showCalculateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Calculator size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">¿Calcular Planilla del Periodo?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Se procesará el cálculo de sueldos brutos, asignación familiar, descuentos de AFP/ONP y neto a pagar para los {filteredWorkers.length} colaboradores del periodo {filters.periodo}.
                </p>
              </div>
            </div>

            <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 space-y-1">
              <p className="font-semibold">Resumen de ejecución:</p>
              <p>• Días computados según tareo registrado.</p>
              <p>• Aplicación de tasas de EsSalud 9% y comisiones AFP actualizadas.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCalculateModal(false)}
                disabled={calculating}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteCalculation}
                disabled={calculating}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
              >
                {calculating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Calculando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span>Confirmar y Calcular</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cerrar Planilla */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Cerrar Periodo de Planilla</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Al cerrar la planilla del periodo {filters.periodo}, se bloqueará la edición de tareos y se generarán los archivos oficiales para PLAME y bancos.
                </p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800">
              <p className="font-semibold">⚠️ Acción Irreversible:</p>
              <p>Asegúrate de que todas las horas extras y faltas hayan sido verificadas.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCloseModal(false)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
              >
                Volver
              </button>
              <button
                onClick={handleClosePeriod}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-700 hover:bg-red-800 shadow-md shadow-red-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Lock size={14} />
                <span>Cerrar Definitivamente</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
