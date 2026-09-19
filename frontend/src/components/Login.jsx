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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_35%)]" />

      <div className="relative w-full max-w-[430px] bg-white border border-slate-200/80 rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.12)] p-8 sm:p-9 z-10">
        <div className="text-center mb-7">
          <div className="flex justify-center mb-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/20">
              <img
                src="/logo.png"
                alt="Logo Planilla Enterprise"
                className="h-9 w-auto object-contain drop-shadow-sm"
              />
            </div>
          </div>

          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Planilla Enterprise
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sistema de Gestión de Asistencia y Planillas
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2" role="alert">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Usuario o Correo Corporativo
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trabajador@empresa.com"
                className="w-full h-11 pl-10 pr-3 text-xs bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => alert('Para restablecer tu contraseña, contacta al área de TI o Administrador.')}
                className="text-[11px] text-blue-600 hover:text-blue-700 hover:underline transition"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-10 text-xs bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition cursor-pointer"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Mantener sesión iniciada</span>
            </label>

            <span className="text-[11px] text-slate-400">
              {loading ? 'Validando...' : 'Acceso seguro'}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
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

        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 font-medium text-center mb-2.5">
            Accesos de demostración:
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="py-2 px-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/80 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors text-center"
            >
              Admin General
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('rrhh')}
              className="py-2 px-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/80 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors text-center"
            >
              Especialista RRHH
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck size={13} className="text-slate-400" />
          <span>Acceso Seguro • Normativa SUNAT PLAME / AFP Net</span>
        </div>
      </div>
    </div>
  )
}
