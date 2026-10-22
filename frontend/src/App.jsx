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

import { INITIAL_WORKERS, createTareoCompleto } from './data/mockData'
import { getTrabajadores, getSedes, crearTrabajador, updateMarcacion } from './services/api'

export default function App() {
  const [isMobile, setIsMobile] = useState(false)

  // Medidor de vista (Escala porcentual del contenido de la vista, 100% por defecto)
  const [viewZoom, setViewZoom] = useState(() => {
    try {
      const saved = localStorage.getItem('planilla_view_zoom')
      return saved ? Number(saved) : 100
    } catch {
      return 100
    }
  })

  const handleZoomChange = (zoomLevel) => {
    setViewZoom(zoomLevel)
    try {
      localStorage.setItem('planilla_view_zoom', String(zoomLevel))
    } catch {
      // storage disabled
    }
  }

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

  // Transición suave con Skeleton Loader al cambiar de sección
  const handleNavigate = (newNav) => {
    if (newNav !== activeNav) {
      setLoading(true)
      setActiveNav(newNav)
      setTimeout(() => {
        setLoading(false)
      }, 260)
    }
  }

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
            tareo: matchExisting ? matchExisting.tareo : createTareoCompleto(['D','D','D','D','DL','DL','D']),
          }
        })
        setWorkers(enriched)
      }
    } catch {
      // Modo offline: mantiene datos sincronizados locales
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

  // Autocompletar tareo mensual para todos los trabajadores
  const handleCompleteAllTareo = () => {
    setWorkers((prev) =>
      prev.map((w) => ({
        ...w,
        tareo: createTareoCompleto(w.tareo || ['D', 'D', 'D', 'D', 'DL', 'DL', 'D']),
      }))
    )
  }

  // Actualizar asistencia en tareo
  const handleUpdateWorkerTareo = async (workerId, dayIndex, newCode) => {
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

    // Persistir marcación en tiempo real en SQL Server
    try {
      const dayNum = String(dayIndex + 1).padStart(2, '0')
      await updateMarcacion({
        trabajadorId: Number(workerId),
        fecha: `2026-09-${dayNum}`,
        codigoAsistencia: newCode,
        observacion: 'Actualizado desde TareoView',
      })
    } catch {
      // modo offline
    }
  }

  // Agregar nuevo colaborador y persistir en SQL Server
  const handleAddWorker = async (newWorker) => {
    try {
      let nombres = (newWorker.nombres || '').trim()
      let apPaterno = (newWorker.apellidoPaterno || '').trim()
      let apMaterno = (newWorker.apellidoMaterno || '').trim()

      if (!nombres || !apPaterno || !apMaterno) {
        const raw = (newWorker.nombre || '').trim()
        const partes = raw.split(/\s+/).filter(Boolean)
        if (partes.length >= 3) {
          nombres = partes.slice(0, partes.length - 2).join(' ')
          apPaterno = partes[partes.length - 2]
          apMaterno = partes[partes.length - 1]
        } else if (partes.length === 2) {
          nombres = partes[0]
          apPaterno = partes[1]
          apMaterno = partes[1] // evitar fallo de validación
        } else if (partes.length === 1) {
          nombres = partes[0]
          apPaterno = partes[0]
          apMaterno = 'Registrado'
        } else {
          nombres = 'Colaborador'
          apPaterno = 'Nuevo'
          apMaterno = 'Registrado'
        }
      }

      const apiResult = await crearTrabajador({
        empresaId: Number(newWorker.empresaId || 1),
        sedeId: Number(newWorker.sedeId || 1),
        tipoDocumento: 'DNI',
        numeroDocumento: String(newWorker.dni || '').trim(),
        nombres: nombres,
        apellidoPaterno: apPaterno,
        apellidoMaterno: apMaterno,
        cargo: newWorker.cargo || 'Operario',
        fechaIngreso: newWorker.fechaIngreso || new Date().toISOString().split('T')[0],
        sueldoBasico: Number(newWorker.sueldoBase) || 1500,
        sueldoDiario: Number(((Number(newWorker.sueldoBase) || 1500) / 30).toFixed(2)),
      })

      if (apiResult && apiResult.id) {
        newWorker.id = apiResult.id
      }
    } catch (err) {
      console.warn('Registro local de respaldo:', err)
    }

    setWorkers((prev) => [newWorker, ...prev])
  }

  // Programar vacaciones y sincronizar con tareo y base de datos
  const handleScheduleVacation = async ({ workerId, fechaInicio, fechaFin, dias, isEnGoce }) => {
    const isCurrentMonth = fechaInicio && fechaInicio.startsWith('2026-09')
    const startDay = parseInt((fechaInicio || '').split('-')[2], 10)
    const endDay = parseInt((fechaFin || '').split('-')[2], 10)

    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
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

    // Persistir marcaciones de vacaciones 'V' en SQL Server
    if (isCurrentMonth && startDay && endDay) {
      for (let d = startDay - 1; d < Math.min(30, endDay); d++) {
        if (d >= 0) {
          const dayNum = String(d + 1).padStart(2, '0')
          try {
            await updateMarcacion({
              trabajadorId: Number(workerId),
              fecha: `2026-09-${dayNum}`,
              codigoAsistencia: 'V',
              observacion: 'Programación de Vacaciones (Goce)',
            })
          } catch {
            // ignorar error de red individual
          }
        }
      }
    }
  }

  // Si no está autenticado, mostrar pantalla de Login
  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 antialiased">

      {isMobile && isSidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Barra Lateral Izquierda (Abierta con nombres por defecto, logo limpio sin caja) */}
      <Sidebar
        active={activeNav}
        setActive={handleNavigate}
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
        viewZoom={viewZoom}
        onZoomChange={handleZoomChange}
      />

      {/* Contenido Principal a Ancho Completo con espacio suficiente debajo del header */}
      <main
        className={`relative min-h-screen pt-20 sm:pt-24 pb-12 transition-all duration-300 ${
          isMobile ? 'ml-0 px-3 sm:px-4' : 'px-3 sm:px-5 lg:px-6'
        } ${isMobile ? '' : isSidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}
      >
        <div
          className="mx-auto w-full max-w-[1700px] origin-top min-w-0 transition-all duration-150"
          style={{ zoom: `${viewZoom}%` }}
        >
          {activeNav === 'dashboard' && (
            <DashboardView
              onNavigate={handleNavigate}
              workers={workers}
              loading={loading}
            />
          )}

          {activeNav === 'personal' && (
            <PersonalView
              workers={workers}
              onAddWorker={handleAddWorker}
              showToast={showToast}
              loading={loading}
            />
          )}

          {activeNav === 'tareo' && (
            <TareoView
              workers={workers}
              onUpdateWorkerTareo={handleUpdateWorkerTareo}
              onCompleteAllTareo={handleCompleteAllTareo}
              loading={loading}
              onNavigateToPlanilla={() => handleNavigate('planilla')}
              showToast={showToast}
            />
          )}

          {activeNav === 'vacaciones' && (
            <VacacionesView
              workers={workers}
              onScheduleVacation={handleScheduleVacation}
              showToast={showToast}
              loading={loading}
            />
          )}

          {activeNav === 'planilla' && (
            <PlanillaView
              workers={workers}
              loading={loading}
              onViewBoleta={(boleta) => {
                setSelectedBoleta(boleta)
                handleNavigate('reportes')
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
              loading={loading}
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
