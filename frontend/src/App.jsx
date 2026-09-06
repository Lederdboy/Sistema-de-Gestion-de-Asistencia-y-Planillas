import { useState, useEffect } from 'react'
import {
  Users, CalendarDays, FileSpreadsheet, BarChart3,
  Settings, RefreshCw, ChevronRight, Search, Download,
  Lock, Calculator, Building2, MapPin
} from 'lucide-react'

// ─── Datos mock ───────────────────────────────────────────────────────────────
const BADGE_CONFIG = {
  D:  { label: 'D',  cls: 'bg-emerald-100 text-emerald-700' },
  N:  { label: 'N',  cls: 'bg-indigo-100 text-indigo-700'  },
  F:  { label: 'F',  cls: 'bg-rose-100 text-rose-700'      },
  DL: { label: 'DL', cls: 'bg-sky-100 text-sky-700'        },
  V:  { label: 'V',  cls: 'bg-amber-100 text-amber-700'    },
  M:  { label: 'M',  cls: 'bg-purple-100 text-purple-700'  },
}

const NAV_ITEMS = [
  { icon: BarChart3,     label: 'Dashboard',   id: 'dashboard' },
  { icon: Users,         label: 'Personal',    id: 'personal'  },
  { icon: CalendarDays,  label: 'Tareo',       id: 'tareo'     },
  { icon: FileSpreadsheet, label: 'Planilla',  id: 'planilla'  },
  { icon: Building2,     label: 'Empresas',    id: 'empresas'  },
  { icon: Settings,      label: 'Configuración', id: 'config'  },
]

const MOCK_WORKERS = [
  { id: 1, dni: '45123890', nombre: 'García Ríos, Carlos A.', cargo: 'Operario',   tareo: ['D','D','N','D','DL','DL','D','D','D','F','D','D','N','D','DL','DL','D','D','D','D','D','N','D','DL','DL','D','D','D','D','D','D'] },
  { id: 2, dni: '72345612', nombre: 'Mamani Quispe, Rosa L.', cargo: 'Supervisora', tareo: ['D','D','D','D','DL','DL','D','D','D','D','D','D','D','D','DL','DL','V','V','V','V','V','V','V','DL','DL','D','D','D','D','D','D'] },
  { id: 3, dni: '61987234', nombre: 'Torres Vega, Luis M.',   cargo: 'Técnico',    tareo: ['N','N','D','D','DL','DL','N','N','D','D','N','N','D','D','DL','DL','N','N','D','D','N','N','D','DL','DL','N','N','D','D','N','N'] },
  { id: 4, dni: '48765432', nombre: 'Flores Huanca, Ana P.',  cargo: 'Operaria',   tareo: ['D','F','D','D','DL','DL','D','D','F','D','D','D','D','D','DL','DL','D','D','D','F','D','D','D','DL','DL','D','D','D','D','D','D'] },
  { id: 5, dni: '55432198', nombre: 'Condori Puma, Juan C.',  cargo: 'Almacenero', tareo: ['D','D','D','D','DL','DL','D','D','D','D','D','D','D','D','DL','DL','D','D','D','D','D','D','D','DL','DL','D','D','D','D','D','D'] },
]

const getDaysInMonth = (y, m) => new Date(y, m, 0).getDate()
const isWeekend = (y, m, d) => { const day = new Date(y, m - 1, d).getDay(); return day === 0 || day === 6 }

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
)

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, sub, iconBg, loading }) => (
  <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-4">
    {loading ? (
      <>
        <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      </>
    ) : (
      <>
        <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-2xl font-semibold text-slate-900 leading-tight">{value}</p>
          <p className="text-xs text-slate-500">{sub}</p>
        </div>
      </>
    )}
  </div>
)

