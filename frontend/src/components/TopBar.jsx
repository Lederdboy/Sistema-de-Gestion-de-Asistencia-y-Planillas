import React, { useState } from 'react'
import {
  ChevronRight,
  RefreshCw,
  Calendar,
  Shield,
  PanelLeft,
  Bell,
  Clock,
  Minus,
  Plus,
  Maximize2,
  ChevronDown,
  Check,
  RotateCcw,
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
  viewZoom = 100,
  onZoomChange,
}) {
  const [showZoomMenu, setShowZoomMenu] = useState(false)

  const today = new Date().toLocaleDateString('es-PE', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const { section, page } = BREADCRUMB_MAP[activeNav] || { section: 'Módulo', page: 'Detalle' }

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-20 transition-all duration-300 shadow-2xs ${
        isMobile ? 'left-0' : isSidebarOpen ? 'left-64' : 'left-16'
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {isMobile && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition-colors hover:border-slate-300 hover:text-slate-900 cursor-pointer"
            aria-label="Abrir menú"
          >
            <PanelLeft size={16} />
          </button>
        )}

        <nav className="flex items-center gap-2 text-xs min-w-0">
          <span className="font-semibold text-slate-400 hover:text-slate-600 transition-colors">
            Planillas
          </span>
          <ChevronRight size={13} className="text-slate-300" />
          <span className="font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 text-[11px]">
            {section}
          </span>
          <ChevronRight size={13} className="text-slate-300" />
          <span className="font-bold text-slate-900 text-sm truncate">
            {page}
          </span>
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Medidor de Vista (Solo afecta al área de vista de contenido, no al panel) */}
        <div className="relative flex items-center bg-white border border-slate-200 rounded-xl shadow-2xs p-0.5 text-xs">
          <button
            type="button"
            onClick={() => onZoomChange && onZoomChange(Math.max(65, viewZoom - 5))}
            disabled={viewZoom <= 65}
            className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            title="Reducir vista (-5%)"
          >
            <Minus size={13} />
          </button>

          <button
            type="button"
            onClick={() => setShowZoomMenu(!showZoomMenu)}
            className="px-2 h-7 flex items-center gap-1.5 hover:bg-slate-100 rounded-lg text-[11px] font-semibold text-slate-800 transition-colors cursor-pointer"
            title="Medida de vista (Afecta solo al contenido, predeterminado 100%)"
          >
            <Maximize2 size={12} className="text-blue-600" />
            <span>{viewZoom}%</span>
            <ChevronDown size={11} className="text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => onZoomChange && onZoomChange(Math.min(135, viewZoom + 5))}
            disabled={viewZoom >= 135}
            className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            title="Aumentar vista (+5%)"
          >
            <Plus size={13} />
          </button>

          {/* Menú Desplegable de Escala */}
          {showZoomMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowZoomMenu(false)}
              />
              <div className="absolute top-full right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                  <span>Escala de Vista</span>
                  <span className="text-[9px] lowercase font-normal text-slate-400">vista activa</span>
                </div>
                {[75, 80, 85, 90, 95, 100, 105, 110, 120, 125].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      if (onZoomChange) onZoomChange(lvl)
                      setShowZoomMenu(false)
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                      viewZoom === lvl ? 'font-bold text-blue-600 bg-blue-50/70' : 'text-slate-700'
                    }`}
                  >
                    <span>{lvl}%</span>
                    {lvl === 100 && (
                      <span className="text-[10px] text-slate-400 font-medium px-1.5 py-0.2 rounded bg-slate-100">
                        100% (Normal)
                      </span>
                    )}
                    {viewZoom === lvl && <Check size={13} className="text-blue-600" />}
                  </button>
                ))}

                {viewZoom !== 100 && (
                  <div className="pt-1 mt-1 border-t border-slate-100 px-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (onZoomChange) onZoomChange(100)
                        setShowZoomMenu(false)
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-blue-600 hover:bg-blue-50 font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw size={11} />
                      <span>Restablecer a 100%</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
          <Calendar size={13} className="text-blue-600" />
          <span>Periodo: 2026-09</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-600 capitalize shadow-2xs">
          <span>{today}</span>
        </div>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg px-3 py-1.5 shadow-2xs transition-all cursor-pointer"
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
