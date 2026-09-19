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
    <div className="space-y-5">
      <div className="rounded-[28px] border border-slate-200/80 bg-white/85 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 shadow-inner shadow-sky-200/80">
              <Settings size={18} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">Configuración</p>
              <h2 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
                Sistema y parámetros laborales
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Ajuste de tasas impositivas, datos fiscales de la empresa y tablas de comisiones previsionales.
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white shadow-[0_12px_25px_rgba(14,165,233,0.28)] transition-all hover:bg-sky-700"
          >
            <Save size={14} />
            Guardar cambios
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white/80 shadow-[0_18px_40px_rgba(15,23,42,0.04)] backdrop-blur-xl">
        <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50/70 p-3 sm:p-4">
          {[
            { id: 'empresa', label: 'Datos de la Empresa', icon: Building2 },
            { id: 'laboral', label: 'Parámetros de Ley', icon: Sliders },
            { id: 'afps', label: 'Comisiones AFP / ONP', icon: Percent },
            { id: 'sedes', label: 'Sedes y Turnos', icon: MapPin },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                activeTab === id
                  ? 'border-sky-200 bg-sky-100 text-sky-700 shadow-sm'
                  : 'border-transparent bg-transparent text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-700'
              }`}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-5">
          {activeTab === 'empresa' && (
            <form onSubmit={handleSave} className="max-w-3xl space-y-4">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Datos institucionales</h3>
                    <p className="text-[11px] text-slate-500">Información fiscal y corporativa</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                      Razón Social *
                    </label>
                    <input
                      type="text"
                      value={empresaData.nombre}
                      onChange={(e) => setEmpresaData({ ...empresaData, nombre: e.target.value })}
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                      RUC (11 dígitos) *
                    </label>
                    <input
                      type="text"
                      value={empresaData.ruc}
                      onChange={(e) => setEmpresaData({ ...empresaData, ruc: e.target.value })}
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-xs font-mono text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                    Dirección Fiscal Principal
                  </label>
                  <input
                    type="text"
                    value={empresaData.direccion}
                    onChange={(e) => setEmpresaData({ ...empresaData, direccion: e.target.value })}
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                      Representante Legal
                    </label>
                    <input
                      type="text"
                      value={empresaData.representante}
                      onChange={(e) => setEmpresaData({ ...empresaData, representante: e.target.value })}
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                      Actividad Económica (CIIU)
                    </label>
                    <input
                      type="text"
                      value={empresaData.actividadEconomica}
                      onChange={(e) => setEmpresaData({ ...empresaData, actividadEconomica: e.target.value })}
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    />
                  </div>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'laboral' && (
            <form onSubmit={handleSave} className="max-w-3xl space-y-4">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Sliders size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Parámetros legales</h3>
                    <p className="text-[11px] text-slate-500">Valores vigentes para planillas y cotizaciones</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                      Remuneración Mínima Vital (RMV)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">S/</span>
                      <input
                        type="number"
                        step="0.01"
                        value={laboralData.rmv}
                        onChange={(e) => setLaboralData({ ...laboralData, rmv: parseFloat(e.target.value) })}
                        className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-mono text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">D.S. N° 003-2022-TR vigente en Perú</p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                      Asignación Familiar (10% de la RMV)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">S/</span>
                      <input
                        type="number"
                        step="0.01"
                        value={laboralData.asigFamiliar}
                        onChange={(e) => setLaboralData({ ...laboralData, asigFamiliar: parseFloat(e.target.value) })}
                        className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-mono text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">Ley N° 25129 para trabajadores con hijos</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                      Tasa Aporte EsSalud (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={laboralData.essalud}
                      onChange={(e) => setLaboralData({ ...laboralData, essalud: parseFloat(e.target.value) })}
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-xs font-mono text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    />
                    <p className="mt-1 text-[10px] text-slate-400">Porcentaje a cargo del empleador (9.0%)</p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                      Valor de la UIT Vigente (S/)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={laboralData.uit}
                      onChange={(e) => setLaboralData({ ...laboralData, uit: parseFloat(e.target.value) })}
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-xs font-mono text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    />
                    <p className="mt-1 text-[10px] text-slate-400">Utilizado para deducción de 5ta categoría (7 UIT)</p>
                  </div>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'afps' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Percent size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Comisiones AFP / ONP</h3>
                  <p className="text-[11px] text-slate-500">Tablas vigentes de la SBS</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                      <tr>
                        <th className="px-4 py-3">Administradora de Pensión</th>
                        <th className="px-3 py-3 text-right">Aporte</th>
                        <th className="px-3 py-3 text-right">Comisión</th>
                        <th className="px-3 py-3 text-right">Prima</th>
                        <th className="px-3 py-3 text-right text-sky-700">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {AFPS.map((a) => {
                        const totalPct = (a.aporte + a.comision + a.prima) * 100
                        return (
                          <tr key={a.id} className="transition-colors hover:bg-slate-50">
                            <td className="px-4 py-3 font-bold text-slate-800">{a.nombre}</td>
                            <td className="px-3 py-3 text-right font-mono">{(a.aporte * 100).toFixed(2)}%</td>
                            <td className="px-3 py-3 text-right font-mono">{(a.comision * 100).toFixed(2)}%</td>
                            <td className="px-3 py-3 text-right font-mono">{(a.prima * 100).toFixed(2)}%</td>
                            <td className="bg-sky-50/60 px-3 py-3 text-right font-mono font-bold text-sky-800">
                              {totalPct.toFixed(2)}%
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sedes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Sedes operativas</h3>
                    <p className="text-[11px] text-slate-500">Puntos de trabajo configurados para tareo</p>
                  </div>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                  {SEDES.length} activas
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {SEDES.map((s) => {
                  const emp = EMPRESAS.find((e) => e.id === s.empresaId)
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between gap-3 rounded-[22px] border border-slate-200 bg-slate-50/60 p-3.5 transition-colors hover:border-sky-200 hover:bg-sky-50/40"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{s.nombre}</h4>
                        <p className="mt-1 text-[11px] text-slate-500">{emp?.nombre}</p>
                        <span className="mt-1 inline-flex text-[10px] font-medium text-slate-400">
                          Ciudad: {s.ciudad}
                        </span>
                      </div>
                      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
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
    </div>
  )
}
