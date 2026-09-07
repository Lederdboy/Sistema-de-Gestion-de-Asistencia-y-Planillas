import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  Palmtree,
  Calendar,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Plus,
  Download,
  Printer,
  Info,
  DollarSign,
  Users,
  X,
  Plane,
  Sun,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react'
import {
  SEDES,
  INITIAL_VACACIONES_REQUESTS,
  getVacationRecordForWorker,
} from '../../data/mockData'

export default function VacacionesView({
  workers,
  onScheduleVacation,
  showToast,
}) {
  // Pestaña activa ('record' | 'solicitudes' | 'cronograma' | 'venta')
  const [activeTab, setActiveTab] = useState('record')

  // Solicitudes en memoria
  const [requests, setRequests] = useState(INITIAL_VACACIONES_REQUESTS)

  // Filtros pestaña Récord
  const [searchRecord, setSearchRecord] = useState('')
  const [filterSedeRecord, setFilterSedeRecord] = useState('')
  const [filterEstadoRecord, setFilterEstadoRecord] = useState('')

  // Filtros pestaña Solicitudes
  const [searchReq, setSearchReq] = useState('')
  const [filterEstadoReq, setFilterEstadoReq] = useState('')

  // Modales
  const [showNewModal, setShowNewModal] = useState(false)
  const [selectedWorkerDetail, setSelectedWorkerDetail] = useState(null)
  const [papeletaModal, setPapeletaModal] = useState(null)

  // Formulario nueva solicitud
  const [form, setForm] = useState({
    trabajadorId: '',
    tipo: 'Goce Regular',
    fechaInicio: '2026-09-10',
    fechaFin: '2026-09-24',
    dias: 15,
    periodo: '2024-2025',
    observaciones: '',
    syncTareo: true,
  })

  // Simulador de venta de vacaciones
  const [simWorkerId, setSimWorkerId] = useState(workers[0]?.id || '')
  const [simDiasVenta, setSimDiasVenta] = useState(15)

  // Calcular récord para cada trabajador
  const workersWithRecord = useMemo(() => {
    return workers.map((w) => {
      const record = getVacationRecordForWorker(w, requests)
      return { ...w, record }
    })
  }, [workers, requests])

  // Métricas globales
  const kpis = useMemo(() => {
    const enGoce = workersWithRecord.filter(
      (w) =>
        w.estado === 'Vacaciones' ||
        requests.some(
          (r) => r.trabajadorId === w.id && r.estado === 'En Goce'
        )
    ).length

    const totalSaldo = workersWithRecord.reduce(
      (sum, w) => sum + (w.record?.saldoPendiente || 0),
      0
    )

    const proximasSalidas = requests.filter(
      (r) => r.estado === 'Programada' || r.estado === 'Aprobada'
    ).length

    const alertasRiesgo = workersWithRecord.filter(
      (w) => w.record?.estadoRecord === 'Riesgo / Por Vencer'
    ).length

    return { enGoce, totalSaldo, proximasSalidas, alertasRiesgo }
  }, [workersWithRecord, requests])

  // Filtrado de Récord
  const filteredRecords = useMemo(() => {
    return workersWithRecord.filter((w) => {
      const matchSearch =
        !searchRecord ||
        w.nombre.toLowerCase().includes(searchRecord.toLowerCase()) ||
        w.dni.includes(searchRecord) ||
        w.cargo.toLowerCase().includes(searchRecord.toLowerCase())
      const matchSede = !filterSedeRecord || w.sedeId === filterSedeRecord
      const matchEstado =
        !filterEstadoRecord || w.record?.estadoRecord === filterEstadoRecord
      return matchSearch && matchSede && matchEstado
    })
  }, [workersWithRecord, searchRecord, filterSedeRecord, filterEstadoRecord])

  // Filtrado de Solicitudes
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const worker = workers.find((w) => w.id === r.trabajadorId)
      const matchSearch =
        !searchReq ||
        (worker && worker.nombre.toLowerCase().includes(searchReq.toLowerCase())) ||
        (worker && worker.dni.includes(searchReq)) ||
        r.id.toLowerCase().includes(searchReq.toLowerCase())
      const matchEstado = !filterEstadoReq || r.estado === filterEstadoReq
      return matchSearch && matchEstado
    })
  }, [requests, workers, searchReq, filterEstadoReq])

  // Manejo de cálculo automático de días entre fechas
  const handleDateChange = (field, val) => {
    const updated = { ...form, [field]: val }
    if (updated.fechaInicio && updated.fechaFin) {
      const d1 = new Date(updated.fechaInicio)
      const d2 = new Date(updated.fechaFin)
      if (d2 >= d1) {
        const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1
        updated.dias = diffDays
      }
    }
    setForm(updated)
  }

  // Guardar nueva solicitud
  const handleCreateRequest = (e) => {
    e.preventDefault()
    if (!form.trabajadorId) {
      showToast('Por favor selecciona un colaborador.', 'error')
      return
    }

    const worker = workers.find((w) => w.id === Number(form.trabajadorId))
    if (!worker) return

    const newId = `VAC-2026-${String(requests.length + 1).padStart(3, '0')}`
    const isEnGoce =
      form.fechaInicio <= '2026-09-07' && form.fechaFin >= '2026-09-07'
    const estado = isEnGoce ? 'En Goce' : 'Programada'

    const newRequest = {
      id: newId,
      trabajadorId: Number(form.trabajadorId),
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin,
      dias: Number(form.dias),
      tipo: form.tipo,
      periodo: form.periodo,
      estado,
      documento: `SOL-VAC-${String(requests.length + 20).padStart(3, '0')}`,
      observaciones: form.observaciones || 'Solicitud registrada desde el panel de RRHH.',
      aprobadoPor: 'Carlos Mendoza (Admin)',
      fechaRegistro: new Date().toISOString().split('T')[0],
    }

    setRequests([newRequest, ...requests])

    // Sincronizar con tareo y estado si fue solicitado
    if (form.syncTareo && onScheduleVacation) {
      onScheduleVacation({
        workerId: Number(form.trabajadorId),
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        dias: Number(form.dias),
        isEnGoce,
      })
    }

    setShowNewModal(false)
    setForm({
      trabajadorId: '',
      tipo: 'Goce Regular',
      fechaInicio: '2026-09-10',
      fechaFin: '2026-09-24',
      dias: 15,
      periodo: '2024-2025',
      observaciones: '',
      syncTareo: true,
    })

    showToast(
      `Vacaciones programadas para ${worker.nombre} (${newRequest.dias} días) con éxito.`,
      'success'
    )
  }

  // Aprobar solicitud pendiente
  const handleApproveRequest = (reqId) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === reqId) {
          const isEnGoce =
            r.fechaInicio <= '2026-09-07' && r.fechaFin >= '2026-09-07'
          return {
            ...r,
            estado: isEnGoce ? 'En Goce' : 'Aprobada',
            aprobadoPor: 'Carlos Mendoza (Admin)',
          }
        }
        return r
      })
    )
    showToast('Solicitud vacacional aprobada exitosamente.', 'success')
  }

  // Exportar reporte
  const handleExport = () => {
    showToast(
      'Generando reporte consolidado de récord vacacional (Excel / D.L. 713)...',
      'info'
    )
    setTimeout(() => {
      showToast('Reporte de Vacaciones 2026 descargado correctamente.', 'success')
    }, 1200)
  }

  // Obtener colaborador del simulador
  const simWorker = workers.find((w) => w.id === Number(simWorkerId)) || workers[0]
  const simValorDia = simWorker ? simWorker.sueldoBase / 30 : 0
  const simMontoVenta = (simValorDia * simDiasVenta).toFixed(2)

  return (
    <div className="space-y-4">
      {/* ─── Encabezado del Módulo (Alineado exactamente con PersonalView / TareoView) ─── */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Palmtree size={16} className="text-blue-600" />
            Gestión y Control de Vacaciones
            <span className="ml-1 px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded">
              D.L. 713 / D.L. 1405
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervisión de récords laborales, programación de salidas físicas, convenios de venta y prevención de triple vacacional
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="h-9 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download size={13} className="text-slate-500" />
            <span>Exportar Récord</span>
          </button>

          <button
            onClick={() => setShowNewModal(true)}
            className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <Plus size={14} />
            <span>Programar Vacaciones</span>
          </button>
        </div>
      </div>

      {/* ─── KPI Cards (Iconos libres, sin cuadros contenedores) ─────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* En Goce Actualmente */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex items-center justify-between hover:border-slate-300 transition-colors">
          <div>
            <p className="text-xs font-medium text-slate-500">En Goce Hoy</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-slate-900">{kpis.enGoce}</span>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                En descanso
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Periodo 2026-09</p>
          </div>
          <Sun size={24} className="text-amber-500 flex-shrink-0" />
        </div>

        {/* Saldo Pendiente Global */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex items-center justify-between hover:border-slate-300 transition-colors">
          <div>
            <p className="text-xs font-medium text-slate-500">Saldo Pendiente Global</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-slate-900">{kpis.totalSaldo}</span>
              <span className="text-xs text-slate-400">días</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Promedio: {(kpis.totalSaldo / (workers.length || 1)).toFixed(1)} d / colab.
            </p>
          </div>
          <CalendarDays size={24} className="text-blue-500 flex-shrink-0" />
        </div>

        {/* Próximas Salidas */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex items-center justify-between hover:border-slate-300 transition-colors">
          <div>
            <p className="text-xs font-medium text-slate-500">Próximas Salidas</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-slate-900">{kpis.proximasSalidas}</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                Confirmadas
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Próximos 30-45 días</p>
          </div>
          <Plane size={24} className="text-emerald-500 flex-shrink-0" />
        </div>

        {/* Alertas de Vencimiento */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex items-center justify-between hover:border-slate-300 transition-colors">
          <div>
            <p className="text-xs font-medium text-slate-500">Alertas de Vencimiento</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-rose-600">{kpis.alertasRiesgo}</span>
              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                Riesgo Legal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Evita Triple Vacacional</p>
          </div>
          <ShieldAlert size={24} className="text-rose-500 flex-shrink-0" />
        </div>
      </div>

      {/* ─── Pestañas de Navegación del Módulo ────────────────────────────── */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('record')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'record'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users size={14} />
          <span>Control de Récord y Saldos</span>
          <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded-full text-[10px]">
            {workers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('solicitudes')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'solicitudes'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText size={14} />
          <span>Solicitudes y Salidas</span>
          <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded-full text-[10px]">
            {requests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('cronograma')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'cronograma'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar size={14} />
          <span>Cronograma Mensual (Setiembre)</span>
        </button>

        <button
          onClick={() => setActiveTab('venta')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'venta'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign size={14} />
          <span>Venta & Fraccionamiento (D.L. 1405)</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* PESTAÑA 1: CONTROL DE RÉCORD Y SALDOS                                  */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'record' && (
        <div className="space-y-3">
          {/* Barra de Búsqueda y Filtros */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchRecord}
                onChange={(e) => setSearchRecord(e.target.value)}
                placeholder="Buscar por DNI, apellidos, nombres o cargo..."
                className="w-full h-9 pl-9 pr-3 text-xs border border-slate-200 rounded-md bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterSedeRecord}
              onChange={(e) => setFilterSedeRecord(e.target.value)}
              className="h-9 px-3 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todas las Sedes</option>
              {SEDES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>

            <select
              value={filterEstadoRecord}
              onChange={(e) => setFilterEstadoRecord(e.target.value)}
              className="h-9 px-3 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos los Estados de Récord</option>
              <option value="Al Día">Al Día</option>
              <option value="Pendiente Programar">Pendiente Programar</option>
              <option value="Riesgo / Por Vencer">Riesgo / Por Vencer</option>
            </select>

            {(searchRecord || filterSedeRecord || filterEstadoRecord) && (
              <button
                onClick={() => {
                  setSearchRecord('')
                  setFilterSedeRecord('')
                  setFilterEstadoRecord('')
                }}
                className="h-9 px-2 text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Tabla de Colaboradores y Récord */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Colaborador</th>
                    <th className="px-3 py-3">Ingreso & Antigüedad</th>
                    <th className="px-3 py-3">Periodo Actual</th>
                    <th className="px-3 py-3 text-center">Ganados</th>
                    <th className="px-3 py-3 text-center">Gozados</th>
                    <th className="px-3 py-3 text-center">Vendidos</th>
                    <th className="px-3 py-3 text-center font-bold text-slate-900">Saldo Pendiente</th>
                    <th className="px-3 py-3 text-center">Estado Récord</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                        No se encontraron colaboradores con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((w) => {
                      const sede = SEDES.find((s) => s.id === w.sedeId)
                      const rec = w.record
                      const isVacationNow = w.estado === 'Vacaciones'

                      return (
                        <tr
                          key={w.id}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            isVacationNow ? 'bg-amber-50/20' : ''
                          }`}
                        >
                          {/* Colaborador */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full font-bold flex items-center justify-center flex-shrink-0 text-xs ${
                                  isVacationNow
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {w.nombre.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer"
                                    onClick={() => setSelectedWorkerDetail(w)}
                                  >
                                    {w.nombre}
                                  </span>
                                  {isVacationNow && (
                                    <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 border border-amber-200 rounded text-[9px] font-bold">
                                      En Vacaciones
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                  <span>DNI: {w.dni}</span>
                                  <span>·</span>
                                  <span>{w.cargo}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Ingreso y Antigüedad */}
                          <td className="px-3 py-3">
                            <div className="text-slate-800 font-medium">{w.fechaIngreso}</div>
                            <div className="text-[11px] text-slate-500 font-normal">
                              {rec.aniosCompletos} {rec.aniosCompletos === 1 ? 'año' : 'años'} de servicio
                            </div>
                          </td>

                          {/* Periodo computable */}
                          <td className="px-3 py-3">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium border border-slate-200">
                              {rec.periodoActual}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-1">
                              {sede ? sede.nombre.split('-')[0] : 'Sede Central'}
                            </div>
                          </td>

                          {/* Ganados */}
                          <td className="px-3 py-3 text-center">
                            <span className="font-semibold text-slate-700">{rec.diasGanados} d</span>
                          </td>

                          {/* Gozados */}
                          <td className="px-3 py-3 text-center">
                            <span className="font-medium text-emerald-700">{rec.diasGozados} d</span>
                          </td>

                          {/* Vendidos */}
                          <td className="px-3 py-3 text-center">
                            <span className="text-slate-600">
                              {rec.diasVendidos > 0 ? `${rec.diasVendidos} d` : '—'}
                            </span>
                          </td>

                          {/* Saldo Pendiente */}
                          <td className="px-3 py-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded font-bold text-xs ${
                                rec.saldoPendiente > 30
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : rec.saldoPendiente >= 15
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {rec.saldoPendiente} días
                            </span>
                          </td>

                          {/* Estado Récord */}
                          <td className="px-3 py-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${rec.estadoCls}`}
                            >
                              {rec.estadoRecord === 'Riesgo / Por Vencer' && (
                                <AlertTriangle size={11} className="text-rose-600" />
                              )}
                              {rec.estadoRecord === 'Al Día' && (
                                <CheckCircle2 size={11} className="text-emerald-600" />
                              )}
                              {rec.estadoRecord}
                            </span>
                          </td>

                          {/* Acciones */}
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setForm((prev) => ({
                                    ...prev,
                                    trabajadorId: String(w.id),
                                    dias: Math.min(15, rec.saldoPendiente || 15),
                                  }))
                                  setShowNewModal(true)
                                }}
                                title="Programar salida vacacional"
                                className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-md transition-colors cursor-pointer"
                              >
                                Programar
                              </button>

                              <button
                                onClick={() => setSelectedWorkerDetail(w)}
                                title="Ver ficha y récord histórico"
                                className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
                              >
                                Ver Ficha
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pie de tabla */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Al Día (&lt;15d)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Pendiente (15-30d)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Riesgo Legal (&gt;30d)
                </span>
              </div>
              <span className="font-semibold text-slate-700">
                Total {filteredRecords.length} colaboradores
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* PESTAÑA 2: SOLICITUDES Y SALIDAS PROGRAMADAS                           */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'solicitudes' && (
        <div className="space-y-3">
          {/* Barra de Filtros */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchReq}
                onChange={(e) => setSearchReq(e.target.value)}
                placeholder="Buscar por colaborador, DNI o código..."
                className="w-full h-9 pl-9 pr-3 text-xs border border-slate-200 rounded-md bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterEstadoReq}
              onChange={(e) => setFilterEstadoReq(e.target.value)}
              className="h-9 px-3 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos los Estados</option>
              <option value="En Goce">En Goce</option>
              <option value="Aprobada">Aprobada</option>
              <option value="Programada">Programada</option>
              <option value="Pendiente">Pendiente de Aprobación</option>
              <option value="Finalizada">Finalizada</option>
            </select>

            <button
              onClick={() => setShowNewModal(true)}
              className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
            >
              <Plus size={14} />
              <span>Nueva Solicitud</span>
            </button>
          </div>

          {/* Tabla de Solicitudes */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Código</th>
                    <th className="px-3 py-3">Colaborador</th>
                    <th className="px-3 py-3">Rango de Fechas</th>
                    <th className="px-3 py-3 text-center">Días</th>
                    <th className="px-3 py-3">Modalidad / Periodo</th>
                    <th className="px-3 py-3 text-center">Estado</th>
                    <th className="px-3 py-3">Documento / Autorización</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                        No hay solicitudes registradas con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((r) => {
                      const worker = workers.find((w) => w.id === r.trabajadorId)
                      const isPending = r.estado === 'Pendiente'
                      const isEnGoce = r.estado === 'En Goce'

                      let badgeCls = 'bg-slate-100 text-slate-700 border-slate-200'
                      if (r.estado === 'En Goce') badgeCls = 'bg-amber-100 text-amber-800 border-amber-300 font-bold'
                      if (r.estado === 'Aprobada') badgeCls = 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      if (r.estado === 'Programada') badgeCls = 'bg-blue-100 text-blue-800 border-blue-300'
                      if (r.estado === 'Pendiente') badgeCls = 'bg-purple-100 text-purple-800 border-purple-300 animate-pulse'
                      if (r.estado === 'Finalizada') badgeCls = 'bg-slate-100 text-slate-600 border-slate-200'

                      return (
                        <tr
                          key={r.id}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            isEnGoce ? 'bg-amber-50/20' : ''
                          }`}
                        >
                          <td className="px-4 py-3 font-mono font-bold text-slate-700">
                            {r.id}
                          </td>

                          <td className="px-3 py-3">
                            <div className="font-semibold text-slate-900">
                              {worker ? worker.nombre : 'Colaborador no encontrado'}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              DNI: {worker ? worker.dni : '—'} · {worker ? worker.cargo : ''}
                            </div>
                          </td>

                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1.5 font-medium text-slate-800">
                              <span>{r.fechaInicio}</span>
                              <ArrowRight size={12} className="text-slate-400" />
                              <span>{r.fechaFin}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Regreso: {r.fechaFin}
                            </div>
                          </td>

                          <td className="px-3 py-3 text-center">
                            <span className="font-bold text-slate-900 text-xs px-2 py-0.5 bg-slate-100 rounded">
                              {r.dias} d
                            </span>
                          </td>

                          <td className="px-3 py-3">
                            <div className="font-medium text-slate-800">{r.tipo}</div>
                            <div className="text-[11px] text-slate-500">
                              Periodo: {r.periodo}
                            </div>
                          </td>

                          <td className="px-3 py-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] border ${badgeCls}`}
                            >
                              {r.estado}
                            </span>
                          </td>

                          <td className="px-3 py-3">
                            <div className="text-slate-800 font-mono text-[11px] font-semibold">
                              {r.documento}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {r.aprobadoPor || 'Pendiente de firma'}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {isPending && (
                                <button
                                  onClick={() => handleApproveRequest(r.id)}
                                  className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors cursor-pointer"
                                >
                                  Aprobar
                                </button>
                              )}

                              <button
                                onClick={() => setPapeletaModal({ req: r, worker })}
                                title="Ver papeleta y constancia oficial de vacaciones"
                                className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <FileText size={12} />
                                <span>Papeleta</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* PESTAÑA 3: CRONOGRAMA MENSUAL (SETIEMBRE 2026)                        */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'cronograma' && (
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <CalendarDays size={14} className="text-blue-600" />
                  Cronograma Visual de Vacaciones — Setiembre 2026
                </h3>
                <p className="text-[11px] text-slate-500">
                  Monitoreo de ausencias diarias programadas para la cobertura de puestos en todas las sedes
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-400 border border-amber-500" />
                  <span className="font-semibold text-slate-700">En Goce Efectivo</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-blue-400 border border-blue-500" />
                  <span className="font-semibold text-slate-700">Programada</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-blue-100 border border-blue-300" />
                  <span className="text-slate-500">Día de Hoy (07 Sep)</span>
                </span>
              </div>
            </div>

            {/* Matriz Cronograma 30 días */}
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] text-slate-500 font-semibold border-b border-slate-200">
                    <th className="px-3 py-2 text-left sticky left-0 bg-slate-50 z-10 w-48 min-w-[190px]">
                      Colaborador
                    </th>
                    {Array.from({ length: 30 }, (_, i) => {
                      const day = i + 1
                      const dayOfWeek = (i + 1) % 7
                      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
                      const isToday = day === 7

                      return (
                        <th
                          key={day}
                          className={`w-7 text-center py-2 border-r border-slate-100 ${
                            isToday
                              ? 'bg-blue-600 text-white font-bold'
                              : isWeekend
                              ? 'bg-slate-100/70 text-slate-400'
                              : 'text-slate-600'
                          }`}
                        >
                          {day}
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {workers.map((w) => {
                    const workerReqs = requests.filter(
                      (r) => r.trabajadorId === w.id && r.tipo !== 'Venta de Vacaciones'
                    )

                    return (
                      <tr key={w.id} className="hover:bg-slate-50/70">
                        {/* Nombre del Colaborador */}
                        <td className="px-3 py-2 sticky left-0 bg-white z-10 border-r border-slate-200 font-medium text-slate-900 truncate">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-700 flex items-center justify-center flex-shrink-0">
                              {w.nombre.slice(0, 1)}
                            </span>
                            <span className="truncate max-w-[160px]" title={w.nombre}>
                              {w.nombre}
                            </span>
                          </div>
                        </td>

                        {/* Días 1 a 30 */}
                        {Array.from({ length: 30 }, (_, i) => {
                          const day = i + 1
                          const dateStr = `2026-09-${String(day).padStart(2, '0')}`
                          const isToday = day === 7

                          const matchingReq = workerReqs.find(
                            (r) => dateStr >= r.fechaInicio && dateStr <= r.fechaFin
                          )

                          let cellBg = ''
                          if (matchingReq) {
                            cellBg =
                              matchingReq.estado === 'En Goce'
                                ? 'bg-amber-300 text-amber-900 font-bold'
                                : 'bg-blue-300 text-blue-900 font-bold'
                          } else if (isToday) {
                            cellBg = 'bg-blue-50'
                          }

                          return (
                            <td
                              key={day}
                              className={`text-center py-1.5 border-r border-slate-100 ${cellBg}`}
                              title={
                                matchingReq
                                  ? `${w.nombre}: Vacaciones (${matchingReq.estado})`
                                  : undefined
                              }
                            >
                              {matchingReq ? 'V' : ''}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-2">
              <Info size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Regla de continuidad (D.L. 713):</span> El descanso vacacional empieza a computarse desde el primer día hábil y abarca los descansos semanales comprendidos en el periodo pactado.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* PESTAÑA 4: VENTA Y FRACCIONAMIENTO (D.L. 1405)                         */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'venta' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Calculador de Convenio de Venta */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
              <DollarSign size={16} className="text-emerald-600" />
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  Simulador de Venta de Vacaciones (Reducción Vacacional)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Cálculo de la compensación económica por venta de hasta 15 días según el Art. 19 del D.L. 713
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Seleccionar Colaborador
                </label>
                <select
                  value={simWorkerId}
                  onChange={(e) => setSimWorkerId(e.target.value)}
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.nombre} — Sueldo: S/ {w.sueldoBase.toFixed(2)} ({w.cargo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Días a Vender (Máximo legal: 15 días)
                  </label>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {simDiasVenta} días
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={simDiasVenta}
                  onChange={(e) => setSimDiasVenta(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>1 día</span>
                  <span>7 días</span>
                  <span>15 días (tope legal)</span>
                </div>
              </div>

              {/* Resultado del cálculo */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Sueldo Básico Mensual:</span>
                  <span className="font-semibold text-slate-900">
                    S/ {simWorker?.sueldoBase.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Remuneración Computable Diaria (Sueldo / 30):</span>
                  <span className="font-semibold text-slate-900">
                    S/ {simValorDia.toFixed(2)} / día
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Días mínimos de goce físico obligatorio:</span>
                  <span className="font-semibold text-emerald-700">
                    {30 - simDiasVenta} días
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Compensación Económica a Abonar:
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Sujeto a aportes de ley en nómina
                    </span>
                  </div>
                  <span className="text-lg font-bold text-emerald-600">
                    S/ {simMontoVenta}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => {
                    setForm({
                      trabajadorId: String(simWorkerId),
                      tipo: 'Venta de Vacaciones',
                      fechaInicio: '2026-09-01',
                      fechaFin: '2026-09-15',
                      dias: simDiasVenta,
                      periodo: '2024-2025',
                      observaciones: `Convenio de venta y reducción vacacional por ${simDiasVenta} días con compensación de S/ ${simMontoVenta}.`,
                      syncTareo: false,
                    })
                    setShowNewModal(true)
                  }}
                  className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <DollarSign size={14} />
                  <span>Generar Convenio de Venta</span>
                </button>
              </div>
            </div>
          </div>

          {/* Guía y Normativa Laboral Peruana */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-blue-600">
                <Info size={13} />
                Reglas Clave del D.L. 713 y D.L. 1405
              </h4>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong>Tope de Venta (15 días):</strong> Solo se puede vender hasta 15 días. Los 15 restantes deben gozarse físicamente.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong>Fraccionamiento (D.L. 1405):</strong> Se debe disfrutar al menos de un bloque de 15 días continuos (o 7 y 8 días). El saldo restante puede fraccionarse en periodos de hasta 1 día.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong>Triple Vacacional:</strong> Si no goza sus vacaciones dentro de los 12 meses posteriores al año en que adquirió el derecho, tiene derecho a triple compensación (sueldo + remuneración vacacional + indemnización).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong>Convenio por Escrito:</strong> Debe existir acuerdo firmado antes del inicio del descanso o pago de la venta.
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-lg p-3.5 text-white shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                Cumplimiento Laboral SUNAFIL
              </h4>
              <p className="text-xs text-blue-100 leading-relaxed mt-1">
                Conservar los convenios de fraccionamiento y boletas firmadas en el legajo previene contingencias en inspecciones laborales.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL 1: NUEVA PROGRAMACIÓN / SOLICITUD (Renderizado vía Portal)       */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {showNewModal &&
        createPortal(
          <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
              {/* Cabecera limpia sin cajas */}
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <Palmtree size={16} className="text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Programar Salida / Solicitud de Vacaciones
                  </h3>
                </div>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleCreateRequest} className="p-5 space-y-3.5 text-xs">
                {/* Colaborador */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Colaborador <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={form.trabajadorId}
                    onChange={(e) => setForm({ ...form, trabajadorId: e.target.value })}
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- Selecciona un colaborador --</option>
                    {workers.map((w) => {
                      const rec = getVacationRecordForWorker(w, requests)
                      return (
                        <option key={w.id} value={w.id}>
                          {w.nombre} (DNI: {w.dni}) — Saldo: {rec.saldoPendiente} días
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* Modalidad y Periodo */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Modalidad
                    </label>
                    <select
                      value={form.tipo}
                      onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                      className="w-full h-9 px-3 text-xs border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Goce Regular">Goce Regular (Continuo)</option>
                      <option value="Fraccionamiento (D.L. 1405)">Fraccionamiento (D.L. 1405)</option>
                      <option value="Venta de Vacaciones">Venta de Vacaciones (Reducción)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Periodo Devengado
                    </label>
                    <select
                      value={form.periodo}
                      onChange={(e) => setForm({ ...form, periodo: e.target.value })}
                      className="w-full h-9 px-3 text-xs border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="2024-2025">Periodo 2024 - 2025</option>
                      <option value="2023-2024">Periodo 2023 - 2024</option>
                      <option value="2025-2026">Periodo 2025 - 2026</option>
                    </select>
                  </div>
                </div>

                {/* Fechas y Días */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Fecha Inicio <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={form.fechaInicio}
                      onChange={(e) => handleDateChange('fechaInicio', e.target.value)}
                      className="w-full h-9 px-2.5 text-xs border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Fecha Fin <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={form.fechaFin}
                      onChange={(e) => handleDateChange('fechaFin', e.target.value)}
                      className="w-full h-9 px-2.5 text-xs border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Días Totales
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={form.dias}
                      onChange={(e) => setForm({ ...form, dias: Number(e.target.value) })}
                      className="w-full h-9 px-3 text-xs border border-slate-200 rounded-md bg-slate-50 text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Observaciones */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Observaciones / Sustento
                  </label>
                  <textarea
                    rows="2"
                    value={form.observaciones}
                    onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                    placeholder="Ej. Solicitud acordada según rol anual de descansos..."
                    className="w-full p-2 text-xs border border-slate-200 rounded-md bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Sincronización con Tareo */}
                <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-2.5 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="syncTareo"
                    checked={form.syncTareo}
                    onChange={(e) => setForm({ ...form, syncTareo: e.target.checked })}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="syncTareo" className="text-xs text-blue-900 cursor-pointer select-none">
                    <span className="font-semibold block">
                      Sincronizar con el Tareo de Setiembre 2026
                    </span>
                    <span className="text-[11px] text-blue-700 block">
                      Asigna el código 'V' en los días correspondientes y actualiza el estado del colaborador.
                    </span>
                  </label>
                </div>

                {/* Botones */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    className="h-9 px-3.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="h-9 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 cursor-pointer"
                  >
                    Guardar Programación
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL 2: FICHA / RÉCORD DE COLABORADOR (Renderizado vía Portal)         */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {selectedWorkerDetail &&
        createPortal(
          <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150 max-h-[92vh] flex flex-col">
              {/* Cabecera limpia */}
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    {selectedWorkerDetail.nombre.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {selectedWorkerDetail.nombre}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      DNI: {selectedWorkerDetail.dni} · {selectedWorkerDetail.cargo} · {selectedWorkerDetail.regimen}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedWorkerDetail(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Contenido con scroll */}
              <div className="p-5 overflow-y-auto space-y-3.5 text-xs">
                {/* Resumen de Días */}
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Días Ganados</span>
                    <span className="text-lg font-bold text-slate-900">
                      {selectedWorkerDetail.record?.diasGanados} d
                    </span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 block">Días Gozados</span>
                    <span className="text-lg font-bold text-emerald-700">
                      {selectedWorkerDetail.record?.diasGozados} d
                    </span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                    <span className="text-[10px] uppercase font-bold text-blue-600 block">Saldo Disponible</span>
                    <span className="text-lg font-bold text-blue-800">
                      {selectedWorkerDetail.record?.saldoPendiente} días
                    </span>
                  </div>
                </div>

                {/* Datos Laborales */}
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fecha de Ingreso:</span>
                    <span className="font-semibold text-slate-800">{selectedWorkerDetail.fechaIngreso}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Antigüedad Computable:</span>
                    <span className="font-semibold text-slate-800">{selectedWorkerDetail.record?.aniosCompletos} años</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sueldo Básico Actual:</span>
                    <span className="font-semibold text-slate-800">S/ {selectedWorkerDetail.sueldoBase.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estado de Récord:</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${selectedWorkerDetail.record?.estadoCls}`}>
                      {selectedWorkerDetail.record?.estadoRecord}
                    </span>
                  </div>
                </div>

                {/* Historial */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1.5">
                    Historial de Descansos y Convenios
                  </h4>
                  {requests.filter((r) => r.trabajadorId === selectedWorkerDetail.id).length === 0 ? (
                    <p className="text-slate-400 bg-slate-50 p-3 rounded text-center">
                      No tiene descansos o solicitudes registradas en la plataforma.
                    </p>
                  ) : (
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="px-2.5 py-1.5">Código</th>
                            <th className="px-2.5 py-1.5">Fechas</th>
                            <th className="px-2.5 py-1.5 text-center">Días</th>
                            <th className="px-2.5 py-1.5">Tipo</th>
                            <th className="px-2.5 py-1.5 text-center">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {requests
                            .filter((r) => r.trabajadorId === selectedWorkerDetail.id)
                            .map((r) => (
                              <tr key={r.id}>
                                <td className="px-2.5 py-1.5 font-mono font-bold text-slate-700">{r.id}</td>
                                <td className="px-2.5 py-1.5">{r.fechaInicio} al {r.fechaFin}</td>
                                <td className="px-2.5 py-1.5 text-center font-bold">{r.dias} d</td>
                                <td className="px-2.5 py-1.5">{r.tipo}</td>
                                <td className="px-2.5 py-1.5 text-center">
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100">
                                    {r.estado}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Pie de modal */}
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <button
                  onClick={() => {
                    showToast(`Constancia de récord vacacional de ${selectedWorkerDetail.nombre} generada en PDF.`, 'success')
                  }}
                  className="h-8 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={12} />
                  <span>Imprimir Ficha</span>
                </button>

                <button
                  onClick={() => setSelectedWorkerDetail(null)}
                  className="h-8 px-4 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-md cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL 3: PAPELETA OFICIAL DE SALIDA (Renderizado vía Portal)           */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {papeletaModal &&
        createPortal(
          <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
              {/* Cabecera limpia */}
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Papeleta de Salida Vacacional — D.L. 713
                  </h3>
                </div>
                <button
                  onClick={() => setPapeletaModal(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Formato Impreso */}
              <div className="p-5 space-y-3.5">
                <div className="border border-slate-300 rounded-lg p-4 bg-white space-y-3 text-xs">
                  <div className="flex justify-between items-start border-b border-slate-200 pb-2.5">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">SERVICIOS CORPORATIVOS S.A.C.</h4>
                      <p className="text-[10px] text-slate-500">RUC: 20100088899 · RRHH & Planillas</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-800 text-xs">{papeletaModal.req.documento}</span>
                      <p className="text-[10px] text-slate-400">Emisión: {papeletaModal.req.fechaRegistro}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-700 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Colaborador:</span>
                      <span className="font-bold text-slate-900">{papeletaModal.worker?.nombre}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">N° Documento (DNI):</span>
                      <span className="font-mono font-bold text-slate-900">{papeletaModal.worker?.dni}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Cargo:</span>
                      <span className="font-medium text-slate-800">{papeletaModal.worker?.cargo}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Periodo:</span>
                      <span className="font-semibold text-blue-700">{papeletaModal.req.periodo}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded p-2.5 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Desde</span>
                      <span className="font-bold text-slate-900">{papeletaModal.req.fechaInicio}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Hasta</span>
                      <span className="font-bold text-slate-900">{papeletaModal.req.fechaFin}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Total Días</span>
                      <span className="font-black text-blue-600">{papeletaModal.req.dias} días</span>
                    </div>
                  </div>

                  <div className="pt-4 grid grid-cols-2 gap-4 text-center text-[10px] text-slate-500">
                    <div className="border-t border-slate-300 pt-1.5">
                      <p className="font-semibold text-slate-800">Firma del Trabajador</p>
                      <p className="text-[9px] text-slate-400">DNI: {papeletaModal.worker?.dni}</p>
                    </div>
                    <div className="border-t border-slate-300 pt-1.5">
                      <p className="font-semibold text-slate-800">V°B° Recursos Humanos</p>
                      <p className="text-[9px] text-slate-400">Planilla Enterprise</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pie */}
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
                <button
                  onClick={() => setPapeletaModal(null)}
                  className="h-8 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-md cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    showToast('Papeleta enviada a imprimir.', 'success')
                    setPapeletaModal(null)
                  }}
                  className="h-8 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-1 cursor-pointer"
                >
                  <Printer size={12} />
                  <span>Imprimir</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
