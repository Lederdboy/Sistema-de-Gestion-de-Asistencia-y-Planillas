import { useState } from 'react'
import {
  FileText,
  Printer,
  Download,
  Building2,
  Calendar,
  CheckCircle2,
  Eye,
  X,
  FileSpreadsheet,
  ShieldCheck,
} from 'lucide-react'
import { EMPRESAS, calcularPlanillaTrabajador } from '../../data/mockData'

export default function ReportesView({ workers, selectedBoleta, onCloseBoleta, showToast }) {
  const [activeTab, setActiveTab] = useState('boletas')
  const [activeWorkerForBoleta, setActiveWorkerForBoleta] = useState(
    selectedBoleta || (workers[0] ? calcularPlanillaTrabajador(workers[0]) : null)
  )
  const [showBoletaModal, setShowBoletaModal] = useState(!!selectedBoleta)

  const handleDownloadReport = (reportName) => {
    showToast(`Generando archivo oficial para ${reportName}...`, 'info')
    setTimeout(() => {
      showToast(`${reportName} generado y descargado con éxito.`, 'success')
    }, 1000)
  }

  const openBoleta = (worker) => {
    const calc = calcularPlanillaTrabajador(worker)
    setActiveWorkerForBoleta(calc)
    setShowBoletaModal(true)
  }

  return (
    <div className="space-y-4">
      {/* Header del módulo */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Printer size={16} className="text-blue-600" />
            Centro de Reportes, Boletas y Declaraciones SUNAT
          </h2>
          <p className="text-xs text-slate-500">
            Emisión de formatos oficiales bajo normativa laboral peruana (D.L. 728 / SUNAT / AFP Net)
          </p>
        </div>
      </div>

      {/* Tarjetas de Reportes Oficiales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Reporte 1: Boletas de Pago */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <FileText size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Boletas de Pago (Formato SUNAT)</h3>
            <p className="text-xs text-slate-500 mt-1">
              Genera y visualiza la boleta oficial individual o masiva con firma digital y detalle normativo.
            </p>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                if (workers[0]) openBoleta(workers[0])
              }}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye size={13} />
              <span>Ver Modelo de Boleta Oficial</span>
            </button>
            <button
              onClick={() => handleDownloadReport('Boletas_Masivas_Julio2025.zip')}
              className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download size={13} />
              <span>Descargar Lote PDF (ZIP)</span>
            </button>
          </div>
        </div>

        {/* Reporte 2: Estructuras PLAME */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <FileSpreadsheet size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Estructuras PLAME (SUNAT)</h3>
            <p className="text-xs text-slate-500 mt-1">
              Archivos de importación para PDT Planilla Electrónica: .rem (remuneraciones), .jor (jornada), .snl.
            </p>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => handleDownloadReport('Estructuras_PLAME_0601_202507.zip')}
              className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download size={13} />
              <span>Generar Archivos PLAME PDT 601</span>
            </button>
            <div className="text-[11px] text-slate-400 text-center font-mono">
              Formato verificado con validador SUNAT
            </div>
          </div>
        </div>

        {/* Reporte 3: Interface AFP Net */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Archivo AFP Net Oficial</h3>
            <p className="text-xs text-slate-500 mt-1">
              Archivo TXT formateado para subir directamente a la plataforma afpnet.com.pe para pago previsional.
            </p>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => handleDownloadReport('AFP_NET_PERIODO_202507.txt')}
              className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download size={13} />
              <span>Descargar Archivo AFP Net</span>
            </button>
            <div className="text-[11px] text-slate-400 text-center font-mono">
              Integra, Prima, Profuturo y Hábitat
            </div>
          </div>
        </div>

      </div>

      {/* Lista Rápida de Emisión de Boletas por Trabajador */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Emisión Individual de Boletas de Pago
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {workers.map((w) => (
            <div
              key={w.id}
              className="p-3 rounded-lg border border-slate-200 hover:border-blue-300 bg-slate-50/40 hover:bg-blue-50/30 flex items-center justify-between transition-colors"
            >
              <div>
                <p className="text-xs font-bold text-slate-900">{w.nombre}</p>
                <p className="text-[11px] text-slate-500">DNI: {w.dni} · {w.cargo}</p>
              </div>
              <button
                onClick={() => openBoleta(w)}
                className="px-2.5 py-1 bg-white hover:bg-blue-600 hover:text-white border border-slate-200 hover:border-blue-600 text-blue-600 text-xs font-semibold rounded transition-colors cursor-pointer"
              >
                Ver Boleta
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: VISOR DE BOLETA DE PAGO OFICIAL SUNAT */}
      {showBoletaModal && activeWorkerForBoleta && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 my-8">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Boleta de Pago Electrónica · Formato Oficial SUNAT
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center gap-1 cursor-pointer"
                >
                  <Printer size={13} /> Imprimir
                </button>
                <button
                  onClick={() => {
                    setShowBoletaModal(false)
                    if (onCloseBoleta) onCloseBoleta()
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* CUERPO DE LA BOLETA FORMATO SUNAT */}
            <div className="mt-4 border border-slate-300 rounded-lg p-5 text-xs text-slate-800 space-y-4 bg-white">
              
              {/* Cabecera Empleador */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="Logo" className="h-11 w-auto object-contain" />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">MINERA ANDINA S.A.</h4>
                    <p className="text-[11px] text-slate-500 font-mono">R.U.C. 20489123891</p>
                    <p className="text-[11px] text-slate-500">Av. Las Camelias 450, San Isidro, Lima</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 bg-slate-100 border border-slate-300 font-bold text-slate-800 rounded text-xs">
                    BOLETA DE PAGO
                  </span>
                  <p className="text-[11px] font-semibold text-slate-600 mt-1">Periodo: Julio 2025</p>
                </div>
              </div>

              {/* Datos del Trabajador */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">TRABAJADOR</span>
                  <span className="font-bold text-slate-900">{activeWorkerForBoleta.nombre}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">DOCUMENTO IDENTIDAD</span>
                  <span className="font-mono font-semibold">DNI {activeWorkerForBoleta.dni}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">CARGO / PUESTO</span>
                  <span className="font-medium">{activeWorkerForBoleta.cargo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">RÉGIMEN PENSIONARIO</span>
                  <span className="font-semibold text-blue-700">{activeWorkerForBoleta.afp}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">DÍAS LABORADOS</span>
                  <span className="font-semibold">{activeWorkerForBoleta.diasTrabajados} días (+ {activeWorkerForBoleta.diasDescanso} descanso)</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">SUELDO BÁSICO MENSUAL</span>
                  <span className="font-mono font-semibold">S/ {activeWorkerForBoleta.sueldoBase?.toFixed(2)}</span>
                </div>
              </div>

              {/* Tabla de Haberes y Descuentos */}
              <div className="grid grid-cols-2 gap-3">
                {/* Ingresos / Haberes */}
                <div className="border border-slate-200 rounded overflow-hidden">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-[11px] text-slate-700 border-b border-slate-200">
                    INGRESOS DEL TRABAJADOR
                  </div>
                  <div className="p-2.5 space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span>Básico Computable</span>
                      <span className="font-mono">S/ {activeWorkerForBoleta.basicoProporcional?.toFixed(2)}</span>
                    </div>
                    {activeWorkerForBoleta.asigFamiliar > 0 && (
                      <div className="flex justify-between">
                        <span>Asignación Familiar</span>
                        <span className="font-mono">S/ {activeWorkerForBoleta.asigFamiliar?.toFixed(2)}</span>
                      </div>
                    )}
                    {activeWorkerForBoleta.sobretasaNocturna > 0 && (
                      <div className="flex justify-between">
                        <span>Sobretasa Turno Noche</span>
                        <span className="font-mono">S/ {activeWorkerForBoleta.sobretasaNocturna?.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                      <span>TOTAL INGRESOS:</span>
                      <span className="font-mono">S/ {activeWorkerForBoleta.totalBruto?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Descuentos al Trabajador */}
                <div className="border border-slate-200 rounded overflow-hidden">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-[11px] text-slate-700 border-b border-slate-200">
                    DESCUENTOS DE LEY
                  </div>
                  <div className="p-2.5 space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-rose-700">
                      <span>Aporte Previsional ({activeWorkerForBoleta.afp})</span>
                      <span className="font-mono">-S/ {activeWorkerForBoleta.descuentoPension?.toFixed(2)}</span>
                    </div>
                    {activeWorkerForBoleta.descuentoFaltas > 0 && (
                      <div className="flex justify-between text-rose-700">
                        <span>Faltas no justificadas ({activeWorkerForBoleta.diasFalta} días)</span>
                        <span className="font-mono">-S/ {activeWorkerForBoleta.descuentoFaltas?.toFixed(2)}</span>
                      </div>
                    )}
                    {activeWorkerForBoleta.renta5ta > 0 && (
                      <div className="flex justify-between text-rose-700">
                        <span>Retención Renta 5ta Categoría</span>
                        <span className="font-mono">-S/ {activeWorkerForBoleta.renta5ta?.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-rose-700">
                      <span>TOTAL DESCUENTOS:</span>
                      <span className="font-mono">-S/ {activeWorkerForBoleta.totalDescuentos?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Neto a Pagar */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded flex items-center justify-between font-bold text-blue-900">
                <span className="text-xs uppercase tracking-wider">NETO A RECIBIR POR EL TRABAJADOR:</span>
                <span className="text-base font-black font-mono">
                  S/ {activeWorkerForBoleta.netoPagar?.toFixed(2)}
                </span>
              </div>

              {/* Aportaciones del Empleador */}
              <div className="bg-slate-50 border border-slate-200 rounded p-2 text-[11px] flex justify-between text-slate-600">
                <span>Aportaciones Empleador (EsSalud Ley 26790 - 9%):</span>
                <span className="font-mono font-semibold">S/ {activeWorkerForBoleta.aporteEsSalud?.toFixed(2)}</span>
              </div>

              {/* Firmas */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-500">
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-bold text-slate-800">EMPLEADOR</p>
                  <p>Minera Andina S.A. · RUC 20489123891</p>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-bold text-slate-800">TRABAJADOR</p>
                  <p>{activeWorkerForBoleta.nombre} · DNI {activeWorkerForBoleta.dni}</p>
                </div>
              </div>

            </div>

            {/* Footer Modal */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowBoletaModal(false)
                  if (onCloseBoleta) onCloseBoleta()
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cerrar Visor
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
