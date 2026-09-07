import { useState } from 'react'
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Lock,
  Eye,
  Building2,
  DollarSign,
  TrendingDown,
  ShieldCheck,
  Search,
} from 'lucide-react'
import { calcularPlanillaTrabajador } from '../../data/mockData'

export default function PlanillaView({ workers, onViewBoleta, showToast }) {
  const [periodo, setPeriodo] = useState('2025-07')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('Pre-Planilla') // 'Pre-Planilla' | 'Aprobada'

  // Calcular planilla para todos los trabajadores
  const planillas = workers.map(w => calcularPlanillaTrabajador(w))

  const filtered = planillas.filter(p =>
    !search ||
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.dni.includes(search)
  )

  // Totales
  const totalBrutoGeneral = planillas.reduce((acc, p) => acc + p.totalBruto, 0)
  const totalDescuentosGeneral = planillas.reduce((acc, p) => acc + p.totalDescuentos, 0)
  const totalNetoGeneral = planillas.reduce((acc, p) => acc + p.netoPagar, 0)
  const totalEsSaludGeneral = planillas.reduce((acc, p) => acc + p.aporteEsSalud, 0)

  const handleApprove = () => {
    setStatus('Aprobada')
    showToast(`Planilla del periodo ${periodo} aprobada satisfactoriamente. Lista para dispersión bancaria.`, 'success')
  }

  const handleExportBank = () => {
    showToast('Generando archivo de dispersión bancaria formato BCP Telecrédito / BBVA...', 'info')
    setTimeout(() => {
      showToast('Archivo bancario generado exitosamente (pagos_haberes_jul2025.txt).', 'success')
    }, 900)
  }

  return (
    <div className="space-y-4">
      {/* Header y Acciones */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Planilla Mensual de Remuneraciones
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  status === 'Aprobada'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {status}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Periodo {periodo} · {planillas.length} colaboradores procesados bajo legislación peruana
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBank}
            className="h-9 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Download size={13} />
            <span>TXT Bancos (Telecrédito)</span>
          </button>

          {status !== 'Aprobada' ? (
            <button
              onClick={handleApprove}
              className="h-9 px-3 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <CheckCircle2 size={13} />
              <span>Aprobar y Emitir</span>
            </button>
          ) : (
            <span className="h-9 px-3 text-xs font-semibold bg-slate-100 text-slate-600 rounded-md flex items-center gap-1.5 border border-slate-200">
              <Lock size={12} />
              <span>Planilla Cerrada</span>
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards de Resumen Monetario */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <p className="text-[11px] text-slate-400 font-semibold uppercase">Total Rem. Bruta</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">
            S/ {totalBrutoGeneral.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Básico + Asig. Fam. + Horas extras</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <p className="text-[11px] text-slate-400 font-semibold uppercase">Total Descuentos Ley</p>
          <p className="text-xl font-extrabold text-rose-600 mt-1">
            - S/ {totalDescuentosGeneral.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">AFP, ONP, Faltas y 5ta Cat.</p>
        </div>

        <div className="bg-white border border-blue-200 bg-blue-50/20 rounded-lg p-3.5 shadow-xs">
          <p className="text-[11px] text-blue-700 font-semibold uppercase">Total Neto a Pagar</p>
          <p className="text-xl font-black text-blue-900 mt-1">
            S/ {totalNetoGeneral.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-blue-600 mt-0.5">Dispersión bancaria colaboradores</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <p className="text-[11px] text-slate-400 font-semibold uppercase">Aportes Empleador</p>
          <p className="text-xl font-extrabold text-emerald-700 mt-1">
            S/ {totalEsSaludGeneral.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">EsSalud (9%) a declarar en PLAME</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por DNI o nombre en la planilla..."
            className="w-full h-8 pl-8 pr-3 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="text-xs text-slate-500">
          Mostrando <span className="font-bold text-slate-800">{filtered.length}</span> de {planillas.length}
        </div>
      </div>

      {/* Tabla Detallada de Planilla */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[950px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-3 py-2.5">Colaborador</th>
                <th className="px-2 py-2.5 text-center">DNI</th>
                <th className="px-2 py-2.5 text-center">Días Trab.</th>
                <th className="px-2 py-2.5 text-right">Básico</th>
                <th className="px-2 py-2.5 text-right">Asig. Fam.</th>
                <th className="px-2 py-2.5 text-right">Sobretasa</th>
                <th className="px-2 py-2.5 text-right font-bold text-slate-800 bg-slate-100/60">Total Bruto</th>
                <th className="px-2 py-2.5 text-center">Pensión</th>
                <th className="px-2 py-2.5 text-right text-rose-600">Desc. AFP/ONP</th>
                <th className="px-2 py-2.5 text-right text-rose-600">Desc. Faltas</th>
                <th className="px-2 py-2.5 text-right text-rose-600 font-bold bg-rose-50/50">Total Desc.</th>
                <th className="px-3 py-2.5 text-right font-extrabold text-blue-900 bg-blue-50/80">Neto a Pagar</th>
                <th className="px-2 py-2.5 text-right text-emerald-700">EsSalud 9%</th>
                <th className="px-2 py-2.5 text-center">Boleta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <tr key={row.trabajadorId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3 py-2">
                    <p className="font-semibold text-slate-900">{row.nombre}</p>
                    <p className="text-[10px] text-slate-400">{row.cargo}</p>
                  </td>
                  <td className="px-2 py-2 text-center font-mono text-slate-600">{row.dni}</td>
                  <td className="px-2 py-2 text-center font-semibold text-slate-700">
                    {row.diasTrabajados + row.diasDescanso + row.diasVacaciones}
                  </td>
                  <td className="px-2 py-2 text-right font-mono">S/ {row.basicoProporcional.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right font-mono">S/ {row.asigFamiliar.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right font-mono">S/ {row.sobretasaNocturna.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right font-mono font-bold text-slate-900 bg-slate-50/70">
                    S/ {row.totalBruto.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {row.afp}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right font-mono text-rose-600">
                    -S/ {row.descuentoPension.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 text-right font-mono text-rose-600">
                    -S/ {row.descuentoFaltas.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 text-right font-mono font-bold text-rose-700 bg-rose-50/40">
                    -S/ {row.totalDescuentos.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-bold text-blue-900 bg-blue-50/60 text-sm">
                    S/ {row.netoPagar.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 text-right font-mono text-emerald-700">
                    S/ {row.aporteEsSalud.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button
                      onClick={() => onViewBoleta(row)}
                      title="Ver Boleta de Pago Oficial"
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100/80 font-bold border-t border-slate-200 text-slate-800">
              <tr>
                <td colSpan={6} className="px-3 py-2.5 text-right uppercase text-[11px]">
                  Totales del Periodo:
                </td>
                <td className="px-2 py-2.5 text-right font-mono">
                  S/ {totalBrutoGeneral.toFixed(2)}
                </td>
                <td colSpan={3} className="px-2 py-2.5 text-right font-mono text-rose-700">
                  -S/ {totalDescuentosGeneral.toFixed(2)}
                </td>
                <td className="px-2 py-2.5 text-right font-mono text-rose-700">
                  -S/ {totalDescuentosGeneral.toFixed(2)}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-blue-900 text-sm font-extrabold bg-blue-100/50">
                  S/ {totalNetoGeneral.toFixed(2)}
                </td>
                <td className="px-2 py-2.5 text-right font-mono text-emerald-800">
                  S/ {totalEsSaludGeneral.toFixed(2)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
