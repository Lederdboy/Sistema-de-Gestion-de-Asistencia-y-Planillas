import { useState, useEffect } from 'react'
import { UserCog, Plus, X, Search, Shield, MapPin, Mail, ToggleLeft, ToggleRight, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../services/supabase'

const ROLES_POR_ROL = {
  GERENTE_GENERAL: ['GERENTE_SEDE', 'CONTADOR', 'SUPERVISOR_RRHH', 'TRABAJADOR'],
  GERENTE_SEDE: ['CONTADOR', 'SUPERVISOR_RRHH', 'TRABAJADOR'],
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

export default function GestionUsuariosView({ user, showToast }) {
  const [usuarios, setUsuarios] = useState([])
  const [sedes, setSedes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: ROLES_POR_ROL[user?.rol]?.[0] || 'TRABAJADOR',
    sede_id: '',
    cargo: '',
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setLoading(true)
    try {
      // Cargar sedes
      const { data: sedesData } = await supabase
        .from('sedes')
        .select('id, nombre_sede, ciudad')
        .eq('activo', true)
        .order('nombre_sede')

      setSedes(sedesData || [])

      // Cargar usuarios según rol
      let query = supabase
        .from('usuarios_perfil')
        .select('id, nombre, rol, sede_id, cargo, activo, created_at, sedes(nombre_sede)')
        .order('created_at', { ascending: false })

      // GERENTE_SEDE solo ve usuarios de su sede
      if (user?.rol === 'GERENTE_SEDE' && user?.sedeId) {
        query = query.eq('sede_id', user.sedeId)
      }

      const { data, error } = await query
      if (error) throw error
      setUsuarios(data || [])
    } catch (err) {
      showToast('Error al cargar usuarios.', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleCrearUsuario(e) {
    e.preventDefault()
    if (!form.nombre || !form.email || !form.password || !form.rol) {
      showToast('Completa todos los campos requeridos.', 'error')
      return
    }
    if (form.password.length < 8) {
      showToast('La contraseña debe tener al menos 8 caracteres.', 'error')
      return
    }
    // Roles que requieren sede
    if (['GERENTE_SEDE', 'CONTADOR', 'SUPERVISOR_RRHH', 'TRABAJADOR'].includes(form.rol) && !form.sede_id) {
      showToast('Selecciona una sede para este usuario.', 'error')
      return
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
          sede_id: form.sede_id ? parseInt(form.sede_id) : null,
          empresa_id: user?.empresaId || 1,
          cargo: form.cargo || null,
          creado_por: user?.uuid,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.mensaje || 'Error al crear usuario')
      }

      showToast(`Usuario ${form.nombre} creado exitosamente.`, 'success')
      setShowModal(false)
      setForm({ nombre: '', email: '', password: '', rol: ROLES_POR_ROL[user?.rol]?.[0] || 'TRABAJADOR', sede_id: '', cargo: '' })
      await cargarDatos()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActivo(usuario) {
    try {
      const { error } = await supabase
        .from('usuarios_perfil')
        .update({ activo: !usuario.activo })
        .eq('id', usuario.id)

      if (error) throw error
      setUsuarios((prev) => prev.map((u) => u.id === usuario.id ? { ...u, activo: !u.activo } : u))
      showToast(`Usuario ${usuario.activo ? 'desactivado' : 'activado'} correctamente.`, 'success')
    } catch {
      showToast('Error al cambiar estado del usuario.', 'error')
    }
  }

  const filtered = usuarios.filter((u) =>
    !search ||
    u.nombre.toLowerCase().includes(search.toLowerCase()) ||
    u.rol.toLowerCase().includes(search.toLowerCase())
  )

  const rolesDisponibles = ROLES_POR_ROL[user?.rol] || []
  const sedeDelGerente = user?.rol === 'GERENTE_SEDE' ? user.sedeId : null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UserCog size={16} className="text-blue-600" />
            Gestión de Usuarios
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {user?.rol === 'GERENTE_GENERAL'
              ? `${usuarios.length} usuarios en el sistema`
              : `${usuarios.length} usuarios en tu sede`}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20 cursor-pointer"
        >
          <Plus size={14} />
          Nuevo Usuario
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
                            <Mail size={10} />
                            {u.id.slice(0, 8)}...
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
                        {u.sedes?.nombre_sede || (u.sede_id ? `Sede ${u.sede_id}` : 'Todas las sedes')}
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
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleActivo(u)}
                        title={u.activo ? 'Desactivar usuario' : 'Activar usuario'}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          u.activo
                            ? 'text-rose-500 hover:bg-rose-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {u.activo ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Nuevo Usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shield size={16} className="text-blue-600" />
                Crear Nuevo Usuario
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCrearUsuario} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre completo *</label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: María García López"
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Correo electrónico *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="usuario@empresa.com"
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contraseña temporal *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full h-9 px-3 pr-9 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rol *</label>
                  <select
                    value={form.rol}
                    onChange={(e) => setForm({ ...form, rol: e.target.value })}
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    {rolesDisponibles.map((r) => (
                      <option key={r} value={r}>{ROL_LABEL[r]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sede {form.rol !== 'GERENTE_GENERAL' ? '*' : ''}
                  </label>
                  {sedeDelGerente ? (
                    <select disabled className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-500">
                      <option>{sedes.find((s) => s.id === sedeDelGerente)?.nombre_sede || 'Tu sede'}</option>
                    </select>
                  ) : (
                    <select
                      value={form.sede_id}
                      onChange={(e) => setForm({ ...form, sede_id: e.target.value })}
                      className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">— Seleccionar —</option>
                      {sedes.map((s) => (
                        <option key={s.id} value={s.id}>{s.nombre_sede}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cargo (opcional)</label>
                <input
                  type="text"
                  value={form.cargo}
                  onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                  placeholder="Ej: Jefe de Operaciones"
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <p className="text-[11px] text-slate-400 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                El usuario recibirá un correo de Supabase para confirmar su cuenta. La contraseña temporal deberá ser cambiada en el primer ingreso.
              </p>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-xs font-semibold shadow-sm shadow-blue-500/20 cursor-pointer"
                >
                  {saving ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
