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
      className={`fixed top-0 right-0 h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200/90 flex items-center justify-between px-6 z-20 transition-all duration-300 ${
        isSidebarOpen ? 'left-64' : 'left-16'
      }`}
    >
      {/* Lado Izquierdo: Breadcrumb Espacioso */}
      <div className="flex items-center gap-3.5">

        <nav className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-400 hover:text-slate-600 transition-colors">
            Planillas
          </span>
          <ChevronRight size={13} className="text-slate-300" />
          <span className="font-semibold text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded">
            {section}
          </span>
          <ChevronRight size={13} className="text-slate-300" />
          <span className="font-bold text-slate-900 text-sm">
            {page}
          </span>
        </nav>
      </div>

      {/* Lado Derecho: Controles Organizados y Métricas */}
      <div className="flex items-center gap-3">
        {/* Periodo de Trabajo */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50/70 border border-blue-100 text-xs font-semibold text-blue-700">
          <Calendar size={13} className="text-blue-600" />
          <span>Periodo: 2026-09</span>
        </div>

        {/* Fecha Actual */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 capitalize">
          <span>{today}</span>
        </div>

        {/* Botón Actualizar */}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-300 bg-white border border-slate-200 rounded-lg px-3 py-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw
            size={13}
            className={`text-slate-400 ${refreshing ? 'animate-spin text-blue-600' : ''}`}
          />
          <span className="hidden md:inline">Actualizar Datos</span>
        </button>

        {/* Hora de Última Sincronización */}
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
