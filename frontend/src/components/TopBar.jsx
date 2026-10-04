import React, { useState, useEffect } from 'react'
import {
  ChevronRight,
  RefreshCw,
  Calendar,
  Shield,
  PanelLeft,
  Bell,
  Clock,
  X,
} from 'lucide-react'

const BREADCRUMB_MAP = {
  dashboard:  { section: 'Panel Principal', page: 'Dashboard Ejecutivo' },
  personal:   { section: 'Recursos Humanos', page: 'Directorio de Personal' },
  tareo:      { section: 'Control de Asistencia', page: 'Tareo Diario' },
  vacaciones: { section: 'Gestión de Talento', page: 'Control de Vacaciones y Récord' },
  planilla:   { section: 'Cálculo de Nómina', page: 'Pre-Planilla Mensual' },
  reportes:   { section: 'Declaraciones & Boletas', page: 'Reportes SUNAT y Boletas' },
  config:     { section: 'Administración', page: 'Configuración y Parámetros' },
}

export default function TopBar({
  activeNav,
  lastUpdate,
  onRefresh,
  refreshing,
  user,
  isSidebarOpen,
  isMobile = false,
  onToggleSidebar,
}) {
  const [notifs, setNotifs] = useState([])
  const [showNotifs, setShowNotifs] = useState(false)
  const noLeidas = notifs.filter(n => !n.leida).length

  useEffect(() => {
    if (!user?.token) return
    fetch('/api/v1/notificaciones', {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => setNotifs(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [user?.token])

  const marcarLeida = async (id) => {
    await fetch(`/api/v1/notificaciones/${id}/leer`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${user?.token}` },
    }).catch(() => {})
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n))
  }

  const marcarTodas = async () => {
    await fetch('/api/v1/notificaciones/leer-todas', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${user?.token}` },
    }).catch(() => {})
    setNotifs(prev => prev.map(n => ({ ...n, leida: true })))
  }
  const today = new Date().toLocaleDateString('es-PE', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const { section, page } = BREADCRUMB_MAP[activeNav] || { section: 'Módulo', page: 'Detalle' }

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white/85 backdrop-blur-xl border-b border-blue-100/90 flex items-center justify-between px-4 sm:px-6 z-20 transition-all duration-300 shadow-[0_8px_25px_rgba(37,99,235,0.04)] ${
        isMobile ? 'left-0' : isSidebarOpen ? 'left-64' : 'left-16'
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {isMobile && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-white text-slate-600 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-700"
            aria-label="Abrir menú"
          >
            <PanelLeft size={16} />
          </button>
        )}

        <nav className="flex items-center gap-2 text-xs min-w-0">
          <span className="font-semibold text-slate-400 hover:text-blue-700 transition-colors">
            Planillas
          </span>
          <ChevronRight size={13} className="text-slate-300" />
          <span className="font-semibold text-slate-500 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            {section}
          </span>
          <ChevronRight size={13} className="text-slate-300" />
          <span className="font-bold text-slate-900 text-sm truncate">
            {page}
          </span>
        </nav>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700">
          <Calendar size={13} className="text-blue-600" />
          <span>Periodo: 2026-09</span>
        </div>

        {user?.sedeName && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700">
            <Shield size={13} className="text-indigo-500" />
            <span>{user.sedeName}</span>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 capitalize">
          <span>{today}</span>
        </div>

        {/* Notificaciones */}
        <div className="relative">
          <button onClick={() => setShowNotifs(!showNotifs)}
            className="relative flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 bg-white/90 text-slate-600 hover:text-blue-700 hover:border-blue-200 shadow-sm transition-all cursor-pointer">
            <Bell size={15} />
            {noLeidas > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {noLeidas > 9 ? '9+' : noLeidas}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-11 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <span className="text-xs font-bold text-slate-800">Notificaciones</span>
                <div className="flex items-center gap-2">
                  {noLeidas > 0 && (
                    <button onClick={marcarTodas} className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer">Marcar todas</button>
                  )}
                  <button onClick={() => setShowNotifs(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={14} /></button>
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">Sin notificaciones</div>
                ) : notifs.slice(0, 15).map(n => (
                  <div key={n.id} onClick={() => marcarLeida(n.id)}
                    className={`px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                      !n.leida ? 'bg-blue-50/50' : ''
                    }`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs font-semibold ${!n.leida ? 'text-slate-900' : 'text-slate-600'}`}>{n.titulo}</p>
                      {!n.leida && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.mensaje}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          disabled={refreshing}
          className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-blue-700 border border-slate-200 bg-white/90 rounded-full px-3 py-1.5 shadow-sm transition-all hover:border-blue-200 hover:shadow-[0_8px_18px_rgba(37,99,235,0.08)]"
        >
          <RefreshCw
            size={13}
            className={`text-slate-400 ${refreshing ? 'animate-spin text-blue-600' : ''}`}
          />
          <span className="hidden md:inline">Actualizar</span>
        </button>

        {lastUpdate && (
          <div className="hidden xl:flex items-center gap-1 text-[11px] text-slate-400 pl-1">
            <Clock size={12} />
            <span>Sinc: {lastUpdate}</span>
          </div>
        )}
      </div>
    </header>
  )
}
