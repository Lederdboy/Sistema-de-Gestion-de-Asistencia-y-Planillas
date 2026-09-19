import React from 'react'
import {
  ChevronRight,
  RefreshCw,
  Calendar,
  Shield,
  PanelLeft,
  Bell,
  Clock,
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

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 capitalize">
          <span>{today}</span>
        </div>

        <button
          onClick={onRefresh}
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
