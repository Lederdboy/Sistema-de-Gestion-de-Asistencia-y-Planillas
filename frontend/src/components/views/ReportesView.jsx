import { useState } from 'react'
import { createPortal } from 'react-dom'
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
import { generarBoletaPDF, generarLoteBoletasPDF } from '../../services/pdfService'
import { exportarPlameRemTxt, exportarAfpNetTxt } from '../../services/excelService'

export default function ReportesView({ workers, selectedBoleta, onCloseBoleta, showToast, loading = false }) {
  const [activeTab, setActiveTab] = useState('boletas')
  const [activeWorkerForBoleta, setActiveWorkerForBoleta] = useState(
    selectedBoleta || (workers[0] ? calcularPlanillaTrabajador(workers[0]) : null)
  )
  const [showBoletaModal, setShowBoletaModal] = useState(!!selectedBoleta)

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-5 w-48 rounded-full bg-slate-200" />
            <div className="h-3.5 w-72 rounded-full bg-slate-200" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-28 rounded-xl bg-slate-200" />
            <div className="h-9 w-32 rounded-xl bg-slate-200" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="h-4 w-32 rounded-full bg-slate-200 pb-2 border-b border-slate-100" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-100 border border-slate-100" />
            ))}
          </div>

          <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex justify-between pb-3 border-b border-slate-100">
              <div className="h-6 w-48 rounded-lg bg-slate-200" />
              <div className="h-6 w-24 rounded-lg bg-slate-200" />
            </div>
            <div className="space-y-3 py-4">
              <div className="h-4 w-3/4 rounded-full bg-slate-200" />
              <div className="h-4 w-2/3 rounded-full bg-slate-200" />
              <div className="h-28 rounded-xl bg-slate-100" />
              <div className="h-28 rounded-xl bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleDownloadReport = (type) => {
    const calcList = workers.map(w => calcularPlanillaTrabajador(w))
    
    if (type === 'lote_pdf') {
      showToast('Generando lote de boletas en PDF de alta resolución...', 'info')
      try {
        generarLoteBoletasPDF(calcList, '2026-09')
        showToast('Lote de boletas en PDF descargado con éxito.', 'success')
      } catch (err) {
        console.error(err)
        showToast('Error al generar lote PDF.', 'error')
      }
    } else if (type === 'plame') {
      showToast('Generando archivo de remuneraciones PDT 601 PLAME (.rem)...', 'info')
      try {
        exportarPlameRemTxt(calcList, '2026-09')
        showToast('Archivo PLAME 0601 descargado exitosamente.', 'success')
      } catch (err) {
        console.error(err)
        showToast('Error al generar archivo PLAME.', 'error')
      }
    } else if (type === 'afpnet') {
      showToast('Generando archivo de aportes previsionales para AFP Net...', 'info')
      try {
        exportarAfpNetTxt(calcList, '2026-09')
        showToast('Archivo AFP Net descargado exitosamente.', 'success')
      } catch (err) {
        console.error(err)
        showToast('Error al generar archivo AFP Net.', 'error')
      }
    }
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
            <Printer size={24} className="text-black shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">Reportes y nómina</p>
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
        <div className="group flex min-h-[220px] flex-col justify-between rounded-[24px] border border-slate-200 bg-white/85 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_22px_48px_rgba(15,23,42,0.08)]">
          <div>
            <FileText size={22} className="mb-3 text-black" />
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
              onClick={() => handleDownloadReport('lote_pdf')}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              <Download size={13} />
              Descargar lote PDF
            </button>
          </div>
        </div>

        <div className="group flex min-h-[220px] flex-col justify-between rounded-[24px] border border-slate-200 bg-white/85 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_22px_48px_rgba(15,23,42,0.08)]">
          <div>
            <FileSpreadsheet size={22} className="mb-3 text-black" />
            <h3 className="text-sm font-bold text-slate-900">Estructuras PLAME</h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Archivos de importación para PDT Planilla Electrónica: .rem, .jor y .snl validados con normativa SUNAT.
            </p>
          </div>

          <div className="mt-5 space-y-2 border-t border-slate-100 pt-3">
            <button
              onClick={() => handleDownloadReport('plame')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-700"
            >
              <Download size={13} />
              Generar PDT 601 (.rem)
            </button>
            <div className="text-center text-[11px] text-slate-400 font-mono">
              Formato verificado con validador SUNAT
            </div>
          </div>
        </div>

        <div className="group flex min-h-[220px] flex-col justify-between rounded-[24px] border border-slate-200 bg-white/85 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_22px_48px_rgba(15,23,42,0.08)]">
          <div>
            <ShieldCheck size={22} className="mb-3 text-black" />
            <h3 className="text-sm font-bold text-slate-900">Archivo AFP Net</h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Archivo TXT formateado para subir directamente a la plataforma afpnet.com.pe para pago previsional.
            </p>
          </div>

          <div className="mt-5 space-y-2 border-t border-slate-100 pt-3">
            <button
              onClick={() => handleDownloadReport('afpnet')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-violet-700"
            >
              <Download size={13} />
              Descargar AFP Net (.txt)
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

      {showBoletaModal && activeWorkerForBoleta && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] flex items-center justify-center p-2 sm:p-5 lg:p-7 bg-slate-950/75 backdrop-blur-xs">
          <div className="w-full max-w-5xl xl:max-w-6xl max-h-[94vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header Fijo */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 sm:px-7 py-4 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <FileText size={22} className="text-black shrink-0" />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Boleta de pago electrónica</h3>
                  <p className="text-xs text-slate-500">Formato oficial SUNAT / PLAME · D.S. 013-2022-TR</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowBoletaModal(false)
                  if (onCloseBoleta) onCloseBoleta()
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
                title="Cerrar visor"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scroll View Vertical del Documento */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-100/70">
              <div className="w-full max-w-4xl mx-auto rounded-[18px] border-[2px] border-slate-800 bg-white p-5 sm:p-8 text-xs sm:text-sm text-slate-900 shadow-md">
                {/* Encabezado de la Boleta */}
                <div className="border-b-[2px] border-slate-800 pb-3">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
                      <div>
                        <h4 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">MINERA ANDINA S.A.</h4>
                        <p className="font-mono text-xs text-slate-600 mt-0.5">R.U.C. 20489123891</p>
                        <p className="text-xs text-slate-600">Av. Las Camelias 450, San Isidro, Lima</p>
                      </div>
                    </div>

                    <div className="rounded-lg border-2 border-slate-800 px-3 py-1 text-right bg-slate-50">
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900">BOLETA DE PAGO</p>
                      <p className="text-[10px] sm:text-xs text-slate-600 font-medium">Formato PLAME</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-lg border border-slate-300 bg-slate-100 p-2 sm:p-2.5 text-xs">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">N° Boleta</span>
                      <span className="font-mono font-bold text-slate-900">B-2025-0001</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fecha Emisión</span>
                      <span className="font-mono font-semibold text-slate-800">15/07/2025</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Periodo</span>
                      <span className="font-mono font-semibold text-slate-800">JULIO 2025</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tipo Trabajador</span>
                      <span className="font-semibold text-slate-800">EMPLEADO</span>
                    </div>
                  </div>
                </div>

                {/* Datos del Trabajador */}
                <div className="mt-3.5 rounded-lg border border-slate-300 bg-slate-100/80 p-2.5 sm:p-3.5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5 text-xs">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Apellidos y Nombres</span>
                      <span className="font-bold text-slate-900 truncate block">{activeWorkerForBoleta.nombre}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">DNI / CE</span>
                      <span className="font-mono font-semibold text-slate-800">{activeWorkerForBoleta.dni}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cargo / Puesto</span>
                      <span className="font-medium text-slate-800">{activeWorkerForBoleta.cargo}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Régimen Laboral</span>
                      <span className="font-semibold text-slate-800">D.L. 728</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Régimen Pensionario</span>
                      <span className="font-semibold text-slate-900">{activeWorkerForBoleta.afp?.toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">CUSP</span>
                      <span className="font-mono font-semibold text-slate-800">19123456789012</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Situación</span>
                      <span className="font-semibold text-emerald-700">ACTIVO</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fecha Ingreso</span>
                      <span className="font-mono font-semibold text-slate-800">15/03/2018</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sueldo Básico</span>
                      <span className="font-mono font-bold text-slate-900">S/ {activeWorkerForBoleta.sueldoBase?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Matriz de Días */}
                <div className="mt-3 rounded-lg border border-slate-300 bg-slate-200/70 p-2 sm:p-2.5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Días Periodo</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">30</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Días Laborados</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">{activeWorkerForBoleta.diasTrabajados}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Días Descanso</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">{activeWorkerForBoleta.diasDescanso}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Días Falta</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">{activeWorkerForBoleta.diasFalta || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Tabla de Ingresos */}
                <div className="mt-3.5 overflow-hidden rounded-lg border-[2px] border-slate-800">
                  <div className="border-b-[2px] border-slate-800 bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-900 tracking-wide">
                    INGRESOS DEL TRABAJADOR (Códigos Tributarios SUNAT)
                  </div>
                  <div className="p-2 sm:p-3">
                    <table className="w-full text-xs">
                      <thead className="border-b border-slate-300 bg-slate-100">
                        <tr>
                          <th className="px-2.5 py-1 text-left font-bold text-slate-700">CÓDIGO</th>
                          <th className="px-2.5 py-1 text-left font-bold text-slate-700">CONCEPTO</th>
                          <th className="px-2.5 py-1 text-right font-bold text-slate-700">IMPORTE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="px-2.5 py-1.5 font-mono text-slate-600">0101</td>
                          <td className="px-2.5 py-1.5 font-medium text-slate-900">Remuneración Básica</td>
                          <td className="px-2.5 py-1.5 text-right font-mono font-semibold">S/ {activeWorkerForBoleta.basicoProporcional?.toFixed(2)}</td>
                        </tr>
                        {activeWorkerForBoleta.asigFamiliar > 0 && (
                          <tr>
                            <td className="px-2.5 py-1.5 font-mono text-slate-600">0201</td>
                            <td className="px-2.5 py-1.5 font-medium text-slate-900">Asignación Familiar (Ley 25129)</td>
                            <td className="px-2.5 py-1.5 text-right font-mono font-semibold">S/ {activeWorkerForBoleta.asigFamiliar?.toFixed(2)}</td>
                          </tr>
                        )}
                        {activeWorkerForBoleta.sobretasaNocturna > 0 && (
                          <tr>
                            <td className="px-2.5 py-1.5 font-mono text-slate-600">0301</td>
                            <td className="px-2.5 py-1.5 font-medium text-slate-900">Sobretasa por Trabajo Nocturno</td>
                            <td className="px-2.5 py-1.5 text-right font-mono font-semibold">S/ {activeWorkerForBoleta.sobretasaNocturna?.toFixed(2)}</td>
                          </tr>
                        )}
                        <tr className="border-t-2 border-slate-800 bg-slate-100 font-bold text-xs sm:text-sm">
                          <td className="px-2.5 py-2"></td>
                          <td className="px-2.5 py-2 text-slate-900">TOTAL INGRESOS</td>
                          <td className="px-2.5 py-2 text-right font-mono text-slate-900">S/ {activeWorkerForBoleta.totalBruto?.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tabla de Descuentos */}
                <div className="mt-3.5 overflow-hidden rounded-lg border-[2px] border-slate-800">
                  <div className="border-b-[2px] border-slate-800 bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-900 tracking-wide">
                    DESCUENTOS DEL TRABAJADOR (Códigos Tributarios SUNAT)
                  </div>
                  <div className="p-2 sm:p-3">
                    <table className="w-full text-xs">
                      <thead className="border-b border-slate-300 bg-slate-100">
                        <tr>
                          <th className="px-2.5 py-1 text-left font-bold text-slate-700">CÓDIGO</th>
                          <th className="px-2.5 py-1 text-left font-bold text-slate-700">CONCEPTO</th>
                          <th className="px-2.5 py-1 text-right font-bold text-slate-700">IMPORTE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="px-2.5 py-1.5 font-mono text-slate-600">0501</td>
                          <td className="px-2.5 py-1.5 font-medium text-slate-900">Aporte Obligatorio {activeWorkerForBoleta.afp?.toUpperCase()}</td>
                          <td className="px-2.5 py-1.5 text-right font-mono font-semibold text-rose-700">-S/ {activeWorkerForBoleta.descuentoPension?.toFixed(2)}</td>
                        </tr>
                        {activeWorkerForBoleta.descuentoFaltas > 0 && (
                          <tr>
                            <td className="px-2.5 py-1.5 font-mono text-slate-600">0601</td>
                            <td className="px-2.5 py-1.5 font-medium text-slate-900">Faltas No Justificadas ({activeWorkerForBoleta.diasFalta} días)</td>
                            <td className="px-2.5 py-1.5 text-right font-mono font-semibold text-rose-700">-S/ {activeWorkerForBoleta.descuentoFaltas?.toFixed(2)}</td>
                          </tr>
                        )}
                        {activeWorkerForBoleta.renta5ta > 0 && (
                          <tr>
                            <td className="px-2.5 py-1.5 font-mono text-slate-600">0701</td>
                            <td className="px-2.5 py-1.5 font-medium text-slate-900">Retención Renta 5ta Categoría (Ley 29972)</td>
                            <td className="px-2.5 py-1.5 text-right font-mono font-semibold text-rose-700">-S/ {activeWorkerForBoleta.renta5ta?.toFixed(2)}</td>
                          </tr>
                        )}
                        <tr className="border-t-2 border-slate-800 bg-slate-100 font-bold text-xs sm:text-sm">
                          <td className="px-2.5 py-2"></td>
                          <td className="px-2.5 py-2 text-slate-900">TOTAL DESCUENTOS</td>
                          <td className="px-2.5 py-2 text-right font-mono text-rose-700">-S/ {activeWorkerForBoleta.totalDescuentos?.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Neto a Recibir */}
                <div className="mt-3.5 flex items-center justify-between rounded-xl border-2 border-slate-900 bg-slate-900 px-4 sm:px-6 py-3 sm:py-4 font-bold text-white shadow-xs">
                  <span className="text-xs sm:text-sm uppercase tracking-wider font-extrabold">NETO A RECIBIR</span>
                  <span className="text-xl sm:text-2xl font-black font-mono">S/ {activeWorkerForBoleta.netoPagar?.toFixed(2)}</span>
                </div>

                {/* Aportaciones del Empleador */}
                <div className="mt-3.5 rounded-lg border border-slate-300 bg-slate-100 p-2.5 sm:p-3 text-xs">
                  <div className="mb-2 text-xs font-bold text-slate-900 uppercase tracking-wider">Aportaciones del Empleador</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between gap-3 p-1.5 bg-white rounded border border-slate-200">
                      <span className="text-slate-700">EsSalud (Ley 26790 - 9%)</span>
                      <span className="font-mono font-bold text-slate-900">S/ {activeWorkerForBoleta.aporteEsSalud?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between gap-3 p-1.5 bg-white rounded border border-slate-200">
                      <span className="text-slate-700">SCTR (Pensión/Salud - 1.53%)</span>
                      <span className="font-mono font-bold text-slate-900">S/ {(activeWorkerForBoleta.totalBruto * 0.0153).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Firmas y Sellos */}
                <div className="mt-4 border-t-2 border-slate-800 pt-4">
                  <div className="grid grid-cols-2 gap-6 text-center text-xs text-slate-900">
                    <div className="border-t border-slate-700 pt-2">
                      <p className="font-bold text-slate-900">EMPLEADOR</p>
                      <p className="text-xs text-slate-600">Minera Andina S.A.</p>
                      <p className="font-mono text-xs text-slate-500">RUC 20489123891</p>
                      <p className="mt-1 text-[11px] text-slate-500 font-medium">Firma Digital / Electrónica</p>
                    </div>
                    <div className="border-t border-slate-700 pt-2">
                      <p className="font-bold text-slate-900">TRABAJADOR</p>
                      <p className="text-xs text-slate-800 font-semibold">{activeWorkerForBoleta.nombre}</p>
                      <p className="font-mono text-xs text-slate-500">DNI {activeWorkerForBoleta.dni}</p>
                      <p className="mt-1 text-[11px] text-slate-500 font-medium">Conforme con lo recibido</p>
                    </div>
                  </div>
                  <div className="mt-3 text-center text-[10px] text-slate-500">
                    Documento generado según normativa SUNAT PLAME · Validez digital · Código de verificación: BP-2025-0001-VER
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Fijo con los botones siempre visibles */}
            <div className="border-t border-slate-200 px-5 sm:px-7 py-3.5 bg-white flex flex-wrap items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => {
                  try {
                    generarBoletaPDF(activeWorkerForBoleta, '2026-09')
                    showToast('Boleta PDF descargada correctamente.', 'success')
                  } catch (e) {
                    console.error(e)
                    showToast('Error al generar PDF de la boleta.', 'error')
                  }
                }}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 cursor-pointer"
              >
                <Download size={15} /> Descargar PDF
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-700 cursor-pointer"
              >
                <Printer size={15} /> Imprimir
              </button>
              <button
                onClick={() => {
                  setShowBoletaModal(false)
                  if (onCloseBoleta) onCloseBoleta()
                }}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-900 cursor-pointer"
              >
                Cerrar visor
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
