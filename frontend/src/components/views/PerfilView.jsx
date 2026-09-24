import { useState, useEffect, useRef } from 'react'
import { User, Mail, Building2, Shield, Edit, Save, Camera, Upload, X, KeyRound, Eye, EyeOff } from 'lucide-react'
import { uploadImageToBackend } from '../../services/api'
import { supabase } from '../../services/supabase'

const ROL_LABEL = {
  GERENTE_GENERAL: 'Gerente General',
  GERENTE_SEDE: 'Gerente de Sede',
  CONTADOR: 'Contador',
  SUPERVISOR_RRHH: 'Supervisor RRHH',
  TRABAJADOR: 'Trabajador',
}

export default function PerfilView({ user, showToast }) {
  const [isEditing, setIsEditing] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [sedeName, setSedeName] = useState('')
  const fileInputRef = useRef(null)

  const [profileData, setProfileData] = useState({
    telefono: '',
    cargo: user?.cargo || ROL_LABEL[user?.rol] || '',
  })

  useEffect(() => {
    if (user?.email) {
      const savedImage = localStorage.getItem(`profile_image_${user.email}`)
      if (savedImage) setProfileImage(savedImage)
      const savedExtra = localStorage.getItem(`perfil_extra_${user.email}`)
      if (savedExtra) {
        const extra = JSON.parse(savedExtra)
        setProfileData((prev) => ({ ...prev, ...extra }))
      }
    }
    if (user?.sedeId) {
      supabase.from('sedes').select('nombre').eq('id', user.sedeId).single()
        .then(({ data }) => { if (data) setSedeName(data.nombre) })
    }
  }, [user?.email, user?.sedeId])

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { showToast('Selecciona una imagen válida.', 'error'); return }
    if (file.size > 2 * 1024 * 1024) { showToast('La imagen no debe exceder 2MB.', 'error'); return }
    try {
      showToast('Subiendo imagen...', 'info')
      const url = await uploadImageToBackend(file)
      setProfileImage(url)
      localStorage.setItem(`profile_image_${user?.email}`, url)
      showToast('Imagen de perfil actualizada.', 'success')
    } catch {
      showToast('Error al subir imagen.', 'error')
    }
  }

  const handleRemoveImage = () => {
    setProfileImage(null)
    localStorage.removeItem(`profile_image_${user?.email}`)
    showToast('Imagen eliminada.', 'info')
  }

  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ nueva: '', confirmar: '' })
  const [showNueva, setShowNueva] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordForm.nueva.length < 8) { showToast('La contraseña debe tener al menos 8 caracteres.', 'error'); return }
    if (passwordForm.nueva !== passwordForm.confirmar) { showToast('Las contraseñas no coinciden.', 'error'); return }
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: passwordForm.nueva })
    setSavingPassword(false)
    if (error) { showToast('Error al cambiar contraseña.', 'error'); return }
    showToast('Contraseña actualizada correctamente.', 'success')
    setPasswordForm({ nueva: '', confirmar: '' })
    setShowPasswordSection(false)
  }
    e.preventDefault()
    localStorage.setItem(`perfil_extra_${user?.email}`, JSON.stringify(profileData))
    setIsEditing(false)
    showToast('Perfil actualizado.', 'success')
  }

  const avatarText = user?.nombre
    ? user.nombre.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : 'U'

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User size={16} className="text-blue-600" />
            Mi Perfil
          </h2>
          <p className="text-xs text-slate-500">Información personal y profesional</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Edit size={14} />
            Editar Perfil
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(false)} className="h-9 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer">
              Cancelar
            </button>
            <button onClick={handleSave} className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
              <Save size={14} />
              Guardar
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar + Contacto */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex flex-col items-center p-4 border border-slate-200 rounded-lg bg-slate-50/50">
              <div className="relative">
                {profileImage ? (
                  <img src={profileImage} alt="Perfil" className="w-24 h-24 rounded-full object-cover shadow-lg border-2 border-slate-200" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-slate-900 text-white font-bold text-3xl flex items-center justify-center shadow-lg">
                    {avatarText}
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                {isEditing && (
                  <div className="absolute bottom-0 right-0 flex gap-1">
                    <button onClick={() => fileInputRef.current?.click()} className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md cursor-pointer">
                      <Camera size={14} />
                    </button>
                    {profileImage && (
                      <button onClick={handleRemoveImage} className="w-8 h-8 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-md cursor-pointer">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">{user?.nombre}</h3>
              <span className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {ROL_LABEL[user?.rol] || user?.rol}
              </span>
              {!isEditing && !profileImage && (
                <button onClick={() => fileInputRef.current?.click()} className="mt-2 text-[10px] text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer">
                  <Upload size={10} />
                  Agregar foto
                </button>
              )}
            </div>

            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <Mail size={14} className="text-blue-600" />
                Contacto
              </h4>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Email</label>
                <p className="text-xs text-slate-700">{user?.email}</p>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Teléfono</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.telefono}
                    onChange={(e) => setProfileData({ ...profileData, telefono: e.target.value })}
                    className="w-full h-8 px-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                ) : (
                  <p className="text-xs text-slate-700">{profileData.telefono || '—'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Info laboral + sistema */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2 mb-3">
                <Building2 size={14} className="text-blue-600" />
                Información Laboral
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Cargo</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.cargo}
                      onChange={(e) => setProfileData({ ...profileData, cargo: e.target.value })}
                      className="w-full h-8 px-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-xs text-slate-700">{profileData.cargo || '—'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Sede</label>
                  <p className="text-xs text-slate-700">{sedeName || (user?.sedeId ? `Sede #${user.sedeId}` : 'Todas las sedes')}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2 mb-3">
                <Shield size={14} className="text-blue-600" />
                Información del Sistema
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Rol</label>
                  <p className="text-xs text-slate-700">{ROL_LABEL[user?.rol] || user?.rol}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Estado</label>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Activo</span>
                </div>
              </div>
            </div>

            {/* Cambio de contraseña */}
            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <KeyRound size={14} className="text-blue-600" />
                  Seguridad
                </h4>
                <button
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  {showPasswordSection ? 'Cancelar' : 'Cambiar contraseña'}
                </button>
              </div>
              {!showPasswordSection ? (
                <p className="text-xs text-slate-500">Tu contraseña fue actualizada recientemente. Manténla segura.</p>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Nueva contraseña</label>
                    <div className="relative">
                      <input
                        type={showNueva ? 'text' : 'password'}
                        value={passwordForm.nueva}
                        onChange={(e) => setPasswordForm({ ...passwordForm, nueva: e.target.value })}
                        placeholder="Mínimo 8 caracteres"
                        className="w-full h-9 px-3 pr-9 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                      <button type="button" onClick={() => setShowNueva(!showNueva)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                        {showNueva ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Confirmar contraseña</label>
                    <div className="relative">
                      <input
                        type={showConfirmar ? 'text' : 'password'}
                        value={passwordForm.confirmar}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmar: e.target.value })}
                        placeholder="Repite la contraseña"
                        className="w-full h-9 px-3 pr-9 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                      <button type="button" onClick={() => setShowConfirmar(!showConfirmar)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                        {showConfirmar ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={savingPassword}
                    className="h-9 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-xs font-semibold cursor-pointer">
                    {savingPassword ? 'Guardando...' : 'Actualizar contraseña'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
