import { useState, useEffect } from 'react'
import { FileText, Palmtree, Stethoscope, User, Calendar, DollarSign, Clock, Download } from 'lucide-react'
import { supabase } from '../../services/supabase'

const TABS = [
  { id: 'boletas', label: 'Mis Boletas', icon: FileText },
  { id: 'vacaciones', label: 'Vacaciones', icon: Palmtree },
  { id: 'descansos', label: 'Descansos Médicos', icon: Stethoscope },
  { id: 'perfil', label: 'Mi Información', icon: User },
]

export default function TrabajadorView({ user, setActive }) {
  const [tab, setTab] = useState('boletas')
  const [trabajador, setTrabajador] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      if (!user?.uuid) return
      // Buscar el trabajador vinculado al usuario por usuario_id
      const { data } = await supabase
        .from('trabajadores')
        .select('*')
        .eq('usuario_id', user.uuid)
        .single()
      setTrabajador(data || null)
      setLoading(false)
    }
    cargar()
  }, [user?.uuid])

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Cargando tu información...</div>
  }

  return (
    <div className="space-y-4">
      {/* Header personal */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-lg flex items-center justify-center flex-shrink-0">
            {user?.nombre?.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">{user?.nombre}</h2>
            <p className="text-xs text-slate-500">{trabajador?.cargo || 'Trabajador'} · {user?.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50/70 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
                tab === id
                  ? 'border-blue-600 text-blue-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {tab === 'boletas' && <BoletasTab trabajador={trabajador} />}
          {tab === 'vacaciones' && <VacacionesTab trabajador={trabajador} />}
          {tab === 'descansos' && <DescansosTab trabajador={trabajador} />}
          {tab === 'perfil' && <PerfilTab trabajador={trabajador} user={user} />}
        </div>
      </div>
    </div>
  )
}

function BoletasTab({ trabajador }) {
  const [boletas, setBoletas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!trabajador?.id) { setLoading(false); return }
    supabase
      .from('planillas_resumen')
      .select('id, periodo, sueldo_basico, total_ingresos, total_descuentos, neto_pagar, estado')
      .eq('trabajador_id', trabajador.id)
      .order('periodo', { ascending: false })
      .then(({ data }) => { setBoletas(data || []); setLoading(false) })
  }, [trabajador?.id])

  if (!trabajador) return <SinVinculo />
  if (loading) return <div className="p-6 text-center text-xs text-slate-400">Cargando boletas...</div>

  if (boletas.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-slate-500">Historial de boletas de pago.</p>
        <div className="p-8 flex flex-col items-center gap-2 text-center">
          <FileText size={28} className="text-slate-300" />
          <p className="text-xs font-semibold text-slate-500">Sin boletas registradas</p>
          <p className="text-[11px] text-slate-400">Tus boletas aparecerán aquí una vez procesada la planilla.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">Historial de boletas de pago — {boletas.length} registros.</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {boletas.map((b) => {
          const [anio, mes] = (b.periodo || '').split('-')
          const nombreMes = new Date(parseInt(anio), parseInt(mes) - 1).toLocaleString('es-PE', { month: 'long' })
          const pagado = b.estado === 'PAGADO' || b.estado === 'pagado'
          return (
            <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText size={14} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 capitalize">{nombreMes} {anio}</p>
                  <p className="text-[11px] text-slate-400">Neto: S/ {Number(b.neto_pagar || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                pagado ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {pagado ? 'Pagado' : 'Pendiente'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function VacacionesTab({ trabajador }) {
  const [stats, setStats] = useState({ disponibles: 30, tomados: 0, pendientes: 0 })
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!trabajador?.id) { setLoading(false); return }
    supabase
      .from('solicitudes_vacaciones')
      .select('id, fecha_inicio, fecha_fin, dias, estado, created_at')
      .eq('trabajador_id', trabajador.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const lista = data || []
        setSolicitudes(lista)
        const tomados = lista.filter(s => s.estado === 'APROBADO').reduce((acc, s) => acc + (s.dias || 0), 0)
        const pendientes = lista.filter(s => s.estado === 'PENDIENTE').reduce((acc, s) => acc + (s.dias || 0), 0)
        setStats({ disponibles: Math.max(0, 30 - tomados), tomados, pendientes })
        setLoading(false)
      })
  }, [trabajador?.id])

  if (!trabajador) return <SinVinculo />

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-center">
          <div className="flex justify-center mb-1"><Palmtree size={18} className="text-emerald-600" /></div>
          <p className="text-lg font-bold text-slate-900">{stats.disponibles}</p>
          <p className="text-[11px] text-slate-500">Días disponibles</p>
        </div>
        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-center">
          <div className="flex justify-center mb-1"><Calendar size={18} className="text-blue-600" /></div>
          <p className="text-lg font-bold text-slate-900">{stats.tomados}</p>
          <p className="text-[11px] text-slate-500">Días tomados</p>
        </div>
        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-center">
          <div className="flex justify-center mb-1"><Clock size={18} className="text-amber-600" /></div>
          <p className="text-lg font-bold text-slate-900">{stats.pendientes}</p>
          <p className="text-[11px] text-slate-500">Días en solicitud</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-xs text-slate-400 py-4">Cargando solicitudes...</div>
      ) : solicitudes.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-600">Historial de solicitudes</p>
          {solicitudes.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 text-xs">
              <div>
                <p className="font-semibold text-slate-800">{s.fecha_inicio} → {s.fecha_fin}</p>
                <p className="text-[11px] text-slate-400">{s.dias} días</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                s.estado === 'APROBADO' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                s.estado === 'RECHAZADO' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>{s.estado}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-lg border border-blue-100 bg-blue-50/50 text-xs text-blue-700">
          Para solicitar vacaciones, comunícate con tu supervisor o gerente de sede.
        </div>
      )}
    </div>
  )
}

function DescansosTab({ trabajador }) {
  if (!trabajador) return <SinVinculo />
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">Registro de descansos médicos y certificados.</p>
      <div className="p-8 flex flex-col items-center justify-center text-center gap-2">
        <Stethoscope size={28} className="text-slate-300" />
        <p className="text-xs font-semibold text-slate-500">Sin descansos médicos registrados</p>
        <p className="text-[11px] text-slate-400">Cuando tengas un descanso médico, aparecerá aquí.</p>
      </div>
    </div>
  )
}

function PerfilTab({ trabajador, user }) {
  if (!trabajador) return <SinVinculo />
  const campos = [
    { label: 'Nombre completo', valor: `${trabajador.nombres || ''} ${trabajador.apellido_paterno || ''} ${trabajador.apellido_materno || ''}`.trim() },
    { label: 'DNI', valor: trabajador.numero_documento },
    { label: 'Cargo', valor: trabajador.cargo },
    { label: 'Fecha de ingreso', valor: trabajador.fecha_ingreso },
    { label: 'Correo', valor: user?.email },
    { label: 'Sueldo básico', valor: `S/ ${Number(trabajador.sueldo_basico || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}` },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {campos.map(({ label, valor }) => (
        <div key={label} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
          <p className="text-xs font-semibold text-slate-800 mt-0.5">{valor || '—'}</p>
        </div>
      ))}
    </div>
  )
}

function SinVinculo() {
  return (
    <div className="p-8 flex flex-col items-center justify-center text-center gap-2">
      <User size={28} className="text-slate-300" />
      <p className="text-xs font-semibold text-slate-500">Tu cuenta no está vinculada a un trabajador</p>
      <p className="text-[11px] text-slate-400">Contacta al administrador para vincular tu perfil.</p>
    </div>
  )
}
