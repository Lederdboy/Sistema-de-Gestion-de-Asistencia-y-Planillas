import { useState, useRef, useEffect } from 'react'
import { Users, Search, Plus, MapPin, Mail, X, Camera, Upload } from 'lucide-react'
import { EMPRESAS, SEDES, AFPS } from '../../data/mockData'
import { crearTrabajador, actualizarTrabajador } from '../../services/api'
import { supabase } from '../../services/supabase'

export default function PersonalView({ workers, onAddWorker, onUpdateWorker, showToast }) {
  const [search, setSearch] = useState('')
  const [selectedSede, setSelectedSede] = useState('')
  const [selectedEstado, setSelectedEstado] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [isEditingWorker, setIsEditingWorker] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [newFotoUrl, setNewFotoUrl] = useState(null)
  const [newFotoFile, setNewFotoFile] = useState(null)
  const [editFotoUrl, setEditFotoUrl] = useState(null)
  const [editFotoFile, setEditFotoFile] = useState(null)
  const newFotoRef = useRef(null)
  const editFotoRef = useRef(null)

  const [dominioEmail, setDominioEmail] = useState('empresa.com')
  const [darAcceso, setDarAcceso] = useState(false)

  useEffect(() => {
    supabase.from('empresas').select('dominio_email').eq('id', 1).single()
      .then(({ data }) => { if (data?.dominio_email) setDominioEmail(data.dominio_email) })
  }, [])

  function generarEmail(nombre) {
    const partes = nombre.trim().toLowerCase().split(' ').filter(Boolean)
    if (partes.length < 2) return `${partes[0] || 'usuario'}@${dominioEmail}`
    return `${partes[0][0]}.${partes[1]}@${dominioEmail}`
  }

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

  const handleFotoUpload = (file, setUrl, setFile) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { showToast('Selecciona una imagen válida.', 'error'); return }
    if (file.size > 2 * 1024 * 1024) { showToast('La imagen no debe exceder 2MB.', 'error'); return }
    setFile(file)
    setUrl(URL.createObjectURL(file))
  }

  const handleCreateWorker = async (e) => {
    e.preventDefault()
    if (!form.dni || !form.nombre || !form.cargo || !form.sueldoBase) {
      showToast('Por favor completa los campos requeridos (DNI, Nombre, Cargo, Sueldo).', 'error')
      return
    }

    const partes = form.nombre.trim().split(' ')
    const apellidoPaterno = partes[0] || ''
    const apellidoMaterno = partes[1] || ''
    const nombres = partes.slice(2).join(' ') || apellidoPaterno

    const sueldoBasico = parseFloat(form.sueldoBase) || 1025.00

    try {
      const created = await crearTrabajador({
        empresaId: parseInt(form.empresaId),
        sedeId: parseInt(form.sedeId),
        tipoDocumento: 'DNI',
        numeroDocumento: form.dni,
        nombres,
        apellidoPaterno,
        apellidoMaterno,
        cargo: form.cargo,
        fechaIngreso: new Date().toISOString().split('T')[0],
        sueldoBasico,
        sueldoDiario: parseFloat((sueldoBasico / 30).toFixed(2)),
      }, newFotoFile)

      const newWorker = {
        id: created.id,
        dni: form.dni,
        nombre: form.nombre,
        cargo: form.cargo,
        empresaId: form.empresaId,
        sedeId: form.sedeId,
        sueldoBase: sueldoBasico,
        afp: form.afp,
        asigFamiliar: form.asigFamiliar,
        estado: 'Activo',
        fechaIngreso: new Date().toISOString().split('T')[0],
        regimen: form.regimen,
        email: form.email || `${form.nombre.toLowerCase().replace(/\s+/g, '.')}@empresa.com`,
        telefono: form.telefono || '999 000 000',
        fotoUrl: newFotoUrl || null,
        tareo: Array.from({ length: 31 }, (_, i) => {
          const dayOfWeek = (i + 1) % 7
          return (dayOfWeek === 0 || dayOfWeek === 6) ? 'DL' : 'D'
        }),
      }

      onAddWorker(newWorker)
      showToast(`Colaborador ${newWorker.nombre} registrado exitosamente.`, 'success')

      // Crear acceso al sistema si se marcó el checkbox
      if (darAcceso) {
        try {
          const emailGenerado = generarEmail(form.nombre)
          const token = (await supabase.auth.getSession()).data.session?.access_token
          const res = await fetch('/api/v1/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              nombre: form.nombre,
              email: emailGenerado,
              password: form.dni,
              rol: 'TRABAJADOR',
              sede_id: parseInt(form.sedeId) || null,
              empresa_id: parseInt(form.empresaId) || 1,
              cargo: form.cargo || null,
              creado_por: null,
            }),
          })
          if (res.ok) {
            showToast(`Acceso creado: ${emailGenerado} / contraseña: DNI`, 'success')
          }
        } catch {
          showToast('Trabajador creado pero no se pudo crear el acceso al sistema.', 'error')
        }
      }
    } catch (err) {
      showToast('Error al registrar colaborador en la base de datos.', 'error')
    }

    setShowNewModal(false)
    setNewFotoUrl(null)
    setNewFotoFile(null)
    setDarAcceso(false)
    setForm({ dni: '', nombre: '', cargo: '', empresaId: '1', sedeId: '1', sueldoBase: '1500', afp: 'integra', asigFamiliar: true, email: '', telefono: '', regimen: 'D.L. 728' })
  }

  const handleOpenEdit = (worker) => {
    setEditForm({
      cargo: worker.cargo,
      sueldoBase: String(worker.sueldoBase),
      sedeId: worker.sedeId,
      afp: worker.afp,
      asigFamiliar: worker.asigFamiliar,
      estado: worker.estado,
    })
    setEditFotoUrl(worker.fotoUrl || null)
    setEditFotoFile(null)
    setIsEditingWorker(true)
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    try {
      const sueldoBasico = parseFloat(editForm.sueldoBase)
      const partes = selectedWorker.nombre.trim().split(' ')
      const apellidoPaterno = partes[0] || ''
      const apellidoMaterno = partes[1] || ''
      const nombres = partes.slice(2).join(' ') || apellidoPaterno

      await actualizarTrabajador(selectedWorker.id, {
        sedeId: parseInt(editForm.sedeId),
        tipoDocumento: 'DNI',
        numeroDocumento: selectedWorker.dni,
        nombres,
        apellidoPaterno,
        apellidoMaterno,
        cargo: editForm.cargo,
        fechaIngreso: selectedWorker.fechaIngreso,
        sueldoBasico,
        sueldoDiario: parseFloat((sueldoBasico / 30).toFixed(2)),
        activo: editForm.estado === 'Activo',
      }, editFotoFile)
      onUpdateWorker({
        ...selectedWorker,
        cargo: editForm.cargo,
        sueldoBase: sueldoBasico,
        sedeId: editForm.sedeId,
        afp: editForm.afp,
        asigFamiliar: editForm.asigFamiliar,
        estado: editForm.estado,
        fotoUrl: editFotoUrl || null,
      })
      setIsEditingWorker(false)
      setSelectedWorker(null)
      showToast('Colaborador actualizado correctamente.', 'success')
    } catch (err) {
      showToast('Error al actualizar colaborador.', 'error')
    }
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
                        {w.fotoUrl
                          ? <img src={w.fotoUrl} alt={w.nombre} className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                          : <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">{w.nombre.slice(0, 2).toUpperCase()}</div>
                        }
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
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedWorker(w)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded border border-blue-200 transition-colors cursor-pointer"
                        >
                          Ver Ficha
                        </button>
                        <button
                          onClick={() => { setSelectedWorker(w); handleOpenEdit(w) }}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded border border-slate-200 transition-colors cursor-pointer"
                        >
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer Nuevo Colaborador */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="flex-1 bg-black/40 backdrop-blur-xs" onClick={() => setShowNewModal(false)} />
          {/* Panel lateral */}
          <div className="w-full max-w-xl bg-white shadow-2xl flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Users size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Nuevo Colaborador</h3>
                  <p className="text-[11px] text-blue-100">Completa los datos para registrar</p>
                </div>
              </div>
              <button onClick={() => setShowNewModal(false)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <form onSubmit={handleCreateWorker} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-5">

                {/* Avatar preview + foto */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="relative flex-shrink-0">
                    {newFotoUrl
                      ? <img src={newFotoUrl} alt="foto" className="w-16 h-16 rounded-full object-cover border-2 border-blue-200 shadow" />
                      : <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow">
                          {form.nombre ? form.nombre.trim().split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase() : <Camera size={20} />}
                        </div>
                    }
                    <button type="button" onClick={() => newFotoRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow cursor-pointer">
                      <Upload size={11} />
                    </button>
                    <input ref={newFotoRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => handleFotoUpload(e.target.files[0], setNewFotoUrl, setNewFotoFile)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{form.nombre || 'Nombre del colaborador'}</p>
                    <p className="text-xs text-slate-400 truncate">{form.cargo || 'Cargo'}</p>
                    {newFotoUrl && (
                      <button type="button" onClick={() => { setNewFotoUrl(null); setNewFotoFile(null) }}
                        className="mt-1 text-[11px] text-rose-500 hover:text-rose-700 cursor-pointer">Quitar foto</button>
                    )}
                  </div>
                </div>

                {/* Sección 1: Identidad */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Identidad</p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">DNI *</label>
                        <input type="text" maxLength={8} required value={form.dni}
                          onChange={(e) => setForm({ ...form, dni: e.target.value.replace(/\D/g,'') })}
                          placeholder="12345678"
                          className="w-full h-9 px-3 text-xs font-mono border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha de ingreso</label>
                        <input type="date" value={form.fechaIngreso || new Date().toISOString().split('T')[0]}
                          onChange={(e) => setForm({ ...form, fechaIngreso: e.target.value })}
                          className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Apellidos y Nombres *</label>
                      <input type="text" required value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        placeholder="Ej: García López Juan Carlos"
                        className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white" />
                    </div>
                  </div>
                </div>

                {/* Sección 2: Datos laborales */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Datos Laborales</p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Cargo *</label>
                        <input type="text" required value={form.cargo}
                          onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                          placeholder="Ej: Operario de Planta"
                          className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Sueldo Básico (S/) *</label>
                        <input type="number" step="0.01" required value={form.sueldoBase}
                          onChange={(e) => setForm({ ...form, sueldoBase: e.target.value })}
                          placeholder="1500.00"
                          className="w-full h-9 px-3 text-xs font-mono border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Sede de Trabajo</label>
                        <select value={form.sedeId} onChange={(e) => setForm({ ...form, sedeId: e.target.value })}
                          className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white">
                          {SEDES.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Sistema de Pensión</label>
                        <select value={form.afp} onChange={(e) => setForm({ ...form, afp: e.target.value })}
                          className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white">
                          {AFPS.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                        </select>
                      </div>
                    </div>
                    <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                      <input type="checkbox" checked={form.asigFamiliar}
                        onChange={(e) => setForm({ ...form, asigFamiliar: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Asignación Familiar</p>
                        <p className="text-[11px] text-slate-400">Hijos menores de edad o en estudios superiores</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Sección 3: Acceso al sistema */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Acceso al Sistema</p>
                  <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    darAcceso ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <input type="checkbox" checked={darAcceso} onChange={(e) => setDarAcceso(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800">Crear cuenta de acceso</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">El trabajador podrá ver sus boletas, vacaciones y perfil</p>
                      {darAcceso && (
                        <div className="mt-2.5 space-y-1.5">
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-blue-200">
                            <span className="text-[10px] font-bold text-slate-400 w-16 flex-shrink-0">EMAIL</span>
                            <span className="text-[11px] font-mono text-blue-700 font-semibold truncate">
                              {form.nombre ? generarEmail(form.nombre) : `usuario@${dominioEmail}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-blue-200">
                            <span className="text-[10px] font-bold text-slate-400 w-16 flex-shrink-0">CLAVE</span>
                            <span className="text-[11px] font-mono text-blue-700 font-semibold">
                              {form.dni || '(ingresa el DNI)'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>

              </div>
            </form>

            {/* Footer fijo */}
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
              <p className="text-[11px] text-slate-400">Los campos con * son obligatorios</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" form="form-nuevo-colaborador" onClick={handleCreateWorker}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm shadow-blue-500/20 cursor-pointer flex items-center gap-1.5">
                  <Users size={13} /> Registrar Colaborador
                </button>
              </div>
            </div>
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
              {selectedWorker.fotoUrl
                ? <img src={selectedWorker.fotoUrl} alt={selectedWorker.nombre} className="w-12 h-12 rounded-full object-cover border-2 border-blue-200" />
                : <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">{selectedWorker.nombre.slice(0, 2).toUpperCase()}</div>
              }
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

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { setSelectedWorker(null); setIsEditingWorker(false) }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cerrar Ficha
              </button>
              <button
                onClick={() => handleOpenEdit(selectedWorker)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Colaborador */}
      {isEditingWorker && selectedWorker && editForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Editar Colaborador — {selectedWorker.nombre}</h3>
              <button onClick={() => setIsEditingWorker(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cargo *</label>
                <input
                  type="text"
                  required
                  value={editForm.cargo}
                  onChange={(e) => setEditForm({ ...editForm, cargo: e.target.value })}
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sueldo Básico (S/) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editForm.sueldoBase}
                    onChange={(e) => setEditForm({ ...editForm, sueldoBase: e.target.value })}
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sede</label>
                  <select
                    value={editForm.sedeId}
                    onChange={(e) => setEditForm({ ...editForm, sedeId: e.target.value })}
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    {SEDES.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sistema de Pensión</label>
                  <select
                    value={editForm.afp}
                    onChange={(e) => setEditForm({ ...editForm, afp: e.target.value })}
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    {AFPS.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estado</label>
                  <select
                    value={editForm.estado}
                    onChange={(e) => setEditForm({ ...editForm, estado: e.target.value })}
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Vacaciones">Vacaciones</option>
                    <option value="Licencia">Licencia</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input type="checkbox" checked={editForm.asigFamiliar}
                    onChange={(e) => setEditForm({ ...editForm, asigFamiliar: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                  <span>Tiene derecho a Asignación Familiar</span>
                </label>
              </div>

              {/* Foto */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Foto del Colaborador</label>
                <input ref={editFotoRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => handleFotoUpload(e.target.files[0], setEditFotoUrl, setEditFotoFile)} />
                <div className="flex items-center gap-3">
                  {editFotoUrl
                    ? <img src={editFotoUrl} alt="foto" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                    : <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><Camera size={18} /></div>
                  }
                  <button type="button" onClick={() => editFotoRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer">
                    <Upload size={12} /> {editFotoUrl ? 'Cambiar foto' : 'Subir foto'}
                  </button>
                  {editFotoUrl && <button type="button" onClick={() => { setEditFotoUrl(null); setEditFotoFile(null) }}
                    className="text-xs text-rose-500 hover:text-rose-700 cursor-pointer">Quitar</button>}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditingWorker(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
