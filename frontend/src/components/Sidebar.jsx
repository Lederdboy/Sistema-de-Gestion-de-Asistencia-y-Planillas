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
  UserCog,
} from 'lucide-react'

const ALL_NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    roles: ['GERENTE_GENERAL', 'GERENTE_SEDE', 'CONTADOR', 'SUPERVISOR_RRHH'],
  },
  {
    id: 'personal',
    label: 'Personal',
    icon: Users,
    roles: ['GERENTE_GENERAL', 'GERENTE_SEDE', 'SUPERVISOR_RRHH'],
  },
  {
    id: 'tareo',
    label: 'Tareo Diario',
    icon: CalendarDays,
    roles: ['GERENTE_GENERAL', 'GERENTE_SEDE', 'SUPERVISOR_RRHH'],
  },
  {
    id: 'vacaciones',
    label: 'Vacaciones',
    icon: Palmtree,
    roles: ['GERENTE_GENERAL', 'GERENTE_SEDE', 'SUPERVISOR_RRHH'],
  },
  {
    id: 'planilla',
    label: 'Planilla',
    icon: FileSpreadsheet,
    roles: ['GERENTE_GENERAL', 'GERENTE_SEDE', 'CONTADOR'],
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: Printer,
    roles: ['GERENTE_GENERAL', 'GERENTE_SEDE', 'CONTADOR'],
  },
  {
    id: 'usuarios',
    label: 'Gestión de Usuarios',
    icon: UserCog,
    roles: ['GERENTE_GENERAL', 'GERENTE_SEDE'],
  },
]

const ROL_LABEL = {
  GERENTE_GENERAL: 'Gerente General',
  GERENTE_SEDE: 'Gerente de Sede',
  CONTADOR: 'Contador',
  SUPERVISOR_RRHH: 'Supervisor RRHH',
  TRABAJADOR: 'Trabajador',
}

export const NAV_ITEMS = ALL_NAV_ITEMS

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
      if (savedImage) setProfileImage(savedImage)
    }
  }, [user?.email])

  const navItems = ALL_NAV_ITEMS.filter((item) =>
    item.roles.includes(user?.rol)
  )

  const avatarText = user?.nombre
    ? user.nombre.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : 'U'

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-slate-950/98 text-slate-100 border-r border-slate-800/80 flex flex-col z-30 select-none transition-all duration-300 ease-in-out shadow-[0_22px_50px_rgba(15,23,42,0.22)] ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        {isOpen ? (
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80 bg-slate-950/80">
            <div
              onClick={() => setActive('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group min-w-0"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 shadow-lg shadow-blue-500/20">
                <img src="/logo.png" alt="Logo" className="h-5 w-auto object-contain drop-shadow-sm" />
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
              />
            </div>
            <button
              onClick={onToggle}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <PanelLeftOpen size={16} />
            </button>
          </div>
        )}

        {/* Nav items */}
        <div className="px-2.5 pt-3 pb-2 flex-1 overflow-y-auto">
          {isOpen && (
            <div className="mb-3 px-2 flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.16em]">Módulos</p>
              <span className="rounded-full bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">
                {navItems.length}
              </span>
            </div>
          )}

          <nav className="space-y-1.5">
            {navItems.map(({ id, label, icon: Icon }) => {
              const isActive = active === id
              return (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  title={!isOpen ? label : undefined}
                  className={`group relative w-full flex items-center rounded-xl transition-all duration-200 ease-out cursor-pointer ${
                    isOpen ? 'gap-3 px-3.5 py-2.5 text-xs' : 'w-11 h-11 mx-auto justify-center'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isActive ? 'bg-white/20' : 'bg-transparent group-hover:bg-slate-700'}`}>
                    <Icon
                      size={18}
                      className={`flex-shrink-0 transition-transform duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}
                      strokeWidth={isActive ? 2.2 : 1.9}
                    />
                  </div>
                  {isOpen && <span className="flex-1 truncate tracking-tight text-left">{label}</span>}
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

        {/* Footer */}
        <div className="p-2.5 border-t border-slate-800/80 bg-slate-900/70">
          {/* Config — solo GERENTE_GENERAL */}
          {user?.rol === 'GERENTE_GENERAL' && (
            <>
              <button
                type="button"
                onClick={() => setActive('config')}
                title={!isOpen ? 'Configuración del Sistema' : undefined}
                className={`group relative w-full flex items-center rounded-xl transition-all duration-200 ease-out cursor-pointer ${
                  isOpen ? 'gap-3 px-3.5 py-2.5 text-xs font-semibold' : 'w-11 h-11 mx-auto justify-center'
                } ${
                  active === 'config'
                    ? 'bg-slate-800 text-white shadow-md shadow-slate-900/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${active === 'config' ? 'bg-white/10' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                  <Settings size={18} className={`flex-shrink-0 ${active === 'config' ? 'text-white' : 'text-slate-300 group-hover:text-white'}`} />
                </div>
                {isOpen && <span className="truncate">Configuración</span>}
                {!isOpen && (
                  <div className="absolute left-14 bg-slate-900 text-white text-[11px] font-semibold py-1.5 px-2.5 rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-30">
                    Configuración
                  </div>
                )}
              </button>
              <div className="h-px bg-slate-700/80 my-2.5 mx-1" />
            </>
          )}

          {/* Perfil de usuario */}
          {isOpen ? (
            <div className="rounded-2xl border border-slate-700 bg-slate-800/80 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-2.5 py-2.5">
                <div className="relative flex-shrink-0">
                  {profileImage ? (
                    <img src={profileImage} alt="Perfil" className="w-9 h-9 rounded-full object-cover border border-slate-600" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-[11px] flex items-center justify-center shadow-sm">
                      {avatarText}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-900 bg-emerald-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate leading-tight">{user?.nombre || 'Usuario'}</p>
                  <p className="text-[10px] text-slate-400 truncate leading-none mt-0.5">
                    {ROL_LABEL[user?.rol] || user?.rol}
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

              {/* Botón editar perfil */}
              <button
                onClick={() => setActive('perfil')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold border-t border-slate-700 transition-colors cursor-pointer ${
                  active === 'perfil'
                    ? 'bg-blue-600/20 text-blue-300'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <UserCog size={13} />
                <span>Editar mi perfil</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 pt-1">
              <button
                onClick={() => setActive('perfil')}
                title="Editar mi perfil"
                className="relative w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-[11px] flex items-center justify-center shadow-sm"
              >
                {profileImage ? (
                  <img src={profileImage} alt="Perfil" className="w-full h-full rounded-full object-cover" />
                ) : (
                  avatarText
                )}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-900 bg-emerald-500" />
              </button>
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
