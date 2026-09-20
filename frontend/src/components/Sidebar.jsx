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
      className={`fixed left-0 top-0 h-screen bg-slate-950/98 text-slate-100 border-r border-slate-800/80 flex flex-col z-30 select-none transition-all duration-300 ease-in-out shadow-[0_22px_50px_rgba(15,23,42,0.22)] ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className="flex flex-col h-full">
        {isOpen ? (
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80 bg-slate-950/80">
            <div
              onClick={() => setActive('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group min-w-0"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 shadow-lg shadow-blue-500/20">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="h-5 w-auto object-contain drop-shadow-sm"
                />
              </div>

              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-white tracking-tight leading-tight truncate">
                  Planilla Enterprise
                </span>
                <span className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
                  SaaS Laboral
                </span>
              </div>
            </div>

            <button
              onClick={onToggle}
              title="Contraer menú lateral"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer flex-shrink-0"
            >
              <PanelLeftClose size={17} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-3 border-b border-slate-800/80 bg-slate-950/80 gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 shadow-lg shadow-blue-500/20 cursor-pointer">
              <img
                src="/logo.png"
                alt="Logo"
                onClick={() => setActive('dashboard')}
                className="h-5 w-auto object-contain drop-shadow-sm"
                title="Planilla Enterprise"
              />
            </div>

            <button
              onClick={onToggle}
              title="Expandir menú lateral"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <PanelLeftOpen size={16} />
            </button>
          </div>
        )}

        <div className="px-2.5 pt-3 pb-2 flex-1">
          {isOpen && (
            <div className="mb-3 px-2 flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.16em]">
                Módulos
              </p>
              <span className="rounded-full bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">
                {NAV_ITEMS.length}
              </span>
            </div>
          )}

          <nav className="space-y-1.5">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const isActive = active === id

              return (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  title={!isOpen ? label : undefined}
                  className={`group relative w-full flex items-center rounded-xl transition-all duration-200 ease-out cursor-pointer ${
                    isOpen
                      ? 'gap-3 px-3.5 py-2.5 text-xs'
                      : 'w-11 h-11 mx-auto justify-center'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      isActive ? 'bg-white/20' : 'bg-transparent group-hover:bg-slate-700'
                    }`}
                  >
                    <Icon
                      size={18}
                      className={`flex-shrink-0 transition-transform duration-200 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                      }`}
                      strokeWidth={isActive ? 2.2 : 1.9}
                    />
                  </div>

                  {isOpen && (
                    <span className="flex-1 truncate tracking-tight text-left">{label}</span>
                  )}

                  {!isOpen && (
                    <div className="absolute left-14 bg-slate-900 text-white text-[11px] font-semibold py-1.5 px-2.5 rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-30">
                      {label}
                    </div>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-2.5 border-t border-slate-800/80 bg-slate-900/70">
          <button
            type="button"
            onClick={() => setActive('config')}
            title={!isOpen ? 'Configuración del Sistema' : undefined}
            className={`group relative w-full flex items-center rounded-xl transition-all duration-200 ease-out cursor-pointer ${
              isOpen
                ? 'gap-3 px-3.5 py-2.5 text-xs font-semibold'
                : 'w-11 h-11 mx-auto justify-center'
            } ${
              active === 'config'
                ? 'bg-slate-800 text-white shadow-md shadow-slate-900/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                active === 'config' ? 'bg-white/10' : 'bg-slate-800 group-hover:bg-slate-700'
              }`}
            >
              <Settings
                size={18}
                className={`flex-shrink-0 ${
                  active === 'config' ? 'text-white' : 'text-slate-300 group-hover:text-white'
                }`}
              />
            </div>

            {isOpen && <span className="truncate">Configuración</span>}

            {!isOpen && (
              <div className="absolute left-14 bg-slate-900 text-white text-[11px] font-semibold py-1.5 px-2.5 rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-30">
                Configuración
              </div>
            )}
          </button>

          <div className="h-px bg-slate-700/80 my-2.5 mx-1" />

          {isOpen ? (
            <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-[11px] flex items-center justify-center shadow-sm">
                  {user?.avatarText || 'AD'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-900 bg-emerald-500" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {user?.name || 'Administrador'}
                </p>
                <p className="text-[10px] text-slate-400 truncate leading-none mt-0.5">
                  {user?.role || 'RRHH'}
                </p>
              </div>

              <button
                onClick={onLogout}
                title="Cerrar Sesión"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 pt-1">
              <div
                className="relative w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-[11px] flex items-center justify-center shadow-sm"
                title={user?.name || 'Administrador'}
              >
                {user?.avatarText || 'AD'}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-900 bg-emerald-500" />
              </div>

              <button
                onClick={onLogout}
                title="Cerrar Sesión"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
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
