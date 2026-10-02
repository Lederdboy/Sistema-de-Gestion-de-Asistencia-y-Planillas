import { useState } from 'react'
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
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
        email: email.includes('admin') ? 'carlos.mendoza@minera-andina.com' : 'patricia.vargas@minera-andina.com',
        originalEmail: email,
        role: email.includes('admin') ? 'Administrador General' : 'Especialista de Planillas',
        avatarText: email.includes('admin') ? 'CM' : 'PV',
      }
      onLogin(user, rememberMe)
    }, 450)
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
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#F8FAFC]">
      {/* Fondo abstracto con puntitos negros quietos */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.16) 1.2px, transparent 1.2px)',
          backgroundSize: '22px 22px',
        }}
      />

      {/* Tarjeta de Login Formal y Clásica (Estática, sin movimiento ni inclinación) */}
      <div className="relative w-full max-w-[440px] bg-white border border-slate-200/90 rounded-2xl shadow-[0_12px_36px_rgba(15,23,42,0.06)] p-7 sm:p-9 z-10">
        {/* Cabecera con Logo y Título */}
        <div className="flex flex-col items-center text-center mb-7">
          <img
            src="/logo.png"
            alt="Logo Planilla Enterprise"
            className="h-12 w-auto object-contain mb-3 drop-shadow-2xs"
          />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Planilla Enterprise
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Sistema de Gestión de Asistencia y Nómina
          </p>
        </div>

        {/* Mensaje de error si aplica */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700">
            <span className="h-2 w-2 rounded-full bg-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario de Inicio de Sesión */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Usuario o correo corporativo
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@empresa.com"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-3 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => alert('Para restablecer tu contraseña, contacta al área de TI o Administrador.')}
                className="text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
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
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-3 focus:ring-blue-100 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <label className="flex cursor-pointer items-center gap-2 select-none text-xs text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>Mantener sesión iniciada</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <span>Iniciar sesión</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Accesos de demostración rápidos */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="mb-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Accesos de Demostración
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="h-9 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-700 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center shadow-2xs"
            >
              Admin General
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('rrhh')}
              className="h-9 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-700 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center shadow-2xs"
            >
              Especialista RRHH
            </button>
          </div>
        </div>

        {/* Pie de seguridad formal */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <ShieldCheck size={13} className="text-slate-400 flex-shrink-0" />
          <span>Acceso seguro • Normativa SUNAT / PLAME / AFP Net</span>
        </div>
      </div>
    </div>
  )
}
