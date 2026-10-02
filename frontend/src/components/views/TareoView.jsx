import { useState } from 'react'
import * as XLSX from 'xlsx'
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
  Clock,
  Hourglass,
} from 'lucide-react'
import { BADGE_CONFIG, EMPRESAS, SEDES } from '../../data/mockData'

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

const getDaysInMonth = (y, m) => new Date(y, m, 0).getDate()
const isWeekend = (y, m, d) => {
  const day = new Date(y, m - 1, d).getDay()
  return day === 0 || day === 6
}

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

const KpiCard = ({ icon: Icon, label, value, sub, dotColor = 'text-blue-500', iconColor = 'text-blue-600', valueColor = 'text-blue-600', loading }) => (
  <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col items-center justify-center text-center min-h-[135px] hover:border-slate-300 transition-all">
    <CornerDots color={loading ? 'text-slate-200' : dotColor} />
    {loading ? (
      <div className="animate-pulse flex flex-col items-center justify-center space-y-2 w-full">
        <div className="h-3.5 w-32 rounded-full bg-slate-200" />
        <div className="h-8 w-20 rounded-lg bg-slate-200" />
        <div className="h-3 w-28 rounded-full bg-slate-200" />
      </div>
    ) : (
      <>
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
          <Icon size={14} className={iconColor} />
          <span>{label}</span>
        </div>
        <p className={`mt-1.5 text-3xl sm:text-4xl font-extrabold tracking-tight font-mono ${valueColor}`}>
          {value}
        </p>
        <p className="mt-1 text-xs text-slate-500 font-normal">{sub}</p>
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
  onCompleteAllTareo,
}) {
  const [filters, setFilters] = useState({
    empresa: '',
    sede: '',
    periodo: '2026-09',
    search: '',
  })

  const [selectedCell, setSelectedCell] = useState(null)
  const [showCalculateModal, setShowCalculateModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [calculating, setCalculating] = useState(false)

  const [year, month] = filters.periodo.split('-').map(Number)
  const daysInMonth = getDaysInMonth(year, month)
  const dayNums = Array.from({ length: daysInMonth }, (_, i) => i + 1)

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

  const handleCellClick = (workerId, dayIndex, currentCode) => {
    setSelectedCell({ workerId, dayIndex, currentCode })
  }

  const applyStatusChange = (newCode) => {
    if (!selectedCell) return
    onUpdateWorkerTareo(selectedCell.workerId, selectedCell.dayIndex, newCode)
    setSelectedCell(null)
    showToast(`Asistencia actualizada para el día ${selectedCell.dayIndex + 1}`, 'success')
  }

  const handleExportExcel = () => {
    try {
      showToast('Generando reporte oficial en formato Excel (.xlsx)...', 'info')

      // Construcción de cabeceras de columnas
      const daysHeaders = Array.from({ length: 30 }, (_, i) => `Día ${i + 1}`)
      const headers = [
        'N°',
        'Colaborador',
        'DNI',
        'Cargo',
        'Sede',
        'Empresa',
        ...daysHeaders,
        'D (Día)',
        'N (Noche)',
        'F (Falta)',
        'DL (Descanso)',
        'V (Vacaciones)',
        'M (Mixto)',
        'Total Asistidos',
      ]

      // Filas de colaboradores
      const rows = filteredWorkers.map((w, index) => {
        const sedeObj = SEDES.find((s) => s.id === w.sedeId)
        const empresaObj = EMPRESAS.find((e) => e.id === w.empresaId)
        const tareo = w.tareo || []
        const s = summary(tareo)
        const totalAsistidos = (s.D || 0) + (s.N || 0) + (s.M || 0)

        const daysCols = Array.from({ length: 30 }, (_, d) => tareo[d] || 'DL')

        return [
          index + 1,
          w.nombre,
          w.dni,
          w.cargo,
          sedeObj?.nombre || 'Sede Central',
          empresaObj?.nombre || 'Empresa Principal',
          ...daysCols,
          s.D || 0,
          s.N || 0,
          s.F || 0,
          s.DL || 0,
          s.V || 0,
          s.M || 0,
          totalAsistidos,
        ]
      })

      // Fila de resumen de totales generales al pie
      const totalD = filteredWorkers.reduce((acc, w) => acc + (summary(w.tareo).D || 0), 0)
      const totalN = filteredWorkers.reduce((acc, w) => acc + (summary(w.tareo).N || 0), 0)
      const totalF = filteredWorkers.reduce((acc, w) => acc + (summary(w.tareo).F || 0), 0)
      const totalDL = filteredWorkers.reduce((acc, w) => acc + (summary(w.tareo).DL || 0), 0)
      const totalV = filteredWorkers.reduce((acc, w) => acc + (summary(w.tareo).V || 0), 0)
      const totalM = filteredWorkers.reduce((acc, w) => acc + (summary(w.tareo).M || 0), 0)
      const totalEfectivos = totalD + totalN + totalM

      const totalsRow = [
        '',
        'TOTALES GENERALES',
        '',
        '',
        '',
        '',
        ...Array.from({ length: 30 }, () => ''),
        totalD,
        totalN,
        totalF,
        totalDL,
        totalV,
        totalM,
        totalEfectivos,
      ]

      // Encabezado corporativo
      const headerTitle = ['SISTEMA DE ASISTENCIA Y PLANILLAS - MATRIZ DE TAREO MENSUAL']
      const headerSub = [`Periodo: ${filters.periodo} | Total Colaboradores: ${filteredWorkers.length} | Fecha de Descarga: ${new Date().toLocaleDateString('es-PE')} ${new Date().toLocaleTimeString('es-PE')}`]
      const emptyRow = []

      const sheetData = [
        headerTitle,
        headerSub,
        emptyRow,
        headers,
        ...rows,
        totalsRow,
      ]

      const worksheet = XLSX.utils.aoa_to_sheet(sheetData)

      // Anchos de columnas ajustados profesionalmente
      worksheet['!cols'] = [
        { wch: 5 },   // N°
        { wch: 32 },  // Colaborador
        { wch: 12 },  // DNI
        { wch: 28 },  // Cargo
        { wch: 30 },  // Sede
        { wch: 35 },  // Empresa
        ...Array.from({ length: 30 }, () => ({ wch: 5 })), // Días 1..30
        { wch: 8 },   // D
        { wch: 8 },   // N
        { wch: 8 },   // F
        { wch: 10 },  // DL
        { wch: 10 },  // V
        { wch: 8 },   // M
        { wch: 14 },  // Total Asistidos
      ]

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, `Tareo_${filters.periodo}`)

      const filename = `Tareo_Mensual_${filters.periodo}_${new Date().toISOString().slice(0, 10)}.xlsx`
      XLSX.writeFile(workbook, filename)

      showToast(`Archivo Excel (${filename}) descargado con éxito.`, 'success')
    } catch (err) {
      console.error('Error al generar Excel:', err)
      showToast('Error al exportar a Excel.', 'error')
    }
  }

  const handleAutocompletarMes = () => {
    if (onCompleteAllTareo) {
      onCompleteAllTareo()
    }
    showToast('Tareo completado automáticamente para los 30 días del mes.', 'success')
  }

  const handleExecuteCalculation = () => {
    setCalculating(true)
    setTimeout(() => {
      setCalculating(false)
      setShowCalculateModal(false)
      showToast('Planilla calculada exitosamente para el periodo ' + filters.periodo, 'success')
      if (onNavigateToPlanilla) onNavigateToPlanilla()
    }, 1200)
  }

  const handleClosePeriod = () => {
    setShowCloseModal(false)
    showToast('El periodo ' + filters.periodo + ' ha sido cerrado y bloqueado.', 'info')
  }

  const totalSueldos = workers.reduce((acc, w) => acc + (Number(w.sueldoBase) || 0), 0)
  const totalFaltasPeriodo = workers.reduce((acc, w) => acc + ((w.tareo || []).filter(c => c === 'F').length), 0)

  const kpis = [
    {
      icon: Users,
      label: 'TOTAL TRABAJADORES',
      value: String(workers.length || 10),
      sub: 'plantilla operativa total',
      dotColor: 'text-blue-500',
      iconColor: 'text-blue-600',
      valueColor: 'text-blue-600',
    },
    {
      icon: CheckCircle2,
      label: '% AVANCE',
      value: '100%',
      sub: 'progreso de asistencia',
      dotColor: 'text-emerald-500',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-600',
    },
    {
      icon: Clock,
      label: 'PENDIENTES',
      value: '0',
      sub: 'trabajadores por registrar',
      dotColor: 'text-rose-500',
      iconColor: 'text-rose-600',
      valueColor: 'text-rose-600',
    },
    {
      icon: Hourglass,
      label: 'RETRASO TOTAL (H)',
      value: '0',
      sub: 'horas acumuladas',
      dotColor: 'text-slate-400',
      iconColor: 'text-slate-600',
      valueColor: 'text-slate-800',
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">Tareo</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">Matriz de tareo diario</h2>
            <p className="mt-1 text-xs text-slate-500">
              Periodo {filters.periodo} · {filteredWorkers.length} colaboradores · Tareo mensual completo (30 días)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAutocompletarMes}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 cursor-pointer"
              title="Asegurar que todas las celdas del mes estén completas con turnos y descansos de ley"
            >
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>Autocompletar Mes</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-[11px] font-semibold text-white shadow-[0_12px_25px_rgba(16,185,129,0.2)] transition-all hover:bg-emerald-500 cursor-pointer"
            >
              <Download size={13} />
              Exportar Excel
            </button>

            <button
              onClick={() => setShowCalculateModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-[11px] font-semibold text-white shadow-[0_12px_25px_rgba(37,99,235,0.22)] transition-all hover:bg-blue-500"
            >
              <Calculator size={13} />
              Calcular Planilla
            </button>

            <button
              onClick={() => setShowCloseModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-700 px-3.5 py-2 text-[11px] font-semibold text-white shadow-[0_12px_25px_rgba(244,63,94,0.2)] transition-all hover:bg-rose-600"
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
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
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
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
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
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
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
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
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
                            ? 'bg-blue-600 text-white ring-2 ring-blue-500 ring-inset'
                            : weekend
                            ? 'bg-rose-50 text-rose-600'
                            : 'text-slate-600'
                        }`}
                        title={isToday ? 'Día de Hoy (07 de Setiembre de 2026)' : undefined}
                      >
                        <span className="block leading-none">{d}</span>
                        {isToday && <span className="mt-0.5 block text-[7px] font-bold uppercase tracking-tighter text-blue-100">Hoy</span>}
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
                {loading ? (
                  Array.from({ length: 7 }).map((_, rIdx) => (
                    <tr key={rIdx} className="animate-pulse bg-white border-b border-slate-100">
                      <td className="sticky left-0 z-10 px-3 py-2.5 bg-white border-r border-slate-100 shadow-[1px_0_0_0_#e2e8f0]">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-slate-200" />
                          <div className="h-3.5 w-36 rounded-full bg-slate-200" />
                        </div>
                      </td>
                      <td className="px-2 py-2 border-r border-slate-100">
                        <div className="h-3 w-14 mx-auto rounded-full bg-slate-200" />
                      </td>
                      {dayNums.map((d) => (
                        <td key={d} className="p-1 border-slate-100">
                          <div className="h-4 w-4 mx-auto rounded bg-slate-200" />
                        </td>
                      ))}
                      {['D', 'N', 'F', 'DL', 'V'].map((k) => (
                        <td key={k} className="p-1 border-l border-slate-100">
                          <div className="h-3.5 w-4 mx-auto rounded bg-slate-200" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  filteredWorkers.map((w, idx) => {
                    const s = summary(w.tareo)
                    return (
                      <tr
                        key={w.id}
                        className={`transition-colors hover:bg-blue-50/40 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                      >
                        <td className="sticky left-0 z-10 whitespace-nowrap border-r border-slate-100 bg-inherit px-3 py-1.5 font-medium text-slate-800 shadow-[1px_0_0_0_#e2e8f0]">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-600" />
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
                              isToday ? 'bg-blue-50/80' : weekend ? 'bg-rose-50/20' : ''
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
                })
              )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 space-y-1">
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
