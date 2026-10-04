import { useState, useEffect } from 'react'
import { UserCog, Plus, X, Search, Shield, MapPin, Mail, ToggleLeft, ToggleRight, Eye, EyeOff, Pencil, Trash2, KeyRound, Lock } from 'lucide-react'
import { supabase } from '../../services/supabase'

// Gestión de Usuarios solo crea encargados — los trabajadores se crean desde Personal
const ROLES_POR_ROL = {
  GERENTE_GENERAL: ['GERENTE_SEDE', 'CONTADOR', 'SUPERVISOR_RRHH'],
  GERENTE_SEDE: ['CONTADOR', 'SUPERVISOR_RRHH'],
}

const CATEGORIA_ROL = {
  GERENTE_SEDE:    { label: 'Gerencia de Sede',    color: 'bg-blue-100 text-blue-700',    desc: 'Gestión operativa de una sede' },
  CONTADOR:        { label: 'Contabilidad',         color: 'bg-emerald-100 text-emerald-700', desc: 'Planillas, reportes y SUNAT' },
  SUPERVISOR_RRHH: { label: 'Recursos Humanos',     color: 'bg-amber-100 text-amber-700',  desc: 'Personal, vacaciones y contratos' },
}

const ROL_LABEL = {
  GERENTE_GENERAL: 'Gerente General',
  GERENTE_SEDE: 'Gerente de Sede',
  CONTADOR: 'Contador',
  SUPERVISOR_RRHH: 'Supervisor RRHH',
  TRABAJADOR: 'Trabajador',
}

const ROL_COLOR = {
  GERENTE_GENERAL: 'bg-violet-100 text-violet-700',
  GERENTE_SEDE: 'bg-blue-100 text-blue-700',
  CONTADOR: 'bg-emerald-100 text-emerald-700',
  SUPERVISOR_RRHH: 'bg-amber-100 text-amber-700',
  TRABAJADOR: 'bg-slate-100 text-slate-700',
}

const FORM_VACIO = { nombre: '', email: '', password: '', rol: '', sede_id: '', cargo: '' }

