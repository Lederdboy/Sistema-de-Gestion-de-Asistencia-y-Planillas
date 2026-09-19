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
    <div className="space-y-5">
      <div className="rounded-[26px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 shadow-inner">
              <Printer size={18} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">Reportes y nómina</p>
              <h2 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
                Centro de reportes, boletas y declaraciones SUNAT
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Emisión de formatos oficiales bajo normativa laboral peruana (D.L. 728 / SUNAT / AFP Net)
              </p>
            </div>
          </div>

          <div className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 sm:inline-flex">
            Actualizado
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="group flex min-h-[220px] flex-col justify-between rounded-[24px] border border-slate-200 bg-white/85 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_22px_48px_rgba(14,165,233,0.12)]">
          <div>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <FileText size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Boletas de Pago</h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Genera y visualiza la boleta oficial individual o masiva con firma digital y detalle normativo.
            </p>
          </div>

          <div className="mt-5 space-y-2 border-t border-slate-100 pt-3">
            <button
              onClick={() => {
                if (workers[0]) openBoleta(workers[0])
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-sky-700"
            >
              <Eye size={13} />
              Ver modelo oficial
            </button>
            <button
              onClick={() => handleDownloadReport('Boletas_Masivas_Julio2025.zip')}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              <Download size={13} />
              Descargar lote PDF
            </button>
          </div>
        </div>

        <div className="group flex min-h-[220px] flex-col justify-between rounded-[24px] border border-slate-200 bg-white/85 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_22px_48px_rgba(16,185,129,0.12)]">
          <div>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <FileSpreadsheet size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Estructuras PLAME</h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Archivos de importación para PDT Planilla Electrónica: .rem, .jor y .snl validados con normativa SUNAT.
            </p>
          </div>

          <div className="mt-5 space-y-2 border-t border-slate-100 pt-3">
            <button
              onClick={() => handleDownloadReport('Estructuras_PLAME_0601_202507.zip')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-700"
            >
              <Download size={13} />
              Generar PDT 601
            </button>
            <div className="text-center text-[11px] text-slate-400 font-mono">
              Formato verificado con validador SUNAT
            </div>
          </div>
        </div>

        <div className="group flex min-h-[220px] flex-col justify-between rounded-[24px] border border-slate-200 bg-white/85 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_22px_48px_rgba(99,102,241,0.12)]">
          <div>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Archivo AFP Net</h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Archivo TXT formateado para subir directamente a la plataforma afpnet.com.pe para pago previsional.
            </p>
          </div>

          <div className="mt-5 space-y-2 border-t border-slate-100 pt-3">
            <button
              onClick={() => handleDownloadReport('AFP_NET_PERIODO_202507.txt')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-violet-700"
            >
              <Download size={13} />
              Descargar AFP Net
            </button>
            <div className="text-center text-[11px] text-slate-400 font-mono">
              Integra, Prima, Profuturo y Hábitat
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white/80 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600">
            Emisión individual de boletas
          </h3>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-500">
            {workers.length} colaboradores
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {workers.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 transition-all duration-200 hover:border-sky-200 hover:bg-sky-50/30"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-900">{w.nombre}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">DNI: {w.dni} · {w.cargo}</p>
              </div>
              <button
                onClick={() => openBoleta(w)}
                className="shrink-0 rounded-xl border border-sky-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-sky-700 transition-colors hover:bg-sky-600 hover:text-white"
              >
                Ver boleta
              </button>
            </div>
          ))}
        </div>
      </div>

      {showBoletaModal && activeWorkerForBoleta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="my-6 w-full max-w-4xl rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_35px_90px_rgba(15,23,42,0.24)]">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Boleta de pago electrónica</h3>
                  <p className="text-[11px] text-slate-500">Formato oficial SUNAT / PLAME</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowBoletaModal(false)
                  if (onCloseBoleta) onCloseBoleta()
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-3 rounded-[20px] border-[2px] border-slate-800 bg-white p-3 text-xs text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <div className="border-b-[2px] border-slate-800 pb-2">
                <div className="mb-2 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" />
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">MINERA ANDINA S.A.</h4>
                      <p className="font-mono text-[9px] text-slate-600">R.U.C. 20489123891</p>
                      <p className="text-[9px] text-slate-600">Av. Las Camelias 450, San Isidro, Lima</p>
                    </div>
                  </div>

                  <div className="rounded border-2 border-slate-800 px-2 py-0.5 text-right">
                    <p className="text-[9px] font-bold text-slate-900">BOLETA DE PAGO</p>
                    <p className="text-[8px] text-slate-600">Formato PLAME</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5 rounded border border-slate-400 bg-slate-100 p-1.5 text-[9px]">
                  <div>
                    <span className="block text-[8px] font-bold text-slate-500">N° BOLETA</span>
                    <span className="font-mono font-bold text-slate-900">B-2025-0001</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-500">FECHA EMISIÓN</span>
                    <span className="font-mono font-semibold">15/07/2025</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-500">PERIODO</span>
                    <span className="font-mono font-semibold">JULIO 2025</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-500">TIPO TRABAJADOR</span>
                    <span className="font-semibold">EMPLEADO</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded border border-slate-400 bg-slate-100 p-2">
                <div className="grid grid-cols-3 gap-1.5 text-[9px] sm:grid-cols-4 lg:grid-cols-5">
                  <div>
                    <span className="block text-[8px] font-bold text-slate-500">APELLIDOS Y NOMBRES</span>
                    <span className="font-bold text-slate-900">{activeWorkerForBoleta.nombre}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-500">DNI / CE</span>
                    <span className="font-mono font-semibold">{activeWorkerForBoleta.dni}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-500">CARGO / PUESTO</span>
                    <span className="font-medium">{activeWorkerForBoleta.cargo}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-500">RÉGIMEN LABORAL</span>
                    <span className="font-semibold">D.L. 728</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-500">RÉGIMEN PENSIONARIO</span>
                    <span className="font-semibold text-slate-900">{activeWorkerForBoleta.afp.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-500">CUSP</span>
                    <span className="font-mono font-semibold">19123456789012</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-500">SITUACIÓN</span>
                    <span className="font-semibold text-slate-900">ACTIVO</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-500">FECHA INGRESO</span>
                    <span className="font-mono font-semibold">15/03/2018</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-500">SUELDO BÁSICO</span>
                    <span className="font-mono font-semibold">S/ {activeWorkerForBoleta.sueldoBase?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded border border-slate-400 bg-slate-200 p-1.5">
                <div className="grid grid-cols-4 gap-1.5 text-[9px]">
                  <div>
                    <span className="block text-[8px] font-bold text-slate-600">DÍAS PERIODO</span>
                    <span className="font-mono font-bold text-slate-900">30</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-600">DÍAS LABORADOS</span>
                    <span className="font-mono font-bold text-slate-900">{activeWorkerForBoleta.diasTrabajados}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-600">DÍAS DESCANSO</span>
                    <span className="font-mono font-bold text-slate-900">{activeWorkerForBoleta.diasDescanso}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-600">DÍAS FALTA</span>
                    <span className="font-mono font-bold text-slate-900">{activeWorkerForBoleta.diasFalta || 0}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 overflow-hidden rounded border-[2px] border-slate-800">
                <div className="border-b-[2px] border-slate-800 bg-slate-300 px-2 py-1 text-[9px] font-bold text-slate-900">
                  INGRESOS DEL TRABAJADOR (Códigos Tributarios SUNAT)
                </div>
                <div className="p-1.5">
                  <table className="w-full text-[9px]">
                    <thead className="border-b border-slate-400 bg-slate-200">
                      <tr>
                        <th className="px-1.5 py-0.5 text-left font-bold text-slate-900">CÓDIGO</th>
                        <th className="px-1.5 py-0.5 text-left font-bold text-slate-900">CONCEPTO</th>
                        <th className="px-1.5 py-0.5 text-right font-bold text-slate-900">IMPORTE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      <tr>
                        <td className="px-1.5 py-0.5 font-mono">0101</td>
                        <td className="px-1.5 py-0.5">Remuneración Básica</td>
                        <td className="px-1.5 py-0.5 text-right font-mono">S/ {activeWorkerForBoleta.basicoProporcional?.toFixed(2)}</td>
                      </tr>
                      {activeWorkerForBoleta.asigFamiliar > 0 && (
                        <tr>
                          <td className="px-1.5 py-0.5 font-mono">0201</td>
                          <td className="px-1.5 py-0.5">Asignación Familiar (Ley 25129)</td>
                          <td className="px-1.5 py-0.5 text-right font-mono">S/ {activeWorkerForBoleta.asigFamiliar?.toFixed(2)}</td>
                        </tr>
                      )}
                      {activeWorkerForBoleta.sobretasaNocturna > 0 && (
                        <tr>
                          <td className="px-1.5 py-0.5 font-mono">0301</td>
                          <td className="px-1.5 py-0.5">Sobretasa por Trabajo Nocturno</td>
                          <td className="px-1.5 py-0.5 text-right font-mono">S/ {activeWorkerForBoleta.sobretasaNocturna?.toFixed(2)}</td>
                        </tr>
                      )}
                      <tr className="border-t-2 border-slate-800 bg-slate-300 font-bold">
                        <td className="px-1.5 py-0.5"></td>
                        <td className="px-1.5 py-0.5">TOTAL INGRESOS</td>
                        <td className="px-1.5 py-0.5 text-right font-mono">S/ {activeWorkerForBoleta.totalBruto?.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-3 overflow-hidden rounded border-[2px] border-slate-800">
                <div className="border-b-[2px] border-slate-800 bg-slate-300 px-2 py-1 text-[9px] font-bold text-slate-900">
                  DESCUENTOS DEL TRABAJADOR (Códigos Tributarios SUNAT)
                </div>
                <div className="p-1.5">
                  <table className="w-full text-[9px]">
                    <thead className="border-b border-slate-400 bg-slate-200">
                      <tr>
                        <th className="px-1.5 py-0.5 text-left font-bold text-slate-900">CÓDIGO</th>
                        <th className="px-1.5 py-0.5 text-left font-bold text-slate-900">CONCEPTO</th>
                        <th className="px-1.5 py-0.5 text-right font-bold text-slate-900">IMPORTE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      <tr>
                        <td className="px-1.5 py-0.5 font-mono">0501</td>
                        <td className="px-1.5 py-0.5">Aporte Obligatorio {activeWorkerForBoleta.afp.toUpperCase()}</td>
                        <td className="px-1.5 py-0.5 text-right font-mono">-S/ {activeWorkerForBoleta.descuentoPension?.toFixed(2)}</td>
                      </tr>
                      {activeWorkerForBoleta.descuentoFaltas > 0 && (
                        <tr>
                          <td className="px-1.5 py-0.5 font-mono">0601</td>
                          <td className="px-1.5 py-0.5">Faltas No Justificadas ({activeWorkerForBoleta.diasFalta} días)</td>
                          <td className="px-1.5 py-0.5 text-right font-mono">-S/ {activeWorkerForBoleta.descuentoFaltas?.toFixed(2)}</td>
                        </tr>
                      )}
                      {activeWorkerForBoleta.renta5ta > 0 && (
                        <tr>
                          <td className="px-1.5 py-0.5 font-mono">0701</td>
                          <td className="px-1.5 py-0.5">Retención Renta 5ta Categoría (Ley 29972)</td>
                          <td className="px-1.5 py-0.5 text-right font-mono">-S/ {activeWorkerForBoleta.renta5ta?.toFixed(2)}</td>
                        </tr>
                      )}
                      <tr className="border-t-2 border-slate-800 bg-slate-300 font-bold">
                        <td className="px-1.5 py-0.5"></td>
                        <td className="px-1.5 py-0.5">TOTAL DESCUENTOS</td>
                        <td className="px-1.5 py-0.5 text-right font-mono">-S/ {activeWorkerForBoleta.totalDescuentos?.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded border-2 border-slate-800 bg-slate-900 p-3 font-bold text-white">
                <span className="text-xs uppercase tracking-wider">NETO A RECIBIR</span>
                <span className="text-lg font-black font-mono">S/ {activeWorkerForBoleta.netoPagar?.toFixed(2)}</span>
              </div>

              <div className="mt-3 rounded border-2 border-slate-400 bg-slate-200 p-2">
                <div className="mb-2 text-[10px] font-bold text-slate-900">APORTACIONES DEL EMPLEADOR</div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex justify-between gap-3">
                    <span>EsSalud (Ley 26790 - 9%)</span>
                    <span className="font-mono font-semibold">S/ {activeWorkerForBoleta.aporteEsSalud?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>SCTR (Pensión/Salud - 1.53%)</span>
                    <span className="font-mono font-semibold">S/ {(activeWorkerForBoleta.totalBruto * 0.0153).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded border-2 border-slate-400 bg-slate-200 p-2 text-[9px] text-slate-700">
                <div className="mb-1 font-bold text-slate-900">REFERENCIAS NORMATIVAS:</div>
                <div className="grid grid-cols-2 gap-1">
                  <div>• D.L. 728 - Ley de Productividad y Competitividad Laboral</div>
                  <div>• Ley 26790 - Modernización de la Seguridad Social</div>
                  <div>• Ley 29972 - Renta de 5ta Categoría</div>
                  <div>• D.S. 013-2022-TR - Reglamento PDT PLAME</div>
                </div>
              </div>

              <div className="mt-4 border-t-2 border-slate-800 pt-4">
                <div className="grid grid-cols-2 gap-4 text-center text-[10px] text-slate-900">
                  <div className="border-t-2 border-slate-800 pt-2">
                    <p className="font-bold text-slate-900">EMPLEADOR</p>
                    <p className="text-[9px]">Minera Andina S.A.</p>
                    <p className="font-mono text-[9px]">RUC 20489123891</p>
                    <p className="mt-1 text-[9px] text-slate-600">Firma Digital / Electrónica</p>
                  </div>
                  <div className="border-t-2 border-slate-800 pt-2">
                    <p className="font-bold text-slate-900">TRABAJADOR</p>
                    <p className="text-[9px]">{activeWorkerForBoleta.nombre}</p>
                    <p className="font-mono text-[9px]">DNI {activeWorkerForBoleta.dni}</p>
                    <p className="mt-1 text-[9px] text-slate-600">Conforme con lo recibido</p>
                  </div>
                </div>
                <div className="mt-3 text-center text-[9px] text-slate-600">
                  Documento generado según normativa SUNAT PLAME · Validez digital · Código de verificación: BP-2025-0001-VER
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-700"
              >
                <Printer size={13} /> Imprimir
              </button>
              <button
                onClick={() => {
                  setShowBoletaModal(false)
                  if (onCloseBoleta) onCloseBoleta()
                }}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-900"
              >
                Cerrar visor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
