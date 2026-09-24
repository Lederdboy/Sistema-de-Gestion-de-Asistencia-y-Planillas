import { useState, useEffect } from 'react'
import { FileText, Palmtree, Stethoscope, User, Calendar, DollarSign, Clock } from 'lucide-react'
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
  if (!trabajador) return <SinVinculo />
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre']
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">Historial de boletas de pago del año en curso.</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {meses.map((mes, i) => (
          <div key={mes} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">{mes} 2026</p>
                <p className="text-[11px] text-slate-400">S/ {Number(trabajador.sueldo_basico || 1500).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${i < 8 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
              {i < 8 ? 'Pagado' : 'Pendiente'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function VacacionesTab({ trabajador }) {
  if (!trabajador) return <SinVinculo />
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-center">
          <div className="flex justify-center mb-1"><Palmtree size={18} className="text-emerald-600" /></div>
          <p className="text-lg font-bold text-slate-900">30</p>
          <p className="text-[11px] text-slate-500">Días disponibles</p>
        </div>
        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-center">
          <div className="flex justify-center mb-1"><Calendar size={18} className="text-blue-600" /></div>
          <p className="text-lg font-bold text-slate-900">0</p>
          <p className="text-[11px] text-slate-500">Días tomados</p>
        </div>
        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-center">
          <div className="flex justify-center mb-1"><Clock size={18} className="text-amber-600" /></div>
          <p className="text-lg font-bold text-slate-900">0</p>
          <p className="text-[11px] text-slate-500">Días pendientes</p>
        </div>
      </div>
      <div className="p-4 rounded-lg border border-blue-100 bg-blue-50/50 text-xs text-blue-700">
        Para solicitar vacaciones, comunícate con tu supervisor o gerente de sede.
      </div>
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
