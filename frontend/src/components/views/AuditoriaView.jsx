import { useState, useEffect } from 'react'
import { ShieldCheck, Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { getAuditoria } from '../../services/api'

const ACCION_COLOR = {
  CERRAR_PLANILLA: 'bg-blue-100 text-blue-700',
  CREAR_TRABAJADOR: 'bg-emerald-100 text-emerald-700',
  ACTUALIZAR_TRABAJADOR: 'bg-amber-100 text-amber-700',
  VALIDAR_DESCANSO: 'bg-violet-100 text-violet-700',
  RECHAZAR_DESCANSO: 'bg-rose-100 text-rose-700',
  LOGIN: 'bg-slate-100 text-slate-600',
}

export default function AuditoriaView({ showToast }) {
  const [registros, setRegistros] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const PAGE_SIZE = 30

  const cargar = async (p = 0) => {
    setLoading(true)
    const data = await getAuditoria(p, PAGE_SIZE)
    if (data) {
      setRegistros(data.content || [])
      setTotalPages(data.totalPages || 1)
    }
    setLoading(false)
  }

  useEffect(() => { cargar(page) }, [page])

  const filtered = registros.filter(r =>
    !search ||
    r.usuarioNombre?.toLowerCase().includes(search.toLowerCase()) ||
    r.accion?.toLowerCase().includes(search.toLowerCase()) ||
    r.entidad?.toLowerCase().includes(search.toLowerCase()) ||
    r.detalle?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck size={16} className="text-violet-600" />
            Historial de Auditoría
            <span className="ml-1 px-2 py-0.5 text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200 rounded">
              Solo lectura
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Registro de todas las acciones críticas del sistema</p>
        </div>
        <button
          onClick={() => cargar(page)}
          className="h-9 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por usuario, acción, entidad..."
            className="w-full h-9 pl-9 pr-3 text-xs border border-slate-200 rounded-md bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Cargando registros...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No hay registros de auditoría.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Fecha y Hora</th>
                  <th className="px-3 py-3">Usuario</th>
                  <th className="px-3 py-3">Acción</th>
                  <th className="px-3 py-3">Entidad</th>
                  <th className="px-3 py-3">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString('es-PE') : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-slate-800">{r.usuarioNombre || '—'}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{r.usuarioUuid?.slice(0, 8)}...</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${ACCION_COLOR[r.accion] || 'bg-slate-100 text-slate-700'}`}>
                        {r.accion}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      <span className="font-medium">{r.entidad}</span>
                      {r.entidadId && <span className="text-slate-400 ml-1">#{r.entidadId}</span>}
                    </td>
                    <td className="px-3 py-3 text-slate-500 max-w-xs truncate" title={r.detalle}>
                      {r.detalle || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Página {page + 1} de {totalPages}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="p-1.5 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-100 cursor-pointer">
                <ChevronLeft size={13} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="p-1.5 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-100 cursor-pointer">
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
