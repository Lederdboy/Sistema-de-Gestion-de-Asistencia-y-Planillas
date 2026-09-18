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

import { INITIAL_WORKERS } from './data/mockData'
import { getTrabajadores, getSedes } from './services/api'

export default function App() {
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

  // Estado de navegación activa ('dashboard' | 'personal' | 'tareo' | 'planilla' | 'reportes' | 'config')
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
    <div className="min-h-screen bg-slate-200/80 font-sans text-slate-900 overflow-x-hidden">
      {/* Barra Lateral Izquierda (Abierta con nombres por defecto, logo limpio sin caja) */}
      <Sidebar
        active={activeNav}
        setActive={setActiveNav}
        user={user}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
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
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Contenido Principal a Ancho Completo (Sin espacio blanco sobrante a los costados) */}
      <main
        className={`transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-16'
        } pt-20 px-6 pb-8 w-auto min-h-screen`}
      >
        <div className="w-full">
          {activeNav === 'dashboard' && (
            <DashboardView onNavigate={setActiveNav} workers={workers} />
          )}

          {activeNav === 'personal' && (
            <PersonalView
              workers={workers}
              onAddWorker={handleAddWorker}
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
        </div>
      </main>

      {/* Notificaciones flotantes */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
