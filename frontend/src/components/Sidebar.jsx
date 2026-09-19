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
  ChevronLeft,
  ChevronRight,
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
  { id: 'perfil', label: 'Mi Perfil', shortLabel: 'Perfil', icon: User },
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

  // Cargar imagen de perfil desde localStorage
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
      className={`fixed left-0 top-0 h-screen bg-white/80 backdrop-blur-xl border-r border-slate-200/80 flex flex-col justify-between z-40 select-none transition-all duration-300 ease-in-out shadow-[0_20px_50px_rgba(15,23,42,0.08)] ${
        isMobile
          ? isOpen
            ? 'w-[84%] max-w-[280px] translate-x-0'
            : '-translate-x-full w-[84%] max-w-[280px]'
          : isOpen
            ? 'w-64'
            : 'w-16'
      }`}
    >
      <div>
        {isOpen ? (
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 bg-white/60">
            <div
              onClick={() => setActive('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group min-w-0"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 shadow-sm shadow-slate-300/40">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="h-5 w-auto object-contain"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-slate-900 tracking-tight leading-tight truncate">
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
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer flex-shrink-0"
            >
              <PanelLeftClose size={17} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-3 border-b border-slate-100 gap-2 bg-white/60">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 shadow-sm shadow-slate-300/40">
              <img
                src="/logo.png"
                alt="Logo"
                onClick={() => setActive('dashboard')}
                className="h-5 w-auto object-contain cursor-pointer transition-transform hover:scale-105"
                title="Planilla Enterprise"
              />
            </div>
            <button
              onClick={onToggle}
              title="Expandir menú lateral"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all cursor-pointer"
            >
              <PanelLeftOpen size={16} />
            </button>
          </div>
        )}

        <div className="p-2.5">
          {isOpen && (
            <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">
              Módulos
            </p>
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
                      ? 'bg-sky-50 text-sky-700 font-bold border border-sky-100 shadow-sm shadow-sky-100/60'
                      : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900 font-medium'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full bg-sky-600 shadow-sm shadow-sky-600/40" />
                  )}

                  <Icon
                    size={19}
                    className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                      isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                    strokeWidth={isActive ? 2.3 : 1.9}
                  />

                  {isOpen && (
                    <span className="truncate tracking-tight">{label}</span>
                  )}

                  {!isOpen && (
                    <div className="absolute left-14 bg-slate-900 text-white text-[11px] font-semibold py-1.5 px-2.5 rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {label}
                    </div>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      <div className="p-2.5 border-t border-slate-100 space-y-2 bg-white/60">
        <button
          onClick={() => setActive('config')}
          title={!isOpen ? 'Configuración del Sistema' : undefined}
          className={`group relative w-full flex items-center rounded-xl transition-all duration-200 ease-out cursor-pointer ${isOpen
              ? 'gap-3 px-3.5 py-2.5 text-xs font-semibold'
              : 'w-11 h-11 mx-auto justify-center'
            } ${active === 'config'
              ? 'bg-slate-900 text-white shadow-md shadow-slate-300/40'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
            }`}
        >
          <Settings
            size={19}
            className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${active === 'config' ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'}`}
          />
          {isOpen && <span className="truncate">Configuración</span>}

          {!isOpen && (
            <div className="absolute left-14 bg-slate-900 text-white text-[11px] font-semibold py-1.5 px-2.5 rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              Configuración
            </div>
          )}
        </button>

        <div className="h-px bg-slate-100 my-1 mx-2" />

        {isOpen ? (
          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-slate-50/80 border border-slate-100 shadow-sm">
            <button
              onClick={() => setActive('perfil')}
              title="Ver perfil"
              className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-md hover:bg-slate-800 transition-colors cursor-pointer overflow-hidden"
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.avatarText || 'AD'
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                {user?.name || 'Administrador'}
              </p>
              <p className="text-[10px] text-slate-400 truncate leading-none mt-0.5">
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
            <button
              onClick={() => setActive('perfil')}
              title="Ver perfil"
              className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-sm hover:bg-slate-800 transition-colors cursor-pointer overflow-hidden"
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.avatarText || 'AD'
              )}
            </button>
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
    </aside>
  )
}
