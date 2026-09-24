import { useState, useEffect } from 'react'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Toast from './components/Toast'

// Vistas del panel izquierdo
import DashboardView from './components/views/DashboardView'
import PersonalView from './components/views/PersonalView'
import TareoView from './components/views/TareoView'
import VacacionesView from './components/views/VacacionesView'
import PlanillaView from './components/views/PlanillaView'
import ReportesView from './components/views/ReportesView'
import ConfigView from './components/views/ConfigView'
import PerfilView from './components/views/PerfilView'

import { INITIAL_WORKERS } from './data/mockData'
import { getTrabajadores, getSedes } from './services/api'

export default function App() {
  const [isMobile, setIsMobile] = useState(false)

  // Estado de Autenticación
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('planilla_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Estado del panel lateral (abierto por defecto con nombres)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Estado de navegación activa ('dashboard' | 'personal' | 'tareo' | 'planilla' | 'reportes' | 'config' | 'perfil')
  const [activeNav, setActiveNav] = useState('dashboard')

  // Datos globales de colaboradores y tareo (conectados a SistemaPlanillasDB)
  const [workers, setWorkers] = useState(INITIAL_WORKERS)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(() =>
    new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
  )

  // Boleta seleccionada para ver en reportes
  const [selectedBoleta, setSelectedBoleta] = useState(null)

  // Notificaciones Toast
  const [toast, setToast] = useState(null)

  // Sincronizar colaboradores directamente desde SistemaPlanillasDB
  const syncWithDatabase = async () => {
    try {
      const apiWorkers = await getTrabajadores()
      if (apiWorkers && apiWorkers.length > 0) {
        const enriched = apiWorkers.map((t) => {
          const matchExisting = INITIAL_WORKERS.find((w) => w.dni === t.numeroDocumento)
          return {
            id: t.id,
            dni: t.numeroDocumento,
            nombre: t.nombreCompleto || `${t.nombres} ${t.apellidoPaterno} ${t.apellidoMaterno}`,
            cargo: t.cargo,
            empresaId: String(t.empresaId || 1),
            sedeId: String(t.sedeId || 1),
            sueldoBase: Number(t.sueldoBasico) || 1500,
            afp: matchExisting ? matchExisting.afp : 'integra',
            asigFamiliar: matchExisting ? matchExisting.asigFamiliar : true,
            estado: matchExisting ? matchExisting.estado : 'Activo',
            fechaIngreso: t.fechaIngreso || '2023-01-15',
            regimen: 'D.L. 728',
            email: `${(t.nombres || 'colab').toLowerCase().split(' ')[0]}.${(t.apellidoPaterno || 'corp').toLowerCase()}@empresa.com`,
            telefono: matchExisting ? matchExisting.telefono : '984 123 456',
            tareo: matchExisting ? matchExisting.tareo : Array.from({ length: 30 }, (_, i) => i < 7 ? ((i + 1) % 7 === 0 || (i + 1) % 7 === 6 ? 'DL' : 'D') : null),
          }
        })
        setWorkers(enriched)
      }
    } catch (err) {
      console.warn('Usando datos de inicialización sincronizados:', err)
    }
  }

  useEffect(() => {
    syncWithDatabase()
  }, [])

  // Notificaciones Toast
  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 3500)
  }

  // Manejador de Login
  const handleLogin = (loggedUser, remember) => {
    setUser(loggedUser)
    if (remember) {
      localStorage.setItem('planilla_user', JSON.stringify(loggedUser))
    }
    showToast(`Bienvenido a Planilla Enterprise, ${loggedUser.name}`, 'success')
  }

  // Manejador de Logout
  const handleLogout = () => {
    localStorage.removeItem('planilla_user')
    setUser(null)
    showToast('Sesión cerrada correctamente.', 'info')
  }

  // Refrescar datos
  const handleRefresh = async () => {
    setRefreshing(true)
    setLoading(true)
    await syncWithDatabase()
    await new Promise((res) => setTimeout(res, 400))
    setLoading(false)
    setRefreshing(false)
    setLastUpdate(new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }))
    showToast('Datos de colaboradores y tareo sincronizados con SistemaPlanillasDB.', 'success')
  }

  // Actualizar asistencia en tareo
  const handleUpdateWorkerTareo = (workerId, dayIndex, newCode) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          const newTareo = [...(w.tareo || [])]
          newTareo[dayIndex] = newCode
          return { ...w, tareo: newTareo }
        }
        return w
      })
    )
  }

  // Actualizar colaborador existente
  const handleUpdateWorker = (updatedWorker) => {
    setWorkers((prev) => prev.map((w) => w.id === updatedWorker.id ? updatedWorker : w))
  }

  // Agregar nuevo colaborador
  const handleAddWorker = (newWorker) => {
    setWorkers((prev) => [newWorker, ...prev])
  }

  // Programar vacaciones y sincronizar con tareo
  const handleScheduleVacation = ({ workerId, fechaInicio, fechaFin, dias, isEnGoce }) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          const isCurrentMonth = fechaInicio.startsWith('2026-09')
          const startDay = parseInt(fechaInicio.split('-')[2], 10)
          const endDay = parseInt(fechaFin.split('-')[2], 10)

          let updatedTareo = [...(w.tareo || [])]
          if (isCurrentMonth && startDay && endDay) {
            for (let d = startDay - 1; d < Math.min(30, endDay); d++) {
              if (d >= 0) {
                updatedTareo[d] = 'V'
              }
            }
          }

          return {
            ...w,
            estado: isEnGoce ? 'Vacaciones' : w.estado,
            tareo: updatedTareo,
          }
        }
        return w
      })
    )
  }

  // Si no está autenticado, mostrar pantalla de Login
  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e0f2fe_0%,_#f8fafc_30%,_#e2e8f0_100%)] font-sans text-slate-900 overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(14,116,144,0.05),rgba(15,23,42,0.02))]" />
      <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-200/20 blur-3xl" />

      {isMobile && isSidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-[1px]"
        />
      )}

      {/* Barra Lateral Izquierda (Abierta con nombres por defecto, logo limpio sin caja) */}
      <Sidebar
        active={activeNav}
        setActive={setActiveNav}
        user={user}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        isMobile={isMobile}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Barra Superior Espaciosa y Organizada */}
      <TopBar
        activeNav={activeNav}
        lastUpdate={lastUpdate}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        user={user}
        isSidebarOpen={isSidebarOpen}
        isMobile={isMobile}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Contenido Principal a Ancho Completo (Sin espacio blanco sobrante a los costados) */}
      <main
        className={`relative min-h-screen pt-20 pb-8 transition-all duration-300 ${
          isMobile ? 'ml-0 px-3 sm:px-5' : 'px-3 sm:px-5 lg:px-6'
        } ${isMobile ? '' : isSidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}
      >
        <div className="mx-auto w-full max-w-[1700px]">
          {activeNav === 'dashboard' && (
            <DashboardView onNavigate={setActiveNav} workers={workers} />
          )}

          {activeNav === 'personal' && (
            <PersonalView
              workers={workers}
              onAddWorker={handleAddWorker}
              onUpdateWorker={handleUpdateWorker}
              showToast={showToast}
            />
          )}

          {activeNav === 'tareo' && (
            <TareoView
              workers={workers}
              onUpdateWorkerTareo={handleUpdateWorkerTareo}
              loading={loading}
              onNavigateToPlanilla={() => setActiveNav('planilla')}
              showToast={showToast}
            />
          )}

          {activeNav === 'vacaciones' && (
            <VacacionesView
              workers={workers}
              onScheduleVacation={handleScheduleVacation}
              showToast={showToast}
            />
          )}

          {activeNav === 'planilla' && (
            <PlanillaView
              workers={workers}
              onViewBoleta={(boleta) => {
                setSelectedBoleta(boleta)
                setActiveNav('reportes')
              }}
              showToast={showToast}
            />
          )}

          {activeNav === 'reportes' && (
            <ReportesView
              workers={workers}
              selectedBoleta={selectedBoleta}
              onCloseBoleta={() => setSelectedBoleta(null)}
              showToast={showToast}
            />
          )}

          {activeNav === 'config' && (
            <ConfigView showToast={showToast} />
          )}

          {activeNav === 'perfil' && (
            <PerfilView user={user} showToast={showToast} />
          )}
        </div>
      </main>

      {/* Notificaciones flotantes */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
