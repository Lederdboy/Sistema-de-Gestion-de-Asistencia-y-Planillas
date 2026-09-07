import { useState } from 'react'
import {
  Settings,
  Building2,
  Percent,
  Sliders,
  Save,
  CheckCircle2,
  MapPin,
  Clock,
  Shield,
} from 'lucide-react'
import { EMPRESAS, SEDES, AFPS, PARAMETROS_LABORALES } from '../../data/mockData'

export default function ConfigView({ showToast }) {
  const [activeTab, setActiveTab] = useState('empresa')
  const [empresaData, setEmpresaData] = useState({
    nombre: 'Minera Andina S.A.',
    ruc: '20489123891',
    direccion: 'Av. Las Camelias 450, San Isidro, Lima',
    representante: 'Carlos A. Mendoza Ríos',
    actividadEconomica: 'Extracción de minerales metalíferos',
  })

  const [laboralData, setLaboralData] = useState({
    rmv: PARAMETROS_LABORALES.rmv,
    asigFamiliar: PARAMETROS_LABORALES.asigFamiliar,
    essalud: 9,
    sctr: 1.5,
    uit: PARAMETROS_LABORALES.uit,
    jornadaHoras: 8,
  })

  const handleSave = (e) => {
    e.preventDefault()
    showToast('Configuración guardada exitosamente.', 'success')
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Settings size={16} className="text-blue-600" />
            Configuración del Sistema y Parámetros Laborales
          </h2>
          <p className="text-xs text-slate-500">
            Ajuste de tasas impositivas, datos fiscales de la empresa y tablas de comisiones previsionales
          </p>
        </div>

        <button
          onClick={handleSave}
          className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20 cursor-pointer"
        >
          <Save size={14} />
          <span>Guardar Cambios</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 bg-white px-4 rounded-t-lg pt-2 border-t border-x">
        {[
          { id: 'empresa', label: 'Datos de la Empresa', icon: Building2 },
          { id: 'laboral', label: 'Parámetros de Ley', icon: Sliders },
          { id: 'afps', label: 'Comisiones AFP / ONP', icon: Percent },
          { id: 'sedes', label: 'Sedes y Turnos', icon: MapPin },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Icon size={14} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Contenido de Tabs */}
      <div className="bg-white border border-slate-200 rounded-b-lg p-5 shadow-xs">
        
        {/* Tab 1: Empresa */}
        {activeTab === 'empresa' && (
          <form onSubmit={handleSave} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Razón Social *
                </label>
                <input
                  type="text"
                  value={empresaData.nombre}
                  onChange={(e) => setEmpresaData({ ...empresaData, nombre: e.target.value })}
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  RUC (11 dígitos) *
                </label>
                <input
                  type="text"
                  value={empresaData.ruc}
                  onChange={(e) => setEmpresaData({ ...empresaData, ruc: e.target.value })}
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dirección Fiscal Principal
              </label>
              <input
                type="text"
                value={empresaData.direccion}
                onChange={(e) => setEmpresaData({ ...empresaData, direccion: e.target.value })}
                className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Representante Legal
                </label>
                <input
                  type="text"
                  value={empresaData.representante}
                  onChange={(e) => setEmpresaData({ ...empresaData, representante: e.target.value })}
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Actividad Económica (CIIU)
                </label>
                <input
                  type="text"
                  value={empresaData.actividadEconomica}
                  onChange={(e) => setEmpresaData({ ...empresaData, actividadEconomica: e.target.value })}
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </form>
        )}

        {/* Tab 2: Parámetros de Ley */}
        {activeTab === 'laboral' && (
          <form onSubmit={handleSave} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Remuneración Mínima Vital (RMV)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">S/</span>
                  <input
                    type="number"
                    step="0.01"
                    value={laboralData.rmv}
                    onChange={(e) => setLaboralData({ ...laboralData, rmv: parseFloat(e.target.value) })}
                    className="w-full h-9 pl-8 pr-3 text-xs border border-slate-200 rounded-lg font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">D.S. N° 003-2022-TR vigente en Perú</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Asignación Familiar (10% de la RMV)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">S/</span>
                  <input
                    type="number"
                    step="0.01"
                    value={laboralData.asigFamiliar}
                    onChange={(e) => setLaboralData({ ...laboralData, asigFamiliar: parseFloat(e.target.value) })}
                    className="w-full h-9 pl-8 pr-3 text-xs border border-slate-200 rounded-lg font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Ley N° 25129 para trabajadores con hijos</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tasa Aporte EsSalud (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={laboralData.essalud}
                  onChange={(e) => setLaboralData({ ...laboralData, essalud: parseFloat(e.target.value) })}
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Porcentaje a cargo del empleador (9.0%)</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valor de la UIT Vigente (S/)
                </label>
                <input
                  type="number"
                  step="1"
                  value={laboralData.uit}
                  onChange={(e) => setLaboralData({ ...laboralData, uit: parseFloat(e.target.value) })}
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Utilizado para deducción de 5ta categoría (7 UIT)</p>
              </div>
            </div>
          </form>
        )}

        {/* Tab 3: Comisiones AFP / ONP */}
        {activeTab === 'afps' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Tablas de comisiones y primas de seguro vigentes de la Superintendencia de Banca y Seguros (SBS):
            </p>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Administradora de Pensión</th>
                    <th className="px-3 py-2.5 text-right">Aporte Obligatorio</th>
                    <th className="px-3 py-2.5 text-right">Comisión Flujo</th>
                    <th className="px-3 py-2.5 text-right">Prima de Seguro</th>
                    <th className="px-3 py-2.5 text-right font-bold text-blue-900">Total Retención</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {AFPS.map((a) => {
                    const totalPct = (a.aporte + a.comision + a.prima) * 100
                    return (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-bold text-slate-800">{a.nombre}</td>
                        <td className="px-3 py-2.5 text-right font-mono">{(a.aporte * 100).toFixed(2)}%</td>
                        <td className="px-3 py-2.5 text-right font-mono">{(a.comision * 100).toFixed(2)}%</td>
                        <td className="px-3 py-2.5 text-right font-mono">{(a.prima * 100).toFixed(2)}%</td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-blue-800 bg-blue-50/40">
                          {totalPct.toFixed(2)}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Sedes */}
        {activeTab === 'sedes' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Sedes operativas configuradas para tareo:</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SEDES.map((s) => {
                const emp = EMPRESAS.find((e) => e.id === s.empresaId)
                return (
                  <div key={s.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{s.nombre}</h4>
                      <p className="text-[11px] text-slate-500">{emp?.nombre}</p>
                      <span className="text-[10px] text-slate-400 font-medium">Ciudad: {s.ciudad}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Activa
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