// ─── Badge de asistencia ──────────────────────────────────────────────────────
const AttBadge = ({ code }) => {
  const cfg = BADGE_CONFIG[code]
  if (!cfg) return <span className="text-slate-300 text-xs">—</span>
  return (
    <span className={`inline-block rounded-md px-1.5 py-0.5 text-xs font-bold ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ active, setActive }) => (
  <aside className="fixed left-0 top-0 h-screen w-16 bg-white border-r border-slate-200 flex flex-col items-center py-4 z-20">
    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center mb-6">
      <FileSpreadsheet size={16} className="text-white" />
    </div>
    <nav className="flex-1 flex flex-col gap-1 w-full px-2">
      {NAV_ITEMS.map(({ icon: Icon, label, id }) => (
        <button
          key={id}
          title={label}
          onClick={() => setActive(id)}
          className={`w-full flex items-center justify-center h-10 rounded-lg transition-colors ${
            active === id
              ? 'bg-blue-50 text-blue-600'
              : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
          }`}
        >
          <Icon size={18} />
        </button>
      ))}
    </nav>
    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
      JD
    </div>
  </aside>
)

// ─── Top Bar ──────────────────────────────────────────────────────────────────
const TopBar = ({ lastUpdate, onRefresh, refreshing }) => {
  const today = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
  return (
    <header className="fixed top-0 left-16 right-0 h-12 bg-white border-b border-slate-200 flex items-center px-5 gap-3 z-10">
      <nav className="flex items-center gap-1 text-xs text-slate-500 flex-1">
        <span className="text-slate-400">Planillas</span>
        <ChevronRight size={12} />
        <span className="text-slate-400">Asistencia</span>
        <ChevronRight size={12} />
        <span className="font-medium text-slate-700">Tareo Diario</span>
      </nav>
      <span className="text-xs text-slate-400 border border-slate-200 rounded px-2 py-1">{today}</span>
      <button
        onClick={onRefresh}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 border border-slate-200 rounded px-2 py-1 transition-colors"
      >
        <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
        Actualizar
      </button>
      {lastUpdate && (
        <span className="text-xs text-slate-400">Últ. act: {lastUpdate}</span>
      )}
    </header>
  )
}

// ─── Filtros ──────────────────────────────────────────────────────────────────
const Filters = ({ filters, setFilters }) => (
  <div className="flex flex-wrap items-center gap-2">
    <div className="relative">
      <Building2 size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <select
        className="h-9 pl-7 pr-3 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        value={filters.empresa}
        onChange={e => setFilters(f => ({ ...f, empresa: e.target.value }))}
      >
        <option value="">Empresa</option>
        <option value="1">Minera Andina S.A.</option>
        <option value="2">Constructora Norte S.A.C.</option>
      </select>
    </div>
    <div className="relative">
      <MapPin size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <select
        className="h-9 pl-7 pr-3 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        value={filters.sede}
        onChange={e => setFilters(f => ({ ...f, sede: e.target.value }))}
      >
        <option value="">Sede</option>
        <option value="1">Sede Lima</option>
        <option value="2">Sede Arequipa</option>
      </select>
    </div>
    <select
      className="h-9 px-3 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
      value={filters.periodo}
      onChange={e => setFilters(f => ({ ...f, periodo: e.target.value }))}
    >
      {['2025-07','2025-06','2025-05','2025-04'].map(p => (
        <option key={p} value={p}>{p}</option>
      ))}
    </select>
    <div className="relative">
      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        placeholder="Buscar DNI o nombre..."
        className="h-9 pl-7 pr-3 text-xs border border-slate-200 rounded-md w-52 focus:outline-none focus:ring-1 focus:ring-blue-500"
        value={filters.search}
        onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
      />
    </div>
  </div>
)

// ─── Matriz de Tareo ──────────────────────────────────────────────────────────
const AttendanceMatrix = ({ loading, workers, year, month }) => {
  const days = getDaysInMonth(year, month)
  const dayNums = Array.from({ length: days }, (_, i) => i + 1)

  if (loading) {
    return (
      <div className="space-y-2 mt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    )
  }

  const summary = (tareo) => ({
    D:  tareo.filter(c => c === 'D').length,
    N:  tareo.filter(c => c === 'N').length,
    F:  tareo.filter(c => c === 'F').length,
    DL: tareo.filter(c => c === 'DL').length,
    V:  tareo.filter(c => c === 'V').length,
  })

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-lg">
      <table className="text-xs border-collapse min-w-max w-full">
        <thead>
          <tr className="bg-slate-50">
            <th className="sticky left-0 bg-slate-50 z-10 text-left px-3 py-2 font-semibold text-slate-700 border-b border-r border-slate-200 min-w-[180px]">Colaborador</th>
            <th className="px-2 py-2 font-semibold text-slate-700 border-b border-r border-slate-200 min-w-[80px]">DNI</th>
            {dayNums.map(d => (
              <th
                key={d}
                className={`w-8 py-2 font-semibold border-b border-slate-200 text-center ${
                  isWeekend(year, month, d)
                    ? 'text-rose-500 bg-rose-50'
                    : 'text-slate-600'
                }`}
              >
                {d}
              </th>
            ))}
            {['D','N','F','DL','V'].map(k => (
              <th key={k} className={`w-9 py-2 font-bold border-b border-l border-slate-200 text-center ${BADGE_CONFIG[k]?.cls}`}>{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {workers.map((w, idx) => {
            const s = summary(w.tareo)
            return (
              <tr key={w.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                <td className="sticky left-0 bg-inherit z-10 px-3 py-1.5 font-medium text-slate-800 border-r border-slate-100 whitespace-nowrap">{w.nombre}</td>
                <td className="px-2 py-1.5 text-slate-500 border-r border-slate-100 font-mono">{w.dni}</td>
                {dayNums.map(d => (
                  <td key={d} className={`py-1.5 text-center border-slate-100 ${isWeekend(year, month, d) ? 'bg-rose-50/40' : ''}`}>
                    <AttBadge code={w.tareo[d - 1]} />
                  </td>
                ))}
                {['D','N','F','DL','V'].map(k => (
                  <td key={k} className="py-1.5 text-center border-l border-slate-100 font-semibold text-slate-700">{s[k] || 0}</td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── App Principal ────────────────────────────────────────────────────────────
export default function App() {
  const [activeNav, setActiveNav] = useState('tareo')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [filters, setFilters] = useState({ empresa: '', sede: '', periodo: '2025-07', search: '' })

  const [year, month] = filters.periodo.split('-').map(Number)

  const filteredWorkers = MOCK_WORKERS.filter(w =>
    !filters.search ||
    w.nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
    w.dni.includes(filters.search)
  )

  const simulateFetch = (ms = 1400) =>
    new Promise(res => setTimeout(res, ms))

  useEffect(() => {
    setLoading(true)
    simulateFetch().then(() => {
      setLoading(false)
      setLastUpdate(new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }))
    })
  }, [filters.periodo, filters.sede, filters.empresa])

  const handleRefresh = async () => {
    setRefreshing(true)
    setLoading(true)
    await simulateFetch(900)
    setLoading(false)
    setRefreshing(false)
    setLastUpdate(new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }))
  }

  const kpis = [
    { icon: Users,          label: 'Total Trabajadores', value: '128',    sub: 'Activos este periodo',   iconBg: 'bg-blue-50 text-blue-600'    },
    { icon: CalendarDays,   label: 'Calculados',         value: '94',     sub: '73.4% completado',       iconBg: 'bg-emerald-50 text-emerald-600' },
    { icon: BarChart3,      label: 'Pendientes',         value: '34',     sub: 'Requieren revisión',     iconBg: 'bg-amber-50 text-amber-600'  },
    { icon: FileSpreadsheet,label: 'Total Neto',         value: 'S/ 284,750', sub: 'Pre-planilla Jul 2025', iconBg: 'bg-slate-100 text-slate-600' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Sidebar active={activeNav} setActive={setActiveNav} />
      <TopBar lastUpdate={lastUpdate} onRefresh={handleRefresh} refreshing={refreshing} />

      <main className="ml-16 pt-12 p-5 space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map((k, i) => (
            <KpiCard key={i} {...k} loading={loading} />
          ))}
        </div>

        {/* Panel de Tareo */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
          {/* Header del panel */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Matriz de Tareo Diario</h2>
              <p className="text-xs text-slate-500">Periodo {filters.periodo} · {filteredWorkers.length} colaboradores</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="h-9 px-3 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-1.5 transition-colors">
                <Download size={13} /> Exportar Excel
              </button>
              <button className="h-9 px-3 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-1.5 transition-colors">
                <Calculator size={13} /> Calcular Planilla
              </button>
              <button className="h-9 px-3 text-xs font-medium bg-red-700 hover:bg-red-800 text-white rounded-md flex items-center gap-1.5 transition-colors">
                <Lock size={13} /> Cerrar Planilla
              </button>
            </div>
          </div>

          {/* Filtros */}
          <Filters filters={filters} setFilters={setFilters} />

          {/* Leyenda */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(BADGE_CONFIG).map(([code, { label, cls }]) => (
              <span key={code} className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${cls}`}>
                <span className="font-bold">{label}</span>
                <span className="font-normal opacity-75">
                  {{ D:'Día', N:'Noche', F:'Falta', DL:'Desc. Ley', V:'Vacaciones', M:'Mixto' }[code]}
                </span>
              </span>
            ))}
          </div>

          {/* Tabla */}
          <AttendanceMatrix
            loading={loading}
            workers={filteredWorkers}
            year={year}
            month={month}
          />
        </div>
      </main>
    </div>
  )
}
