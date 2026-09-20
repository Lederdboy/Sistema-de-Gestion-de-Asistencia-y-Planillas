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
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width
    const py = (event.clientY - rect.top) / rect.height

    const rotateY = (px - 0.5) * 12
    const rotateX = (0.5 - py) * 12

    setTilt({ x: rotateX, y: rotateY })
  }

  const resetTilt = () => setTilt({ x: 0, y: 0 })

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
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#e0f2fe_0%,_#f8fafc_30%,_#e2e8f0_100%)] p-4 sm:p-6">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,116,144,0.08),rgba(15,23,42,0.04))]" />
      <div className="absolute -left-16 top-10 h-56 w-56 rounded-full bg-sky-300/20 blur-3xl" />
      <div className="absolute -right-10 bottom-10 h-64 w-64 rounded-full bg-indigo-300/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center [perspective:1800px]">
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={resetTilt}
          className="relative w-full overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/70 shadow-[0_30px_90px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-transform duration-300 ease-out will-change-transform"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-2px)`,
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative hidden overflow-hidden bg-slate-950 p-8 xl:p-10 lg:flex lg:flex-col lg:justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.3),transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.22),transparent_35%)]" />
              <div className="absolute inset-0 opacity-80 [background:linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.04)_40%,transparent_100%)]" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-200">
                  <ShieldCheck size={12} />
                  Plataforma segura
                </div>
              </div>

              <div className="relative z-10">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                    <img src="/logo.png" alt="Planilla Enterprise - Sistema de Gestión" className="h-8 w-auto object-contain" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Enterprise</p>
                    <h2 className="text-2xl font-bold text-white">Planilla</h2>
                  </div>
                </div>

                <h1 className="max-w-sm text-3xl font-bold leading-tight text-white">
                  Control inteligente de asistencia y planillas.
                </h1>
                <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
                  Centraliza la gestión del personal, tiempos, nómina y cumplimiento operativo con una experiencia moderna y confiable.
                </p>

                <div className="mt-8 space-y-4">
                  {[
                    'Seguimiento en tiempo real',
                    'Indicadores de productividad',
                    'Cumplimiento y seguridad',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm text-slate-200">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/30">
                        <Check size={12} className="text-emerald-300" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200 shadow-[0_20px_40px_rgba(15,23,42,0.2)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                  <ShieldCheck size={17} />
                </div>
                <div>
                  <p className="font-semibold text-white">Acceso seguro</p>
                  <p className="text-xs text-slate-300">Normativa SUNAT · PLAME · AFP Net</p>
                </div>
              </div>
            </div>

            <div className="relative z-10 bg-white/90 px-5 py-7 sm:px-8 sm:py-9">
              <div className="mb-7 flex items-center justify-between">
                <div className="lg:hidden">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                      <img src="/logo.png" alt="Planilla Enterprise - Sistema de Gestión" className="h-8 w-auto object-contain" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Enterprise</p>
                      <h2 className="text-lg font-bold text-slate-900">Planilla</h2>
                    </div>
                  </div>
                </div>

                <div className="ml-auto rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                  Online
                </div>
              </div>

              <div className="mb-7">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-sky-700">Bienvenido</p>
                <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-[2rem]">Iniciar sesión</h1>
                <p className="mt-2 text-sm text-slate-500">Accede a tu panel de gestión empresarial.</p>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span>{error}</span>
                </div>
              )}

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
                      placeholder="trabajador@empresa.com"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">Contraseña</label>
                    <button
                      type="button"
                      onClick={() => alert('Para restablecer tu contraseña, contacta al área de TI o Administrador.')}
                      className="text-[11px] font-medium text-sky-700 transition-colors hover:text-sky-800 hover:underline"
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
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-10 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex cursor-pointer items-center gap-2 select-none text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span>Mantener sesión iniciada</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-semibold text-white shadow-lg shadow-slate-300/40 transition-all duration-200 hover:bg-slate-800 active:translate-y-[1px] disabled:opacity-70"
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

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                  Accesos de demostración
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleDemoFill('admin')}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition-all hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                  >
                    Admin General
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoFill('rrhh')}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition-all hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                  >
                    Especialista RRHH
                  </button>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 border-t border-slate-100 pt-4 text-[11px] text-slate-400">
                <ShieldCheck size={13} className="text-slate-500" />
                <span>Acceso seguro • Normativa SUNAT / PLAME / AFP Net</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