export default function GestionUsuariosView({ user, showToast }) {
  const [usuarios, setUsuarios] = useState([])
  const [sedes, setSedes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Modales
  const [modalCrear, setModalCrear] = useState(false)
  const [modalEditar, setModalEditar] = useState(null)   // usuario a editar
  const [modalEliminar, setModalEliminar] = useState(null) // usuario a eliminar

  const [form, setForm] = useState({ ...FORM_VACIO, rol: ROLES_POR_ROL[user?.rol]?.[0] || 'TRABAJADOR' })
  const [editForm, setEditForm] = useState({ nombre: '', rol: '', sede_id: '', cargo: '', nuevaPassword: '' })
  const [showEditPassword, setShowEditPassword] = useState(false)

  const rolesDisponibles = ROLES_POR_ROL[user?.rol] || []
  const sedeDelGerente = user?.rol === 'GERENTE_SEDE' ? user.sedeId : null

  useEffect(() => { cargarDatos() }, [])

  async function cargarDatos() {
    setLoading(true)
    try {
      const { data: sedesData } = await supabase
        .from('sedes')
        .select('id, nombre')
        .eq('activo', true)
        .order('nombre')
      setSedes(sedesData || [])

      let query = supabase
        .from('usuarios_perfil')
        .select('id, nombre, email, rol, sede_id, cargo, activo, created_at, sedes(nombre)')
        .order('created_at', { ascending: false })

      if (user?.rol === 'GERENTE_SEDE' && user?.sedeId) {
        query = query.eq('sede_id', user.sedeId)
      }

      const { data, error } = await query
      if (error) throw error
      setUsuarios(data || [])
    } catch {
      showToast('Error al cargar usuarios.', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleCrear(e) {
    e.preventDefault()
    if (form.password.length < 8) { showToast('La contraseña debe tener al menos 8 caracteres.', 'error'); return }
    if (['GERENTE_SEDE', 'CONTADOR', 'SUPERVISOR_RRHH', 'TRABAJADOR'].includes(form.rol) && !form.sede_id && !sedeDelGerente) {
      showToast('Selecciona una sede para este usuario.', 'error'); return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/v1/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
        body: JSON.stringify({
          nombre: form.nombre,
          email: form.email,
          password: form.password,
          rol: form.rol,
          sede_id: sedeDelGerente ? sedeDelGerente : (form.sede_id ? parseInt(form.sede_id) : null),
          empresa_id: user?.empresaId || 1,
          cargo: form.cargo || null,
          creado_por: user?.uuid,
        }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.mensaje || 'Error al crear usuario') }
      showToast(`Usuario ${form.nombre} creado exitosamente.`, 'success')
      setModalCrear(false)
      setForm({ ...FORM_VACIO, rol: rolesDisponibles[0] || 'TRABAJADOR' })
      await cargarDatos()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleEditar(e) {
    e.preventDefault()
    if (editForm.nuevaPassword && editForm.nuevaPassword.length < 8) {
      showToast('La contraseña debe tener al menos 8 caracteres.', 'error'); return
    }
    setSaving(true)
    try {
      const { error } = await supabase
        .from('usuarios_perfil')
        .update({
          nombre: editForm.nombre,
          rol: editForm.rol,
          sede_id: editForm.sede_id ? parseInt(editForm.sede_id) : null,
          cargo: editForm.cargo || null,
        })
        .eq('id', modalEditar.id)
      if (error) throw error

      // Cambiar contraseña si se ingresó una nueva
      if (editForm.nuevaPassword) {
        const res = await fetch(`/api/v1/usuarios/${modalEditar.id}/reset-password`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
          body: JSON.stringify({ password: editForm.nuevaPassword }),
        })
        if (!res.ok) throw new Error('Error al cambiar contraseña')
      }

      showToast('Usuario actualizado correctamente.', 'success')
      setModalEditar(null)
      setShowEditPassword(false)
      await cargarDatos()
    } catch (err) {
      showToast(err.message || 'Error al actualizar usuario.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleEliminar() {
    setSaving(true)
    try {
      const res = await fetch(`/api/v1/usuarios/${modalEliminar.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` },
      })
      if (!res.ok) throw new Error('Error al eliminar')
      showToast(`Usuario ${modalEliminar.nombre} eliminado.`, 'success')
      setModalEliminar(null)
      await cargarDatos()
    } catch {
      showToast('Error al eliminar usuario.', 'error')
    } finally {
      setSaving(false)
    }
  }

  function abrirEditarConPassword(u) {
    setEditForm({ nombre: u.nombre, rol: u.rol, sede_id: u.sede_id ? String(u.sede_id) : '', cargo: u.cargo || '', nuevaPassword: '' })
    setShowEditPassword(true)  // abre directo en sección contraseña
    setModalEditar(u)
  }

  async function handleToggleActivo(usuario) {
    try {
      const { error } = await supabase
        .from('usuarios_perfil')
        .update({ activo: !usuario.activo })
        .eq('id', usuario.id)
      if (error) throw error
      setUsuarios((prev) => prev.map((u) => u.id === usuario.id ? { ...u, activo: !u.activo } : u))
      showToast(`Usuario ${usuario.activo ? 'desactivado' : 'activado'}.`, 'success')
    } catch {
      showToast('Error al cambiar estado.', 'error')
    }
  }

  function abrirEditar(u) {
    setEditForm({ nombre: u.nombre, rol: u.rol, sede_id: u.sede_id ? String(u.sede_id) : '', cargo: u.cargo || '', nuevaPassword: '' })
    setShowEditPassword(false)
    setModalEditar(u)
  }

  const filtered = usuarios.filter((u) => {
    if (u.rol === 'TRABAJADOR') return false // Los trabajadores no se gestionan aquí
    return !search ||
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.rol.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UserCog size={16} className="text-blue-600" />
            Gestión de Usuarios del Sistema
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {user?.rol === 'GERENTE_GENERAL' ? `${usuarios.length} encargados registrados` : `${usuarios.length} encargados en tu sede`}
            <span className="ml-2 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-semibold">
              Los trabajadores se crean desde Directorio de Personal
            </span>
          </p>
        </div>
        <button
          onClick={() => setModalCrear(true)}
          className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
        >
          <Plus size={14} /> Nuevo Encargado
        </button>
      </div>

      {/* Tarjetas de categoría */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Object.entries(CATEGORIA_ROL).map(([rol, info]) => {
          const count = usuarios.filter(u => u.rol === rol).length
          return (
            <div key={rol} className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${info.color}`}>
                <Shield size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900">{info.label}</p>
                <p className="text-[11px] text-slate-400 truncate">{info.desc}</p>
              </div>
              <span className="text-lg font-black text-slate-800">{count}</span>
            </div>
          )
        })}
      </div>

      {/* Buscador */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o rol..."
            className="w-full h-9 pl-9 pr-3 text-xs border border-slate-200 rounded-md bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Cargando usuarios...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No hay usuarios registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-3 py-3">Rol</th>
                  <th className="px-3 py-3">Sede</th>
                  <th className="px-3 py-3">Cargo</th>
                  <th className="px-3 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                          {u.nombre.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{u.nombre}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Mail size={10} /> {u.email || u.id.slice(0, 8) + '...'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${ROL_COLOR[u.rol] || 'bg-slate-100 text-slate-700'}`}>
                        {ROL_LABEL[u.rol] || u.rol}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin size={11} className="text-slate-400" />
                        {u.sedes?.nombre || (u.sede_id ? `Sede ${u.sede_id}` : 'Todas las sedes')}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{u.cargo || '—'}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        u.activo ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.activo ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => abrirEditar(u)} title="Editar usuario"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => abrirEditarConPassword(u)} title="Cambiar contraseña"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer">
                          <KeyRound size={14} />
                        </button>
                        <button onClick={() => handleToggleActivo(u)} title={u.activo ? 'Desactivar' : 'Activar'}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${u.activo ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'}`}>
                          {u.activo ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                        <button onClick={() => setModalEliminar(u)} title="Eliminar"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer Crear Usuario */}
      {modalCrear && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-xs" onClick={() => setModalCrear(false)} />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Shield size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Nuevo Usuario</h3>
                  <p className="text-[11px] text-blue-100">Completa los datos para crear acceso</p>
                </div>
              </div>
              <button onClick={() => setModalCrear(false)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <form onSubmit={handleCrear} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">

                {/* Preview del usuario */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-lg flex items-center justify-center flex-shrink-0 shadow">
                    {form.nombre
                      ? form.nombre.trim().split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
                      : <UserCog size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{form.nombre || 'Nombre del usuario'}</p>
                    <p className="text-xs text-slate-400 truncate">{form.email || 'correo@empresa.com'}</p>
                    {form.rol && (
                      <span className={`mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-bold ${ROL_COLOR[form.rol] || 'bg-slate-100 text-slate-600'}`}>
                        {ROL_LABEL[form.rol] || form.rol}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sección: Datos de acceso */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Datos de Acceso</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre completo *</label>
                      <input type="text" required value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        placeholder="Ej: María García López"
                        className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Correo electrónico *</label>
                      <input type="email" required value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="usuario@empresa.com"
                        className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Contraseña temporal *</label>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} required value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          placeholder="Mínimo 8 caracteres"
                          className="w-full h-9 px-3 pr-9 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      {form.password && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex gap-1 flex-1">
                            {[1,2,3,4].map((i) => (
                              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                                form.password.length >= i * 3
                                  ? form.password.length >= 12 ? 'bg-emerald-500'
                                  : form.password.length >= 8 ? 'bg-amber-400' : 'bg-rose-400'
                                  : 'bg-slate-200'
                              }`} />
                            ))}
                          </div>
                          <span className={`text-[10px] font-semibold ${
                            form.password.length >= 12 ? 'text-emerald-600'
                            : form.password.length >= 8 ? 'text-amber-600' : 'text-rose-500'
                          }`}>
                            {form.password.length >= 12 ? 'Fuerte' : form.password.length >= 8 ? 'Aceptable' : 'Débil'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sección: Permisos y ubicación */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Permisos y Ubicación</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Rol *</label>
                      <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}
                        className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white">
                        {rolesDisponibles.map((r) => <option key={r} value={r}>{ROL_LABEL[r]}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Sede *</label>
                      {sedeDelGerente ? (
                        <div className="h-9 px-3 flex items-center text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-500">
                          <MapPin size={12} className="mr-1.5 text-slate-400" />
                          {sedes.find((s) => s.id === sedeDelGerente)?.nombre || 'Tu sede'}
                        </div>
                      ) : (
                        <select value={form.sede_id} onChange={(e) => setForm({ ...form, sede_id: e.target.value })}
                          className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white">
                          <option value="">— Seleccionar sede —</option>
                          {sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                        </select>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Cargo <span className="text-slate-400 font-normal">(opcional)</span></label>
                      <input type="text" value={form.cargo}
                        onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                        placeholder="Ej: Jefe de Operaciones"
                        className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white" />
                    </div>
                  </div>
                </div>

              </div>
            </form>

            {/* Footer fijo */}
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
              <p className="text-[11px] text-slate-400">Los campos con * son obligatorios</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setModalCrear(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" form="form-crear-usuario" onClick={handleCrear} disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-xs font-semibold shadow-sm shadow-blue-500/20 cursor-pointer flex items-center gap-1.5">
                  <Shield size={13} /> {saving ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {modalEditar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Pencil size={15} className="text-blue-600" /> Editar Usuario
              </h3>
              <button onClick={() => { setModalEditar(null); setShowEditPassword(false) }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditar} className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
              {/* Info del usuario */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {modalEditar.nombre.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{modalEditar.nombre}</p>
                  <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                    <Mail size={10} /> {modalEditar.email}
                  </p>
                </div>
              </div>

              {/* Datos generales */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Datos del usuario</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre completo *</label>
                    <input type="text" required value={editForm.nombre}
                      onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                      className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Rol *</label>
                      <select value={editForm.rol} onChange={(e) => setEditForm({ ...editForm, rol: e.target.value })}
                        className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white">
                        {rolesDisponibles.map((r) => <option key={r} value={r}>{ROL_LABEL[r]}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Sede</label>
                      {sedeDelGerente ? (
                        <div className="h-9 px-3 flex items-center text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-500">
                          {sedes.find((s) => s.id === sedeDelGerente)?.nombre || 'Tu sede'}
                        </div>
                      ) : (
                        <select value={editForm.sede_id} onChange={(e) => setEditForm({ ...editForm, sede_id: e.target.value })}
                          className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white">
                          <option value="">— Sin sede —</option>
                          {sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                        </select>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Cargo</label>
                    <input type="text" value={editForm.cargo}
                      onChange={(e) => setEditForm({ ...editForm, cargo: e.target.value })}
                      placeholder="Ej: Jefe de Operaciones"
                      className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white" />
                  </div>
                </div>
              </div>

              {/* Cambio de contraseña */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <button type="button"
                  onClick={() => { setShowEditPassword(!showEditPassword); setEditForm(f => ({ ...f, nuevaPassword: '' })) }}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                  <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <Lock size={13} className="text-amber-600" />
                    Cambiar contraseña
                  </span>
                  <span className="text-[10px] text-slate-400">{showEditPassword ? 'Cancelar' : 'Opcional'}</span>
                </button>

                {showEditPassword && (
                  <div className="px-4 pb-4 pt-3 space-y-2 border-t border-slate-200 bg-amber-50/30">
                    <label className="block text-xs font-semibold text-slate-700">Nueva contraseña</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={editForm.nuevaPassword}
                        onChange={(e) => setEditForm({ ...editForm, nuevaPassword: e.target.value })}
                        placeholder="Mínimo 8 caracteres"
                        className="w-full h-9 px-3 pr-9 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-400 focus:outline-none bg-white" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {editForm.nuevaPassword && (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1 flex-1">
                          {[1,2,3,4].map((i) => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                              editForm.nuevaPassword.length >= i * 3
                                ? editForm.nuevaPassword.length >= 12 ? 'bg-emerald-500'
                                : editForm.nuevaPassword.length >= 8 ? 'bg-amber-400' : 'bg-rose-400'
                                : 'bg-slate-200'
                            }`} />
                          ))}
                        </div>
                        <span className={`text-[10px] font-semibold ${
                          editForm.nuevaPassword.length >= 12 ? 'text-emerald-600'
                          : editForm.nuevaPassword.length >= 8 ? 'text-amber-600' : 'text-rose-500'
                        }`}>
                          {editForm.nuevaPassword.length >= 12 ? 'Fuerte' : editForm.nuevaPassword.length >= 8 ? 'Aceptable' : 'Débil'}
                        </span>
                      </div>
                    )}
                    <p className="text-[11px] text-slate-400">Deja vacío para no cambiar la contraseña actual.</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                <button type="button" onClick={() => { setModalEditar(null); setShowEditPassword(false) }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5">
                  <Pencil size={12} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminar */}
      {modalEliminar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 border border-slate-200">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                <Trash2 size={22} className="text-rose-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Eliminar usuario</h3>
              <p className="text-xs text-slate-500">
                ¿Estás seguro de eliminar a <span className="font-semibold text-slate-800">{modalEliminar.nombre}</span>?
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setModalEliminar(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer">
                Cancelar
              </button>
              <button onClick={handleEliminar} disabled={saving}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white rounded-lg text-xs font-semibold cursor-pointer">
                {saving ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
