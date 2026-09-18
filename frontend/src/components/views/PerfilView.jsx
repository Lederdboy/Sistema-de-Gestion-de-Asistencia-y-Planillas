import { useState } from 'react'
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  Shield,
  Edit,
  Save,
  Camera,
} from 'lucide-react'

export default function PerfilView({ user, showToast }) {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    nombre: user?.name || 'Carlos Mendoza',
    email: user?.email || 'carlos.mendoza@minera-andina.com',
    telefono: '+51 987 654 321',
    cargo: user?.role || 'Administrador General',
    departamento: 'Gerencia General',
    sede: 'Sede Principal - Lima',
    fechaIngreso: '15/03/2018',
    avatarText: user?.avatarText || 'CM',
  })

  const handleSave = (e) => {
    e.preventDefault()
    setIsEditing(false)
    showToast('Perfil actualizado exitosamente.', 'success')
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset to original values
    setProfileData({
      nombre: user?.name || 'Carlos Mendoza',
      email: user?.email || 'carlos.mendoza@minera-andina.com',
      telefono: '+51 987 654 321',
      cargo: user?.role || 'Administrador General',
      departamento: 'Gerencia General',
      sede: 'Sede Principal - Lima',
      fechaIngreso: '15/03/2018',
      avatarText: user?.avatarText || 'CM',
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User size={16} className="text-blue-600" />
            Mi Perfil
          </h2>
          <p className="text-xs text-slate-500">
            Información personal y profesional del usuario
          </p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <Edit size={14} />
            <span>Editar Perfil</span>
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="h-9 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Cancelar</span>
            </button>
            <button
              onClick={handleSave}
              className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20 cursor-pointer"
            >
              <Save size={14} />
              <span>Guardar</span>
            </button>
          </div>
        )}
      </div>

      {/* Contenido Principal */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda: Avatar e Información Básica */}
          <div className="lg:col-span-1 space-y-4">
            {/* Avatar */}
            <div className="flex flex-col items-center p-4 border border-slate-200 rounded-lg bg-slate-50/50">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-slate-900 text-white font-bold text-3xl flex items-center justify-center shadow-lg">
                  {profileData.avatarText}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors cursor-pointer">
                    <Camera size={14} />
                  </button>
                )}
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">{profileData.nombre}</h3>
              <p className="text-xs text-slate-500">{profileData.cargo}</p>
            </div>

            {/* Información de Contacto */}
            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <Mail size={14} className="text-blue-600" />
                Información de Contacto
              </h4>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full h-8 px-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-xs text-slate-700">{profileData.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                    Teléfono
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.telefono}
                      onChange={(e) => setProfileData({ ...profileData, telefono: e.target.value })}
                      className="w-full h-8 px-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-xs text-slate-700">{profileData.telefono}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Información Laboral */}
          <div className="lg:col-span-2 space-y-4">
            {/* Información Laboral */}
            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2 mb-3">
                <Building2 size={14} className="text-blue-600" />
                Información Laboral
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                    Cargo
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.cargo}
                      onChange={(e) => setProfileData({ ...profileData, cargo: e.target.value })}
                      className="w-full h-8 px-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-xs text-slate-700">{profileData.cargo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                    Departamento
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.departamento}
                      onChange={(e) => setProfileData({ ...profileData, departamento: e.target.value })}
                      className="w-full h-8 px-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-xs text-slate-700">{profileData.departamento}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                    Sede
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.sede}
                      onChange={(e) => setProfileData({ ...profileData, sede: e.target.value })}
                      className="w-full h-8 px-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-xs text-slate-700">{profileData.sede}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                    Fecha de Ingreso
                  </label>
                  <p className="text-xs text-slate-700">{profileData.fechaIngreso}</p>
                </div>
              </div>
            </div>

            {/* Información del Sistema */}
            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2 mb-3">
                <Shield size={14} className="text-blue-600" />
                Información del Sistema
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                    Rol en el Sistema
                  </label>
                  <p className="text-xs text-slate-700">{profileData.cargo}</p>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                    Estado de la Cuenta
                  </label>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Activo
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                    Último Acceso
                  </label>
                  <p className="text-xs text-slate-700">Hoy, 09:32 AM</p>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                    Antigüedad en la Empresa
                  </label>
                  <p className="text-xs text-slate-700">6 años, 5 meses</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}