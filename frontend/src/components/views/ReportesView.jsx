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

            {/* CUERPO DE LA BOLETA FORMATO PLAME/SUNAT - IMPRESIÓN OFICIAL */}
            <div className="mt-4 border-2 border-slate-800 rounded-lg p-4 text-xs text-slate-900 space-y-3 bg-white">
              
              {/* Cabecera con información PLAME */}
              <div className="border-b-2 border-slate-800 pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">MINERA ANDINA S.A.</h4>
                      <p className="text-[10px] text-slate-600 font-mono">R.U.C. 20489123891</p>
                      <p className="text-[10px] text-slate-600">Av. Las Camelias 450, San Isidro, Lima</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="border-2 border-slate-800 px-3 py-1 rounded">
                      <p className="font-bold text-slate-900 text-[10px]">BOLETA DE PAGO</p>
                      <p className="text-[9px] text-slate-600">Formato PLAME</p>
                    </div>
                  </div>
                </div>
                
                {/* Información de la boleta */}
                <div className="grid grid-cols-4 gap-2 bg-slate-100 p-2 rounded border border-slate-400 text-[10px]">
                  <div>
                    <span className="text-slate-500 block font-bold text-[9px]">N° BOLETA</span>
                    <span className="font-mono font-bold text-slate-900">B-2025-0001</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold text-[9px]">FECHA EMISIÓN</span>
                    <span className="font-mono font-semibold">15/07/2025</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold text-[9px]">PERIODO</span>
                    <span className="font-mono font-semibold">JULIO 2025</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold text-[9px]">TIPO TRABAJADOR</span>
                    <span className="font-semibold">EMPLEADO</span>
                  </div>
                </div>
              </div>

              {/* Datos del Trabajador - Formato PLAME */}
              <div className="bg-slate-100 p-3 rounded border border-slate-400">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <span className="text-slate-500 block font-bold text-[9px]">APELLIDOS Y NOMBRES</span>
                    <span className="font-bold text-slate-900">{activeWorkerForBoleta.nombre}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold text-[9px]">DNI / CE</span>
                    <span className="font-mono font-semibold">{activeWorkerForBoleta.dni}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold text-[9px]">CARGO / PUESTO</span>
                    <span className="font-medium">{activeWorkerForBoleta.cargo}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold text-[9px]">RÉGIMEN LABORAL</span>
                    <span className="font-semibold">D.L. 728</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold text-[9px]">RÉGIMEN PENSIONARIO</span>
                    <span className="font-semibold text-slate-900">{activeWorkerForBoleta.afp.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold text-[9px]">CUSP</span>
                    <span className="font-mono font-semibold">19123456789012</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold text-[9px]">SITUACIÓN</span>
                    <span className="font-semibold text-slate-900">ACTIVO</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold text-[9px]">FECHA INGRESO</span>
                    <span className="font-mono font-semibold">15/03/2018</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold text-[9px]">SUELDO BÁSICO</span>
                    <span className="font-mono font-semibold">S/ {activeWorkerForBoleta.sueldoBase?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Información de Tiempo Laborado */}
              <div className="bg-slate-200 p-2 rounded border border-slate-400">
                <div className="grid grid-cols-4 gap-2 text-[10px]">
                  <div>
                    <span className="text-slate-600 block font-bold text-[9px]">DÍAS PERIODO</span>
                    <span className="font-mono font-bold text-slate-900">30</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block font-bold text-[9px]">DÍAS LABORADOS</span>
                    <span className="font-mono font-bold text-slate-900">{activeWorkerForBoleta.diasTrabajados}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block font-bold text-[9px]">DÍAS DESCANSO</span>
                    <span className="font-mono font-bold text-slate-900">{activeWorkerForBoleta.diasDescanso}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block font-bold text-[9px]">DÍAS FALTA</span>
                    <span className="font-mono font-bold text-slate-900">{activeWorkerForBoleta.diasFalta || 0}</span>
                  </div>
                </div>
              </div>

              {/* Tabla de Ingresos con Códigos Tributarios */}
              <div className="border-2 border-slate-800 rounded overflow-hidden">
                <div className="bg-slate-300 px-3 py-1.5 font-bold text-[10px] text-slate-900 border-b-2 border-slate-800">
                  INGRESOS DEL TRABAJADOR (Códigos Tributarios SUNAT)
                </div>
                <div className="p-2">
                  <table className="w-full text-[10px]">
                    <thead className="bg-slate-200 border-b border-slate-400">
                      <tr>
                        <th className="text-left font-bold text-slate-900 py-1 px-2">CÓDIGO</th>
                        <th className="text-left font-bold text-slate-900 py-1 px-2">CONCEPTO</th>
                        <th className="text-right font-bold text-slate-900 py-1 px-2">IMPORTE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      <tr>
                        <td className="font-mono py-1 px-2">0101</td>
                        <td className="py-1 px-2">Remuneración Básica</td>
                        <td className="font-mono text-right py-1 px-2">S/ {activeWorkerForBoleta.basicoProporcional?.toFixed(2)}</td>
                      </tr>
                      {activeWorkerForBoleta.asigFamiliar > 0 && (
                        <tr>
                          <td className="font-mono py-1 px-2">0201</td>
                          <td className="py-1 px-2">Asignación Familiar (Ley 25129)</td>
                          <td className="font-mono text-right py-1 px-2">S/ {activeWorkerForBoleta.asigFamiliar?.toFixed(2)}</td>
                        </tr>
                      )}
                      {activeWorkerForBoleta.sobretasaNocturna > 0 && (
                        <tr>
                          <td className="font-mono py-1 px-2">0301</td>
                          <td className="py-1 px-2">Sobretasa por Trabajo Nocturno</td>
                          <td className="font-mono text-right py-1 px-2">S/ {activeWorkerForBoleta.sobretasaNocturna?.toFixed(2)}</td>
                        </tr>
                      )}
                      <tr className="bg-slate-300 font-bold border-t-2 border-slate-800">
                        <td className="py-1 px-2"></td>
                        <td className="py-1 px-2">TOTAL INGRESOS</td>
                        <td className="font-mono text-right py-1 px-2">S/ {activeWorkerForBoleta.totalBruto?.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabla de Descuentos con Códigos Tributarios */}
              <div className="border-2 border-slate-800 rounded overflow-hidden">
                <div className="bg-slate-300 px-3 py-1.5 font-bold text-[10px] text-slate-900 border-b-2 border-slate-800">
                  DESCUENTOS DEL TRABAJADOR (Códigos Tributarios SUNAT)
                </div>
                <div className="p-2">
                  <table className="w-full text-[10px]">
                    <thead className="bg-slate-200 border-b border-slate-400">
                      <tr>
                        <th className="text-left font-bold text-slate-900 py-1 px-2">CÓDIGO</th>
                        <th className="text-left font-bold text-slate-900 py-1 px-2">CONCEPTO</th>
                        <th className="text-right font-bold text-slate-900 py-1 px-2">IMPORTE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      <tr>
                        <td className="font-mono py-1 px-2">0501</td>
                        <td className="py-1 px-2">Aporte Obligatorio {activeWorkerForBoleta.afp.toUpperCase()}</td>
                        <td className="font-mono text-right py-1 px-2">-S/ {activeWorkerForBoleta.descuentoPension?.toFixed(2)}</td>
                      </tr>
                      {activeWorkerForBoleta.descuentoFaltas > 0 && (
                        <tr>
                          <td className="font-mono py-1 px-2">0601</td>
                          <td className="py-1 px-2">Faltas No Justificadas ({activeWorkerForBoleta.diasFalta} días)</td>
                          <td className="font-mono text-right py-1 px-2">-S/ {activeWorkerForBoleta.descuentoFaltas?.toFixed(2)}</td>
                        </tr>
                      )}
                      {activeWorkerForBoleta.renta5ta > 0 && (
                        <tr>
                          <td className="font-mono py-1 px-2">0701</td>
                          <td className="py-1 px-2">Retención Renta 5ta Categoría (Ley 29972)</td>
                          <td className="font-mono text-right py-1 px-2">-S/ {activeWorkerForBoleta.renta5ta?.toFixed(2)}</td>
                        </tr>
                      )}
                      <tr className="bg-slate-300 font-bold border-t-2 border-slate-800">
                        <td className="py-1 px-2"></td>
                        <td className="py-1 px-2">TOTAL DESCUENTOS</td>
                        <td className="font-mono text-right py-1 px-2">-S/ {activeWorkerForBoleta.totalDescuentos?.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Neto a Pagar */}
              <div className="p-3 bg-slate-900 border-2 border-slate-800 rounded flex items-center justify-between font-bold text-white">
                <span className="text-xs uppercase tracking-wider">NETO A RECIBIR:</span>
                <span className="text-lg font-black font-mono">
                  S/ {activeWorkerForBoleta.netoPagar?.toFixed(2)}
                </span>
              </div>

              {/* Aportaciones del Empleador */}
              <div className="bg-slate-200 border-2 border-slate-400 rounded p-2">
                <div className="font-bold text-slate-900 text-[10px] mb-2">APORTACIONES DEL EMPLEADOR</div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex justify-between">
                    <span>EsSalud (Ley 26790 - 9%)</span>
                    <span className="font-mono font-semibold">S/ {activeWorkerForBoleta.aporteEsSalud?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SCTR (Pensión/Salud - 1.53%)</span>
                    <span className="font-mono font-semibold">S/ {(activeWorkerForBoleta.totalBruto * 0.0153).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Referencias Normativas */}
              <div className="bg-slate-200 border-2 border-slate-400 rounded p-2 text-[9px] text-slate-700">
                <div className="font-bold text-slate-900 mb-1">REFERENCIAS NORMATIVAS:</div>
                <div className="grid grid-cols-2 gap-1">
                  <div>• D.L. 728 - Ley de Productividad y Competitividad Laboral</div>
                  <div>• Ley 26790 - Modernización de la Seguridad Social</div>
                  <div>• Ley 29972 - Renta de 5ta Categoría</div>
                  <div>• D.S. 013-2022-TR - Reglamento PDT PLAME</div>
                </div>
              </div>

              {/* Firmas y Pie de Página */}
              <div className="pt-4 border-t-2 border-slate-800">
                <div className="grid grid-cols-2 gap-4 text-center text-[10px] text-slate-900">
                  <div className="border-t-2 border-slate-800 pt-2">
                    <p className="font-bold text-slate-900">EMPLEADOR</p>
                    <p className="text-[9px]">Minera Andina S.A.</p>
                    <p className="text-[9px] font-mono">RUC 20489123891</p>
                    <p className="text-[9px] text-slate-600 mt-1">Firma Digital / Electrónica</p>
                  </div>
                  <div className="border-t-2 border-slate-800 pt-2">
                    <p className="font-bold text-slate-900">TRABAJADOR</p>
                    <p className="text-[9px]">{activeWorkerForBoleta.nombre}</p>
                    <p className="text-[9px] font-mono">DNI {activeWorkerForBoleta.dni}</p>
                    <p className="text-[9px] text-slate-600 mt-1">Conforme con lo recibido</p>
                  </div>
                </div>
                <div className="text-center mt-3 text-[9px] text-slate-600">
                  <p>Documento generado según normativa SUNAT PLAME · Validez digital · Código de verificación: BP-2025-0001-VER</p>
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
