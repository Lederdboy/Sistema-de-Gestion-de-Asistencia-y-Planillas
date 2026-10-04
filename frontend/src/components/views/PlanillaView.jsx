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
  FileText,
} from 'lucide-react'
import { calcularPlanillaTrabajador } from '../../data/mockData'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function PlanillaView({ workers, onViewBoleta, showToast }) {
  const hoy = new Date()
  const periodoDefault = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
  const [periodo, setPeriodo] = useState(periodoDefault)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('Pre-Planilla')

  const planillas = workers.map(w => calcularPlanillaTrabajador(w))
  const filtered = planillas.filter(p =>
    !search ||
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.dni.includes(search)
  )

  const totalBrutoGeneral = planillas.reduce((acc, p) => acc + p.totalBruto, 0)
  const totalDescuentosGeneral = planillas.reduce((acc, p) => acc + p.totalDescuentos, 0)
  const totalNetoGeneral = planillas.reduce((acc, p) => acc + p.netoPagar, 0)
  const totalEsSaludGeneral = planillas.reduce((acc, p) => acc + p.aporteEsSalud, 0)

  const handleApprove = () => {
    setStatus('Aprobada')
    showToast(`Planilla ${periodo} aprobada. Lista para dispersión bancaria.`, 'success')
  }

  // Exportar Excel real
  const handleExportExcel = () => {
    const filas = planillas.map(p => ({
      'DNI': p.dni,
      'Apellidos y Nombres': p.nombre,
      'Cargo': p.cargo,
      'Días Trab.': p.diasTrabajados,
      'Sueldo Básico': p.sueldoBase,
      'Básico Proporcional': p.basicoProporcional,
      'Asig. Familiar': p.asigFamiliar,
      'Sobretasa Nocturna': p.sobretasaNocturna,
      'Total Bruto': p.totalBruto,
      'Sistema Pens.': p.afp,
      'Desc. AFP/ONP': p.descuentoPension,
      'Desc. Faltas': p.descuentoFaltas,
      'Renta 5ta': p.renta5ta,
      'Total Descuentos': p.totalDescuentos,
      'Neto a Pagar': p.netoPagar,
      'EsSalud 9%': p.aporteEsSalud,
    }))

    const ws = XLSX.utils.json_to_sheet(filas)
    // Ancho de columnas
    ws['!cols'] = [8,28,22,8,12,14,12,14,12,12,12,12,10,14,12,10].map(w => ({ wch: w }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, `Planilla ${periodo}`)
    XLSX.writeFile(wb, `Planilla_${periodo}.xlsx`)
    showToast('Planilla exportada a Excel correctamente.', 'success')
  }

  // Exportar PDF formato PLAME / boleta peruana
  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('PLANILLA MENSUAL DE REMUNERACIONES', 148, 14, { align: 'center' })
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Periodo: ${periodo}  |  Colaboradores: ${planillas.length}  |  Estado: ${status}`, 148, 20, { align: 'center' })
    doc.text(`Generado: ${new Date().toLocaleDateString('es-PE')}`, 148, 25, { align: 'center' })

    autoTable(doc, {
      startY: 30,
      head: [['DNI','Apellidos y Nombres','Cargo','Básico','Asig.Fam','Bruto','AFP/ONP','Faltas','Total Desc.','Neto Pagar','EsSalud']],
      body: planillas.map(p => [
        p.dni, p.nombre, p.cargo,
        `S/ ${p.basicoProporcional.toFixed(2)}`,
        `S/ ${p.asigFamiliar.toFixed(2)}`,
        `S/ ${p.totalBruto.toFixed(2)}`,
        `-S/ ${p.descuentoPension.toFixed(2)}`,
        `-S/ ${p.descuentoFaltas.toFixed(2)}`,
        `-S/ ${p.totalDescuentos.toFixed(2)}`,
        `S/ ${p.netoPagar.toFixed(2)}`,
        `S/ ${p.aporteEsSalud.toFixed(2)}`,
      ]),
      foot: [['','','TOTALES','','',
        `S/ ${totalBrutoGeneral.toFixed(2)}`,
        '','',
        `-S/ ${totalDescuentosGeneral.toFixed(2)}`,
        `S/ ${totalNetoGeneral.toFixed(2)}`,
        `S/ ${totalEsSaludGeneral.toFixed(2)}`,
      ]],
      styles: { fontSize: 7, cellPadding: 1.5 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
      footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    })

    doc.save(`Planilla_${periodo}.pdf`)
    showToast('PDF generado con formato PLAME.', 'success')
  }

  // Exportar boleta individual en PDF
  const handleExportBoleta = (row) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a5' })
    const empresa = 'SERVICIOS CORPORATIVOS S.A.C.'
    const ruc = '20100088899'

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(empresa, 74, 12, { align: 'center' })
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(`RUC: ${ruc}`, 74, 17, { align: 'center' })
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(`BOLETA DE PAGO - PERIODO ${periodo}`, 74, 23, { align: 'center' })

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(`Trabajador: ${row.nombre}`, 10, 32)
    doc.text(`DNI: ${row.dni}`, 10, 37)
    doc.text(`Cargo: ${row.cargo}`, 10, 42)
    doc.text(`Régimen: D.L. 728`, 10, 47)

    autoTable(doc, {
      startY: 53,
      head: [['INGRESOS', 'S/'], ['DESCUENTOS', 'S/']],
      body: [
        ['Básico Proporcional', row.basicoProporcional.toFixed(2)],
        ['Asignación Familiar', row.asigFamiliar.toFixed(2)],
        ['Sobretasa Nocturna', row.sobretasaNocturna.toFixed(2)],
        ['TOTAL BRUTO', row.totalBruto.toFixed(2)],
        ['', ''],
        [`AFP/ONP (${row.afp})`, row.descuentoPension.toFixed(2)],
        ['Descuento por Faltas', row.descuentoFaltas.toFixed(2)],
        ['Renta 5ta Categoría', row.renta5ta.toFixed(2)],
        ['TOTAL DESCUENTOS', row.totalDescuentos.toFixed(2)],
        ['', ''],
        ['NETO A PAGAR', row.netoPagar.toFixed(2)],
        ['EsSalud (empleador 9%)', row.aporteEsSalud.toFixed(2)],
      ],
      styles: { fontSize: 7 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255 },
      columnStyles: { 1: { halign: 'right' } },
    })

    doc.save(`Boleta_${row.dni}_${periodo}.pdf`)
    showToast(`Boleta de ${row.nombre} generada.`, 'success')
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-slate-200/80 bg-white/85 p-4 shadow-[0_18px_35px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 shadow-inner shadow-sky-200/80">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                  Planilla mensual de remuneraciones
                </h2>
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                    status === 'Aprobada'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-amber-200 bg-amber-50 text-amber-700'
                  }`}
                >
                  {status}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Periodo {periodo} · {planillas.length} colaboradores procesados bajo legislación peruana
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-[0_12px_25px_rgba(16,185,129,0.25)] transition-all hover:bg-emerald-700"
            >
              <Download size={13} />
              Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-[0_12px_25px_rgba(239,68,68,0.2)] transition-all hover:bg-rose-700"
            >
              <FileText size={13} />
              PDF PLAME
            </button>
            {status !== 'Aprobada' ? (
              <button
                onClick={handleApprove}
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-[0_12px_25px_rgba(14,165,233,0.28)] transition-all hover:bg-sky-700"
              >
                <CheckCircle2 size={13} />
                Aprobar y emitir
              </button>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs font-semibold text-slate-600">
                <Lock size={12} />
                Planilla cerrada
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[24px] border border-slate-200 bg-white/85 p-3.5 shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Total remuneración bruta</p>
          <p className="mt-2 text-2xl font-black text-slate-900">
            S/ {totalBrutoGeneral.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-[10px] text-slate-500">Básico + asig. familiar + horas extras</p>
        </div>

        <div className="rounded-[24px] border border-rose-200 bg-rose-50/70 p-3.5 shadow-[0_16px_36px_rgba(244,63,94,0.06)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-600">Total descuentos ley</p>
          <p className="mt-2 text-2xl font-black text-rose-700">
            - S/ {totalDescuentosGeneral.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-[10px] text-rose-600">AFP, ONP, faltas y 5ta categoría</p>
        </div>

        <div className="rounded-[24px] border border-sky-200 bg-sky-50/80 p-3.5 shadow-[0_16px_36px_rgba(14,165,233,0.08)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">Total neto a pagar</p>
          <p className="mt-2 text-2xl font-black text-sky-900">
            S/ {totalNetoGeneral.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-[10px] text-sky-700">Dispersión bancaria colaboradores</p>
        </div>

        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50/80 p-3.5 shadow-[0_16px_36px_rgba(16,185,129,0.08)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">Aportes empleador</p>
          <p className="mt-2 text-2xl font-black text-emerald-900">
            S/ {totalEsSaludGeneral.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-[10px] text-emerald-700">EsSalud (9%) declarados en PLAME</p>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white/85 p-3 shadow-[0_18px_35px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por DNI o nombre..."
              className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
            />
          </div>

          <div className="text-xs font-medium text-slate-500">
            Mostrando <span className="font-bold text-slate-800">{filtered.length}</span> de {planillas.length}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/85 shadow-[0_20px_40px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/90 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
              <tr>
                <th className="px-3 py-3">Colaborador</th>
                <th className="px-2 py-3 text-center">DNI</th>
                <th className="px-2 py-3 text-center">Días Trab.</th>
                <th className="px-2 py-3 text-right">Básico</th>
                <th className="px-2 py-3 text-right">Asig. Fam.</th>
                <th className="px-2 py-3 text-right">Sobretasa</th>
                <th className="bg-slate-100 px-2 py-3 text-right font-bold text-slate-800">Total Bruto</th>
                <th className="px-2 py-3 text-center">Pensión</th>
                <th className="px-2 py-3 text-right text-rose-600">Desc. AFP/ONP</th>
                <th className="px-2 py-3 text-right text-rose-600">Desc. Faltas</th>
                <th className="bg-rose-50 px-2 py-3 text-right font-bold text-rose-700">Total Desc.</th>
                <th className="bg-sky-50 px-3 py-3 text-right font-extrabold text-sky-900">Neto a Pagar</th>
                <th className="px-2 py-3 text-right text-emerald-700">EsSalud 9%</th>
                <th className="px-2 py-3 text-center">Boleta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <tr key={row.trabajadorId} className="transition-colors hover:bg-slate-50/80">
                  <td className="px-3 py-2.5">
                    <p className="font-bold text-slate-900">{row.nombre}</p>
                    <p className="text-[10px] text-slate-500">{row.cargo}</p>
                  </td>
                  <td className="px-2 py-2.5 text-center font-mono text-slate-600">{row.dni}</td>
                  <td className="px-2 py-2.5 text-center font-semibold text-slate-700">
                    {row.diasTrabajados + row.diasDescanso + row.diasVacaciones}
                  </td>
                  <td className="px-2 py-2.5 text-right font-mono">S/ {row.basicoProporcional.toFixed(2)}</td>
                  <td className="px-2 py-2.5 text-right font-mono">S/ {row.asigFamiliar.toFixed(2)}</td>
                  <td className="px-2 py-2.5 text-right font-mono">S/ {row.sobretasaNocturna.toFixed(2)}</td>
                  <td className="bg-slate-50 px-2 py-2.5 text-right font-mono font-bold text-slate-900">
                    S/ {row.totalBruto.toFixed(2)}
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    <span className="inline-flex rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                      {row.afp}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-right font-mono text-rose-600">-S/ {row.descuentoPension.toFixed(2)}</td>
                  <td className="px-2 py-2.5 text-right font-mono text-rose-600">-S/ {row.descuentoFaltas.toFixed(2)}</td>
                  <td className="bg-rose-50 px-2 py-2.5 text-right font-mono font-bold text-rose-700">
                    -S/ {row.totalDescuentos.toFixed(2)}
                  </td>
                  <td className="bg-sky-50 px-3 py-2.5 text-right font-mono font-black text-sky-900">
                    S/ {row.netoPagar.toFixed(2)}
                  </td>
                  <td className="px-2 py-2.5 text-right font-mono text-emerald-700">S/ {row.aporteEsSalud.toFixed(2)}</td>
                  <td className="px-2 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onViewBoleta(row)}
                        title="Ver boleta de pago"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-sky-700 transition-colors hover:bg-sky-100"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => handleExportBoleta(row)}
                        title="Descargar boleta PDF"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-rose-600 transition-colors hover:bg-rose-50"
                      >
                        <FileText size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-slate-200 bg-slate-100/90 font-bold text-slate-800">
              <tr>
                <td colSpan={6} className="px-3 py-2.5 text-right text-[11px] uppercase">
                  Totales del periodo:
                </td>
                <td className="px-2 py-2.5 text-right font-mono">S/ {totalBrutoGeneral.toFixed(2)}</td>
                <td colSpan={3} className="px-2 py-2.5 text-right font-mono text-rose-700">-S/ {totalDescuentosGeneral.toFixed(2)}</td>
                <td className="bg-rose-100 px-2 py-2.5 text-right font-mono text-rose-700">-S/ {totalDescuentosGeneral.toFixed(2)}</td>
                <td className="bg-sky-100 px-3 py-2.5 text-right font-mono text-sky-900">S/ {totalNetoGeneral.toFixed(2)}</td>
                <td className="px-2 py-2.5 text-right font-mono text-emerald-800">S/ {totalEsSaludGeneral.toFixed(2)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
