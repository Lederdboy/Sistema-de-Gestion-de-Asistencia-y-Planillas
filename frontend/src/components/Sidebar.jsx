import React, { useState, useEffect } from 'react'
import {
  BarChart3,
  Users,
  CalendarDays,
  Palmtree,
  FileSpreadsheet,
  Printer,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  User,
} from 'lucide-react'

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Dashboard', icon: BarChart3 },
  { id: 'personal', label: 'Personal', shortLabel: 'Personal', icon: Users },
  { id: 'tareo', label: 'Tareo Diario', shortLabel: 'Tareo', icon: CalendarDays },
  { id: 'vacaciones', label: 'Vacaciones', shortLabel: 'Vacaciones', icon: Palmtree },
  { id: 'planilla', label: 'Planilla', shortLabel: 'Planilla', icon: FileSpreadsheet },
  { id: 'reportes', label: 'Reportes', shortLabel: 'Reportes', icon: Printer },
]

export default function Sidebar({
  active,
  setActive,
  user,
  onLogout,
  isOpen = true,
  isMobile = false,
  onToggle,
}) {
  const [profileImage, setProfileImage] = useState(null)

  useEffect(() => {
    if (user?.email) {
      const savedImage = localStorage.getItem(`profile_image_${user.email}`)
      if (savedImage) {
        setProfileImage(savedImage)
      }
    }
  }, [user?.email])

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white text-slate-800 border-r border-slate-200 flex flex-col z-30 select-none transition-all duration-300 ease-in-out shadow-[1px_0_15px_rgba(15,23,42,0.03)] ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className="flex flex-col h-full">
        {isOpen ? (
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 bg-white">
            <div
              onClick={() => setActive('dashboard')}
              className="flex items-center gap-3 cursor-pointer group min-w-0"
            >
              <img
                src="/logo.png"
                alt="Logo"
                className="h-9 w-auto max-w-[40px] object-contain flex-shrink-0 transition-transform group-hover:scale-105"
              />

              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-slate-900 tracking-tight leading-tight truncate">
                  Planilla Enterprise
                </span>
                <span className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
                  SaaS Laboral
                </span>
              </div>
            </div>

            <button
              onClick={onToggle}
              title="Contraer menú lateral"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0"
            >
              <PanelLeftClose size={17} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-3 border-b border-slate-100 bg-white gap-2">
            <div
              onClick={() => setActive('dashboard')}
              className="flex items-center justify-center p-1 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <img
                src="/logo.png"
                alt="Logo"
                className="h-8 w-auto object-contain"
                title="Planilla Enterprise"
              />
            </div>

            <button
              onClick={onToggle}
              title="Expandir menú lateral"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <PanelLeftOpen size={16} />
            </button>
          </div>
        )}

        <div className="px-3 pt-4 pb-2 flex-1 overflow-y-auto">
          {isOpen && (
            <div className="mb-2.5 px-2 flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Módulos
              </p>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                {NAV_ITEMS.length}
              </span>
            </div>
          )}

          <nav className="space-y-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const isActive = active === id

              return (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  title={!isOpen ? label : undefined}
                  className={`group relative w-full flex items-center rounded-xl transition-all duration-150 ease-out cursor-pointer ${
                    isOpen
                      ? 'gap-3 px-3 py-2.5 text-xs font-semibold'
                      : 'w-10 h-10 mx-auto justify-center'
                  } ${
                    isActive
                      ? 'bg-blue-50/90 text-blue-600 font-semibold border border-blue-100 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                      isActive ? 'text-blue-600 bg-white shadow-2xs' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  >
                    <Icon
                      size={18}
                      className="flex-shrink-0"
                      strokeWidth={isActive ? 2.2 : 1.9}
                    />
                  </div>

                  {isOpen && (
                    <span className="flex-1 truncate tracking-tight text-left">{label}</span>
                  )}

                  {!isOpen && (
                    <div className="absolute left-14 bg-slate-900 text-white text-[11px] font-medium py-1.5 px-2.5 rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-30 whitespace-nowrap">
                      {label}
                    </div>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActive('config')}
            title={!isOpen ? 'Configuración del Sistema' : undefined}
            className={`group relative w-full flex items-center rounded-xl transition-all duration-150 ease-out cursor-pointer ${
              isOpen
                ? 'gap-3 px-3 py-2 text-xs font-semibold'
                : 'w-10 h-10 mx-auto justify-center'
            } ${
              active === 'config'
                ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-100'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                active === 'config' ? 'text-blue-600 bg-white shadow-2xs' : 'text-slate-400 group-hover:text-slate-600'
              }`}
            >
              <Settings
                size={17}
                className="flex-shrink-0"
              />
            </div>

            {isOpen && <span className="truncate">Configuración</span>}

            {!isOpen && (
              <div className="absolute left-14 bg-slate-900 text-white text-[11px] font-medium py-1.5 px-2.5 rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-30 whitespace-nowrap">
                Configuración
              </div>
            )}
          </button>

          <div className="h-px bg-slate-200/80 my-2 mx-1" />

          {isOpen ? (
            <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shadow-xs">
                  {user?.avatarText || 'AD'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate leading-tight">
                  {user?.name || 'Administrador'}
                </p>
                <p className="text-[10px] text-slate-500 font-medium truncate leading-none mt-0.5">
                  {user?.role || 'RRHH'}
                </p>
              </div>

              <button
                onClick={onLogout}
                title="Cerrar Sesión"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 pt-1">
              <div
                className="relative w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shadow-xs"
                title={user?.name || 'Administrador'}
              >
                {user?.avatarText || 'AD'}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
              </div>

              <button
                onClick={onLogout}
                title="Cerrar Sesión"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
