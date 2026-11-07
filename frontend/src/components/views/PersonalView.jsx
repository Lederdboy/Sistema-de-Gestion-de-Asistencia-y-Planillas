import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Users,
  Search,
  Plus,
  Building2,
  MapPin,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  CheckCircle2,
  X,
  FileText,
  Filter,
  Briefcase,
  DollarSign,
  ShieldCheck,
  Clock,
  Printer,
  Copy,
  Check,
  AlertCircle,
  Award,
  Wallet,
  Activity,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { EMPRESAS, SEDES, AFPS, BADGE_CONFIG, PARAMETROS_LABORALES } from '../../data/mockData'

export default function PersonalView({ workers, onAddWorker, showToast, loading = false }) {
  const [search, setSearch] = useState('')
  const [selectedSede, setSelectedSede] = useState('')
  const [selectedEstado, setSelectedEstado] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [copiedText, setCopiedText] = useState('')

  const handleCopy = (text, label) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
    }
    setCopiedText(label)
    setTimeout(() => setCopiedText(''), 2000)
  }

  const getAntiguedad = (fechaStr) => {
    if (!fechaStr) return '1 año'
    const fecha = new Date(fechaStr)
    if (isNaN(fecha.getTime())) return '1 año'
    const hoy = new Date()
    let anios = hoy.getFullYear() - fecha.getFullYear()
    let meses = hoy.getMonth() - fecha.getMonth()
    if (meses < 0) {
      anios--
      meses += 12
    }
    if (anios <= 0) return `${meses || 1} meses`
    return `${anios} año${anios > 1 ? 's' : ''}${meses > 0 ? `, ${meses} m` : ''}`
  }

  // Formulario nuevo colaborador
  const [form, setForm] = useState({
    dni: '',
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    cargo: '',
    empresaId: '1',
    sedeId: '1',
    sueldoBase: '1500',
    afp: 'integra',
    asigFamiliar: true,
    email: '',
    telefono: '',
    regimen: 'D.L. 728',
  })

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-5 w-48 rounded-full bg-slate-200" />
            <div className="h-3.5 w-64 rounded-full bg-slate-200" />
          </div>
          <div className="h-9 w-36 rounded-xl bg-slate-200" />
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-wrap items-center gap-3">
          <div className="h-9 flex-1 min-w-[240px] rounded-xl bg-slate-200" />
          <div className="h-9 w-36 rounded-xl bg-slate-200" />
          <div className="h-9 w-36 rounded-xl bg-slate-200" />
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden p-4 space-y-3.5">
          <div className="h-6 w-full rounded-lg bg-slate-200" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-40 rounded-full bg-slate-200" />
                  <div className="h-2.5 w-24 rounded-full bg-slate-200" />
                </div>
              </div>
              <div className="h-3.5 w-20 rounded-full bg-slate-200" />
              <div className="h-3.5 w-28 rounded-full bg-slate-200" />
              <div className="h-3.5 w-24 rounded-full bg-slate-200" />
              <div className="h-3.5 w-20 rounded-full bg-slate-200" />
              <div className="h-6 w-16 rounded-full bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const filtered = workers.filter((w) => {
    const matchSearch =
      !search ||
      w.nombre.toLowerCase().includes(search.toLowerCase()) ||
      w.dni.includes(search) ||
      w.cargo.toLowerCase().includes(search.toLowerCase())
    const matchSede = !selectedSede || w.sedeId === selectedSede
    const matchEstado = !selectedEstado || w.estado === selectedEstado
    return matchSearch && matchSede && matchEstado
  })

  const handleCreateWorker = (e) => {
    e.preventDefault()
    if (!form.dni || !form.nombres || !form.apellidoPaterno || !form.cargo || !form.sueldoBase) {
      showToast('Por favor completa los campos requeridos (DNI, Nombres, Apellidos, Cargo, Sueldo).', 'error')
      return
    }

    const apMaterno = form.apellidoMaterno.trim() || form.apellidoPaterno.trim() || 'Registrado'
    const fullName = `${form.nombres.trim()} ${form.apellidoPaterno.trim()} ${apMaterno}`.trim()

    const newWorker = {
      id: Date.now(),
      dni: form.dni.trim(),
      nombre: fullName,
      nombres: form.nombres.trim(),
      apellidoPaterno: form.apellidoPaterno.trim(),
      apellidoMaterno: apMaterno,
      cargo: form.cargo.trim(),
      empresaId: form.empresaId,
      sedeId: form.sedeId,
      sueldoBase: parseFloat(form.sueldoBase) || 1025.00,
      afp: form.afp,
      asigFamiliar: form.asigFamiliar,
      estado: 'Activo',
      fechaIngreso: new Date().toISOString().split('T')[0],
      regimen: form.regimen,
      email: form.email || `${form.nombres.toLowerCase().replace(/\s+/g, '.')}@empresa.com`,
      telefono: form.telefono || '999 000 000',
      // Tareo inicial de 31 días (días hábiles D, fines de semana DL)
      tareo: Array.from({ length: 31 }, (_, i) => {
        const dayOfWeek = (i + 1) % 7
        return (dayOfWeek === 0 || dayOfWeek === 6) ? 'DL' : 'D'
      }),
    }

    onAddWorker(newWorker)
    setShowNewModal(false)
    setForm({
      dni: '',
      nombres: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      cargo: '',
      empresaId: '1',
      sedeId: '1',
      sueldoBase: '1500',
      afp: 'integra',
      asigFamiliar: true,
      email: '',
      telefono: '',
      regimen: 'D.L. 728',
    })
    showToast(`Colaborador ${newWorker.nombre} registrado exitosamente.`, 'success')
  }

  return (
    <div className="space-y-4">
      {/* Header del módulo */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users size={16} className="text-blue-600" />
            Directorio General de Personal
          </h2>
          <p className="text-xs text-slate-500">
            Total {workers.length} trabajadores registrados · {filtered.length} visibles según filtros
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="w-full sm:w-auto h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus size={14} />
          <span>Nuevo Colaborador</span>
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1 min-w-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por DNI, nombres o cargo..."
            className="w-full h-9 pl-9 pr-3 text-xs border border-slate-200 rounded-lg bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2">
          <select
            value={selectedSede}
            onChange={(e) => setSelectedSede(e.target.value)}
            className="h-9 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 truncate"
          >
            <option value="">Todas las Sedes</option>
            {SEDES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>

          <select
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value)}
            className="h-9 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 truncate"
          >
            <option value="">Todos los Estados</option>
            <option value="Activo">Activo</option>
            <option value="Vacaciones">Vacaciones</option>
            <option value="Licencia">Licencia</option>
          </select>
        </div>
      </div>

      {/* Indicador de desplazamiento para móviles */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-blue-700 bg-blue-50/80 border border-blue-200 rounded-xl px-3 py-1.5 sm:hidden">
        <span>Desliza horizontalmente para ver todas las columnas</span>
      </div>

      {/* Tabla de Colaboradores */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="table-scroll-container pb-2">
          <table className="w-full min-w-[750px] text-xs text-left border-collapse select-auto">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Colaborador</th>
                <th className="px-3 py-3">DNI</th>
                <th className="px-3 py-3">Cargo y Régimen</th>
                <th className="px-3 py-3">Sede / Ubicación</th>
                <th className="px-3 py-3 text-right">Sueldo Básico</th>
                <th className="px-3 py-3 text-center">Pensión</th>
                <th className="px-3 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((w) => {
                const sedeObj = SEDES.find((s) => s.id === w.sedeId)
                const afpObj = AFPS.find((a) => a.id === w.afp)
                return (
                  <tr key={w.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Colaborador */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                          {w.nombre.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{w.nombre}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Mail size={11} /> {w.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* DNI */}
                    <td className="px-3 py-3 font-mono text-slate-600 font-medium">
                      {w.dni}
                    </td>

                    {/* Cargo */}
                    <td className="px-3 py-3">
                      <p className="font-medium text-slate-800">{w.cargo}</p>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {w.regimen || 'D.L. 728'}
                      </span>
                    </td>

                    {/* Sede */}
                    <td className="px-3 py-3 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-slate-400" />
                        <span>{sedeObj?.nombre || 'Sede Principal'}</span>
                      </div>
                    </td>

                    {/* Sueldo */}
                    <td className="px-3 py-3 text-right font-mono font-semibold text-slate-800">
                      S/ {Number(w.sueldoBase).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>

                    {/* AFP / ONP */}
                    <td className="px-3 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        w.afp === 'onp' ? 'bg-slate-100 text-slate-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {afpObj?.nombre || 'AFP'}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          w.estado === 'Activo'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${w.estado === 'Activo' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {w.estado}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedWorker(w)}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded border border-blue-200 transition-colors cursor-pointer"
                      >
                        Ver Ficha
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo Colaborador */}
      {showNewModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users size={18} className="text-black" />
                Registrar Nuevo Colaborador
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateWorker} className="space-y-3.5 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">DNI *</label>
                  <input
                    type="text"
                    maxLength={8}
                    required
                    value={form.dni}
                    onChange={(e) => setForm({ ...form, dni: e.target.value })}
                    placeholder="8 dígitos"
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sueldo Básico (S/) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.sueldoBase}
                    onChange={(e) => setForm({ ...form, sueldoBase: e.target.value })}
                    placeholder="1500.00"
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombres *</label>
                <input
                  type="text"
                  required
                  value={form.nombres}
                  onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                  placeholder="Ej: Juan Carlos"
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido Paterno *</label>
                  <input
                    type="text"
                    required
                    value={form.apellidoPaterno}
                    onChange={(e) => setForm({ ...form, apellidoPaterno: e.target.value })}
                    placeholder="Ej: Pérez"
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido Materno *</label>
                  <input
                    type="text"
                    required
                    value={form.apellidoMaterno}
                    onChange={(e) => setForm({ ...form, apellidoMaterno: e.target.value })}
                    placeholder="Ej: Gómez"
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cargo *</label>
                  <input
                    type="text"
                    required
                    value={form.cargo}
                    onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                    placeholder="Ej: Asistente de Operaciones"
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sistema de Pensión</label>
                  <select
                    value={form.afp}
                    onChange={(e) => setForm({ ...form, afp: e.target.value })}
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    {AFPS.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Empresa</label>
                  <select
                    value={form.empresaId}
                    onChange={(e) => setForm({ ...form, empresaId: e.target.value })}
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    {EMPRESAS.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sede de Trabajo</label>
                  <select
                    value={form.sedeId}
                    onChange={(e) => setForm({ ...form, sedeId: e.target.value })}
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    {SEDES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.asigFamiliar}
                    onChange={(e) => setForm({ ...form, asigFamiliar: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Tiene derecho a Asignación Familiar (Hijos menores o estudios superiores)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Guardar y Activar
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Ficha Integral del Colaborador (Legajo Laboral Expandido) */}
      {selectedWorker && typeof document !== 'undefined' && (() => {
        const empresaObj = EMPRESAS.find((e) => String(e.id) === String(selectedWorker.empresaId)) || EMPRESAS[0]
        const sedeObj = SEDES.find((s) => String(s.id) === String(selectedWorker.sedeId)) || SEDES[0]
        const afpObj = AFPS.find((a) => a.id.toLowerCase() === (selectedWorker.afp || '').toLowerCase()) || {
          id: selectedWorker.afp || 'integra',
          nombre: (selectedWorker.afp || 'AFP Integra').toUpperCase(),
          aporte: 0.10,
          comision: 0.0155,
          prima: 0.0170,
        }

        const sueldoBase = Number(selectedWorker.sueldoBase) || 0
        const asigFamiliarMonto = selectedWorker.asigFamiliar ? (PARAMETROS_LABORALES?.asigFamiliar || 102.50) : 0
        const remuneracionBruta = sueldoBase + asigFamiliarMonto
        const remuneracionDiaria = remuneracionBruta / 30
        const valorHora = remuneracionBruta / 240
        const essaludMonto = remuneracionBruta * 0.09
        const sctrMonto = remuneracionBruta * 0.015

        const tasaDescuentoAfp = afpObj.id === 'onp' ? 0.13 : (afpObj.aporte + afpObj.comision + afpObj.prima)
        const descuentoPensionEstimado = remuneracionBruta * tasaDescuentoAfp
        const sueldoNetoEstimado = remuneracionBruta - descuentoPensionEstimado

        const tareoDias = Array.isArray(selectedWorker.tareo) ? selectedWorker.tareo : []
        const diasTrabajados = tareoDias.filter((d) => d === 'D' || d === 'N' || d === 'M').length
        const descansosLey = tareoDias.filter((d) => d === 'DL').length
        const vacacionesDias = tareoDias.filter((d) => d === 'V').length
        const faltasDias = tareoDias.filter((d) => d === 'F').length
        const totalRegistrados = tareoDias.length || 30
        const tasaPuntualidad = diasTrabajados > 0 ? Math.round(((diasTrabajados + descansosLey + vacacionesDias) / totalRegistrados) * 100) : 100

        const cuspp = `${selectedWorker.dni}${selectedWorker.nombre.slice(0, 2).toUpperCase()}0`
        const nroCuenta = `193-${selectedWorker.dni}-0-${(selectedWorker.id * 17) % 99}`

        return createPortal(
          <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
              
              {/* Header Bar */}
              <div className="flex items-center justify-between px-6 py-4 bg-slate-50/80 border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      Ficha Integral del Colaborador
                    </h3>
                    <p className="text-xs text-slate-500">
                      Legajo Laboral Oficial · Expediente Digital Centralizado
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer"
                    title="Imprimir o guardar como PDF"
                  >
                    <Printer size={14} className="text-slate-500" />
                    <span>Imprimir</span>
                  </button>
                  <button
                    onClick={() => setSelectedWorker(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 space-y-6 overflow-y-auto">
                
                {/* Hero Profile Card */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-extrabold flex items-center justify-center text-xl shadow-md ring-4 ring-white/10 shrink-0">
                        {selectedWorker.nombre.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-xl font-bold text-white tracking-tight">
                            {selectedWorker.nombre}
                          </h4>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            selectedWorker.estado === 'Activo'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              selectedWorker.estado === 'Activo' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                            }`} />
                            {selectedWorker.estado}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                          <span className="flex items-center gap-1 font-semibold text-blue-200">
                            <Briefcase size={13} className="text-blue-300" />
                            {selectedWorker.cargo}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-[11px] text-slate-200 font-medium">
                            DNI: {selectedWorker.dni}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="flex items-center gap-1 text-slate-300">
                            <MapPin size={13} className="text-slate-400" />
                            {sedeObj.nombre}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(selectedWorker.dni, 'DNI')}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white font-medium flex items-center gap-1.5 transition-colors border border-white/10 cursor-pointer"
                      >
                        {copiedText === 'DNI' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        <span>{copiedText === 'DNI' ? 'DNI Copiado' : 'Copiar DNI'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Metadata Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Mail size={14} className="text-blue-400 shrink-0" />
                      <span className="truncate">{selectedWorker.email || `${selectedWorker.dni}@empresa.com`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone size={14} className="text-emerald-400 shrink-0" />
                      <span>{selectedWorker.telefono || '+51 984 123 456'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar size={14} className="text-purple-400 shrink-0" />
                      <span>Ingreso: {selectedWorker.fechaIngreso || '2022-03-15'} ({getAntiguedad(selectedWorker.fechaIngreso)})</span>
                    </div>
                  </div>
                </div>

                {/* 2-Column Grid: Remuneraciones vs Previsión */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Card 1: Estructura Remunerativa */}
                  <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4.5 space-y-3.5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-blue-600" />
                        <h5 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                          Estructura Salarial y Compensaciones
                        </h5>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                        Régimen {selectedWorker.regimen || 'D.L. 728'}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                        <span className="text-slate-600">Sueldo Básico Mensual</span>
                        <span className="font-bold text-slate-900 font-mono text-sm">
                          S/ {sueldoBase.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                        <span className="text-slate-600 flex items-center gap-1">
                          Asignación Familiar (Ley 25129)
                        </span>
                        <span className={`font-semibold ${selectedWorker.asigFamiliar ? 'text-slate-900 font-mono' : 'text-slate-400'}`}>
                          {selectedWorker.asigFamiliar ? `S/ ${asigFamiliarMonto.toFixed(2)}` : 'No aplica (S/ 0.00)'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 px-2 bg-blue-50/80 rounded-lg border border-blue-100">
                        <span className="font-bold text-blue-900">Total Remuneración Bruta</span>
                        <span className="font-extrabold text-blue-700 font-mono text-sm">
                          S/ {remuneracionBruta.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      {/* Tasas diarias y por hora */}
                      <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                        <div className="p-2 rounded-lg bg-white border border-slate-200/70">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Valor Diario (30d)</span>
                          <span className="font-bold text-slate-800 font-mono">
                            S/ {remuneracionDiaria.toFixed(2)}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-slate-200/70">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Valor Hora (8h)</span>
                          <span className="font-bold text-slate-800 font-mono">
                            S/ {valorHora.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Costos Laborales Empleador */}
                      <div className="pt-2 border-t border-slate-200/60 space-y-1.5 text-[11px]">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Aportes del Empleador (Costo Empresa)
                        </span>
                        <div className="flex justify-between text-slate-600">
                          <span>EsSalud Regular (9.00%)</span>
                          <span className="font-semibold text-slate-800 font-mono">S/ {essaludMonto.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Seguro SCTR Salud/Pensión (1.50%)</span>
                          <span className="font-semibold text-slate-800 font-mono">S/ {sctrMonto.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Régimen Previsional y Descuentos */}
                  <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4.5 space-y-3.5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-indigo-600" />
                        <h5 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                          Sistema Previsional y Descuentos
                        </h5>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                        {afpObj.nombre}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                        <span className="text-slate-600">Entidad Administradora</span>
                        <span className="font-bold text-slate-900">{afpObj.nombre}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                        <span className="text-slate-600">CUSPP Afiliado</span>
                        <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {cuspp}
                        </span>
                      </div>

                      {/* Desglose de Retenciones */}
                      <div className="space-y-1 pt-1 text-[11px]">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Desglose de Retenciones de Ley
                        </span>
                        {afpObj.id === 'onp' ? (
                          <div className="flex justify-between text-slate-600 py-0.5">
                            <span>Aporte Obligatorio ONP (13.00%)</span>
                            <span className="font-mono font-semibold text-slate-800">
                              S/ {(remuneracionBruta * 0.13).toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between text-slate-600 py-0.5">
                              <span>Fondo de Pensiones (10.00%)</span>
                              <span className="font-mono font-semibold text-slate-800">
                                S/ {(remuneracionBruta * 0.10).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-slate-600 py-0.5">
                              <span>Prima de Seguro SIS (1.70%)</span>
                              <span className="font-mono font-semibold text-slate-800">
                                S/ {(remuneracionBruta * 0.017).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-slate-600 py-0.5">
                              <span>Comisión Flujo ({(afpObj.comision * 100).toFixed(2)}%)</span>
                              <span className="font-mono font-semibold text-slate-800">
                                S/ {(remuneracionBruta * afpObj.comision).toFixed(2)}
                              </span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between text-rose-700 font-semibold pt-1 border-t border-slate-200">
                          <span>Total Retención Previsional</span>
                          <span className="font-mono">- S/ {descuentoPensionEstimado.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Sueldo Neto Estimado */}
                      <div className="flex justify-between items-center py-2 px-3 bg-emerald-50 rounded-lg border border-emerald-200 mt-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                            Sueldo Líquido Estimado en Mano
                          </span>
                          <span className="text-[10px] text-emerald-600">A depositar en cuenta de haberes</span>
                        </div>
                        <span className="font-black text-emerald-700 font-mono text-base">
                          S/ {sueldoNetoEstimado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Control Operativo de Asistencia y Matriz de Tareo */}
                <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4.5 space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Activity size={16} className="text-emerald-600" />
                      <h5 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                        Control Operativo de Asistencia y Tareo Mensual
                      </h5>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-500">
                        Cumplimiento: <strong className="text-slate-900">{tasaPuntualidad}%</strong>
                      </span>
                    </div>
                  </div>

                  {/* 4 Mini KPI Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Días Laborados</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-lg font-bold text-emerald-700">{diasTrabajados}</span>
                        <span className="text-[10px] text-slate-500">días (D/N)</span>
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Descansos de Ley</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-lg font-bold text-sky-700">{descansosLey}</span>
                        <span className="text-[10px] text-slate-500">días (DL)</span>
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Vacaciones</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-lg font-bold text-amber-700">{vacacionesDias}</span>
                        <span className="text-[10px] text-slate-500">días (V)</span>
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Inasistencias</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className={`text-lg font-bold ${faltasDias > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                          {faltasDias}
                        </span>
                        <span className="text-[10px] text-slate-500">faltas (F)</span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Strip of Month Days */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Secuencia de Asistencia del Mes (Días 1 al 30)
                    </span>
                    <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-30 gap-1 overflow-x-auto py-1">
                      {Array.from({ length: 30 }, (_, i) => {
                        const code = tareoDias[i] || 'D'
                        const badgeInfo = BADGE_CONFIG[code] || BADGE_CONFIG.D
                        return (
                          <div
                            key={i}
                            className="flex flex-col items-center justify-center p-1 rounded bg-white border border-slate-200 min-w-[24px]"
                            title={`Día ${i + 1}: ${badgeInfo.desc}`}
                          >
                            <span className="text-[8px] text-slate-400 font-mono leading-none">{i + 1}</span>
                            <span className={`text-[10px] font-black mt-0.5 px-1 rounded ${badgeInfo.cls}`}>
                              {code}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* 3-Column Info: Empresa, Contrato y Bancario */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  
                  {/* Empresa y Razón Social */}
                  <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                      <Building2 size={15} className="text-slate-500" />
                      <span>Empresa Empleadora</span>
                    </div>
                    <div className="space-y-1 text-slate-600">
                      <p className="font-semibold text-slate-900 leading-tight">{empresaObj.nombre}</p>
                      <p className="font-mono text-[11px] text-slate-500">RUC: {empresaObj.ruc}</p>
                      <p className="text-[11px] text-slate-500 truncate">{empresaObj.direccion}</p>
                    </div>
                  </div>

                  {/* Sede y Unidad Operativa */}
                  <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                      <MapPin size={15} className="text-slate-500" />
                      <span>Sede y Régimen Horario</span>
                    </div>
                    <div className="space-y-1 text-slate-600">
                      <p className="font-semibold text-slate-900 leading-tight">{sedeObj.nombre}</p>
                      <p className="text-[11px] text-slate-500">Código Sede: {sedeObj.codigo}</p>
                      <p className="text-[11px] text-slate-500">Jornada: 48h / Semanales (6x1)</p>
                    </div>
                  </div>

                  {/* Cuenta de Pago de Haberes */}
                  <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                      <Wallet size={15} className="text-slate-500" />
                      <span>Cuenta de Haberes</span>
                    </div>
                    <div className="space-y-1 text-slate-600">
                      <p className="font-semibold text-slate-900 leading-tight">Banco de Crédito (BCP)</p>
                      <p className="font-mono text-[11px] text-slate-500">N°: {nroCuenta}</p>
                      <p className="text-[11px] text-emerald-700 font-semibold">Pago Mensual en Soles (PEN)</p>
                    </div>
                  </div>

                </div>

              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-200 shrink-0">
                <span className="text-xs text-slate-500 font-mono">
                  ID Sistema: #{selectedWorker.id.toString().padStart(5, '0')} · Estado de Auditoría: Conforme
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Imprimir Legajo
                  </button>
                  <button
                    onClick={() => setSelectedWorker(null)}
                    className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-md shadow-slate-900/10 transition-colors cursor-pointer"
                  >
                    Cerrar Ficha
                  </button>
                </div>
              </div>

            </div>
          </div>,
          document.body
        )
      })()}

    </div>
  )
}
