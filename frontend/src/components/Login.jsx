import { useState } from 'react'
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@empresa.com')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Por favor ingresa tu usuario y contraseña.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const user = {
        name: email.includes('admin') ? 'Carlos Mendoza (Admin)' : 'Patricia Vargas (RRHH)',
        email,
        role: email.includes('admin') ? 'Administrador General' : 'Especialista de Planillas',
        avatarText: email.includes('admin') ? 'CM' : 'PV',
      }
      onLogin(user, rememberMe)
    }, 500)
  }

  const handleDemoFill = (role) => {
    if (role === 'admin') {
      setEmail('admin@empresa.com')
      setPassword('admin123')
    } else {
      setEmail('rrhh@empresa.com')
      setPassword('rrhh123')
    }
    setError('')
  }

  return (
    <div className="min-h-screen bg-dot-grid flex items-center justify-center p-4 font-sans relative">
      {/* Tarjeta de Inicio de Sesión Limpia y Profesional */}
      <div className="w-full max-w-[430px] bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-300/30 p-8 sm:p-9 relative z-10">
        
        {/* Header con Logo Oficial Centrado */}
        <div className="text-center mb-7">
          <div className="flex justify-center mb-3">
            <img
              src="/logo.png"
              alt="Logo Planilla Enterprise"
              className="h-16 w-auto object-contain transition-transform hover:scale-105 duration-200"
            />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Planilla Enterprise
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sistema de Gestión de Asistencia y Planillas
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Correo o Usuario */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Usuario o Correo Corporativo
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@empresa.com"
                className="w-full h-10 pl-10 pr-3 text-xs bg-slate-50/50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => alert('Para restablecer tu contraseña, contacta al área de TI o Administrador.')}
                className="text-[11px] text-blue-600 hover:text-blue-700 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 pl-10 pr-9 text-xs bg-slate-50/50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Recordar sesión */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Mantener sesión iniciada</span>
            </label>
          </div>

          {/* Botón de Ingreso Principal */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Iniciar Sesión</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Accesos Rápidos de Prueba (Discretos y Limpios) */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 font-medium text-center mb-2.5">
            Accesos de demostración:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="py-1.5 px-2.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors text-center"
            >
              Admin General
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('rrhh')}
              className="py-1.5 px-2.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors text-center"
            >
              Especialista RRHH
            </button>
          </div>
        </div>

        {/* Pie de Página de Seguridad */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck size={13} className="text-slate-400" />
          <span>Acceso Seguro • Normativa SUNAT PLAME / AFP Net</span>
        </div>

      </div>
    </div>
  )
}
