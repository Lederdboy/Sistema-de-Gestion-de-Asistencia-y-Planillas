import { useState } from 'react'
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
} from 'lucide-react'
import { EMPRESAS, SEDES, AFPS } from '../../data/mockData'

export default function PersonalView({ workers, onAddWorker, showToast }) {
  const [search, setSearch] = useState('')
  const [selectedSede, setSelectedSede] = useState('')
  const [selectedEstado, setSelectedEstado] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState(null)

  // Formulario nuevo colaborador
  const [form, setForm] = useState({
    dni: '',
    nombre: '',
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
    if (!form.dni || !form.nombre || !form.cargo || !form.sueldoBase) {
      showToast('Por favor completa los campos requeridos (DNI, Nombre, Cargo, Sueldo).', 'error')
      return
    }

    const newWorker = {
      id: Date.now(),
      dni: form.dni,
      nombre: form.nombre,
      cargo: form.cargo,
      empresaId: form.empresaId,
      sedeId: form.sedeId,
      sueldoBase: parseFloat(form.sueldoBase) || 1025.00,
      afp: form.afp,
      asigFamiliar: form.asigFamiliar,
      estado: 'Activo',
      fechaIngreso: new Date().toISOString().split('T')[0],
      regimen: form.regimen,
      email: form.email || `${form.nombre.toLowerCase().replace(/\s+/g, '.')}@empresa.com`,
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
      nombre: '',
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
          className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20 cursor-pointer"
        >
          <Plus size={14} />
          <span>Nuevo Colaborador</span>
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar persona por DNI, apellidos, nombres o cargo..."
            className="w-full h-9 pl-9 pr-3 text-xs border border-slate-200 rounded-md bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSede}
            onChange={(e) => setSelectedSede(e.target.value)}
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
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value)}
            className="h-9 px-3 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Todos los Estados</option>
            <option value="Activo">Activo</option>
            <option value="Vacaciones">Vacaciones</option>
            <option value="Licencia">Licencia</option>
          </select>
        </div>
      </div>

      {/* Tabla de Colaboradores */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
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
      {showNewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users size={18} className="text-blue-600" />
                Registrar Nuevo Colaborador
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Apellidos y Nombres *</label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Pedro Castillo, Taylor Swift"
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
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
        </div>
      )}

      {/* Modal Ficha del Colaborador */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Ficha Laboral del Colaborador</h3>
              <button
                onClick={() => setSelectedWorker(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                {selectedWorker.nombre.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{selectedWorker.nombre}</h4>
                <p className="text-xs text-slate-500 font-mono">DNI: {selectedWorker.dni}</p>
                <p className="text-xs text-blue-700 font-semibold">{selectedWorker.cargo}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Sueldo Básico</span>
                <span className="font-bold text-slate-800 text-sm">S/ {selectedWorker.sueldoBase.toFixed(2)}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Pensión</span>
                <span className="font-bold text-slate-800 uppercase">{selectedWorker.afp}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Asignación Familiar</span>
                <span className="font-bold text-slate-800">{selectedWorker.asigFamiliar ? 'S/ 102.50 (Sí)' : 'No'}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Fecha Ingreso</span>
                <span className="font-bold text-slate-800">{selectedWorker.fechaIngreso || '01/01/2023'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedWorker(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
