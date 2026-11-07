import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

/**
 * Servicio para generación y descarga real de archivos Excel (.xlsx) y archivos bancarios/SUNAT (.txt)
 */

// Helper para descargar archivos de texto en el navegador
function downloadBlob(content: string, filename: string, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 1. Exporta la planilla completa consolidada a Excel (.xlsx)
 */
export function exportarPlanillaExcel(planillas: any[], periodo = '2026-09') {
  if (!planillas || planillas.length === 0) return

  const rows: any[] = planillas.map((p: any, idx: number) => ({
    'N°': idx + 1,
    'DNI': p.dni || '',
    'Colaborador': p.nombre || '',
    'Sede': p.sede || 'Principal',
    'Cargo': p.cargo || '',
    'Régimen Pensión': (p.afp || 'AFP').toUpperCase(),
    'CUSPP': p.cuspp || '-',
    'Días Trab.': p.diasTrabajados || 30,
    'Sueldo Básico (S/)': Number((p.sueldoBase || 0).toFixed(2)),
    'Asig. Familiar (S/)': Number((p.asigFamiliar || 0).toFixed(2)),
    'Horas Extras (S/)': Number((p.horasExtrasMonto || 0).toFixed(2)),
    'Bonificaciones (S/)': Number((p.bonificaciones || 0).toFixed(2)),
    'Total Bruto (S/)': Number((p.totalBruto || 0).toFixed(2)),
    'Aporte AFP/ONP (S/)': Number((p.descuentoPension || 0).toFixed(2)),
    'Impuesto 5ta Cat (S/)': Number((p.renta5ta || 0).toFixed(2)),
    'Total Descuentos (S/)': Number((p.totalDescuentos || 0).toFixed(2)),
    'Neto a Pagar (S/)': Number((p.netoPagar || 0).toFixed(2)),
    'Aporte EsSalud 9% (S/)': Number((p.aporteEsSalud || 0).toFixed(2)),
  }))

  // Fila de totales
  const totalBruto = planillas.reduce((acc: number, p: any) => acc + (p.totalBruto || 0), 0)
  const totalDesc = planillas.reduce((acc: number, p: any) => acc + (p.totalDescuentos || 0), 0)
  const totalNeto = planillas.reduce((acc: number, p: any) => acc + (p.netoPagar || 0), 0)
  const totalEssalud = planillas.reduce((acc: number, p: any) => acc + (p.aporteEsSalud || 0), 0)

  rows.push({
    'N°': '',
    'DNI': '',
    'Colaborador': 'TOTALES GENERALES',
    'Sede': '',
    'Cargo': '',
    'Régimen Pensión': '',
    'CUSPP': '',
    'Días Trab.': '',
    'Sueldo Básico (S/)': '',
    'Asig. Familiar (S/)': '',
    'Horas Extras (S/)': '',
    'Bonificaciones (S/)': '',
    'Total Bruto (S/)': Number(totalBruto.toFixed(2)),
    'Aporte AFP/ONP (S/)': '',
    'Impuesto 5ta Cat (S/)': '',
    'Total Descuentos (S/)': Number(totalDesc.toFixed(2)),
    'Neto a Pagar (S/)': Number(totalNeto.toFixed(2)),
    'Aporte EsSalud 9% (S/)': Number(totalEssalud.toFixed(2)),
  })

  const worksheet = XLSX.utils.json_to_sheet(rows)

  // Ajuste de anchos de columna automáticos
  const colWidths = [
    { wch: 5 },  // N°
    { wch: 11 }, // DNI
    { wch: 32 }, // Colaborador
    { wch: 20 }, // Sede
    { wch: 22 }, // Cargo
    { wch: 16 }, // Régimen
    { wch: 14 }, // CUSPP
    { wch: 10 }, // Días
    { wch: 16 }, // Básico
    { wch: 16 }, // Asig Fam
    { wch: 16 }, // HE
    { wch: 16 }, // Bonif
    { wch: 16 }, // Total Bruto
    { wch: 18 }, // Aporte Pensión
    { wch: 18 }, // 5ta Cat
    { wch: 18 }, // Total Descuentos
    { wch: 18 }, // Neto Pagar
    { wch: 18 }, // EsSalud
  ]
  worksheet['!cols'] = colWidths

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, `Planilla ${periodo}`)

  XLSX.writeFile(workbook, `Planilla_Consolidada_${periodo}.xlsx`)
}

/**
 * 2. Exporta el récord vacacional general a Excel (.xlsx)
 */
export function exportarTareoExcel(workers: any[], periodo = '2026-09', sedes: any[] = [], empresas: any[] = []) {
  if (!workers || workers.length === 0) return

  const daysHeaders = Array.from({ length: 30 }, (_, i) => `Día ${i + 1}`)
  const headers = [
    'N°',
    'Colaborador',
    'DNI',
    'Cargo',
    'Sede',
    'Empresa',
    ...daysHeaders,
    'D (Día)',
    'N (Noche)',
    'F (Falta)',
    'DL (Descanso)',
    'V (Vacaciones)',
    'Total Asistidos',
  ]

  const countCode = (tareo: string[], code: string) => (tareo || []).filter((c) => c === code).length

  const rows = workers.map((w: any, index: number) => {
    const sedeObj = sedes.find((s) => String(s.id) === String(w.sedeId))
    const empresaObj = empresas.find((e) => String(e.id) === String(w.empresaId))
    const tareo = w.tareo || []
    const dCount = countCode(tareo, 'D')
    const nCount = countCode(tareo, 'N')
    const fCount = countCode(tareo, 'F')
    const dlCount = countCode(tareo, 'DL')
    const vCount = countCode(tareo, 'V')
    const totalAsistidos = dCount + nCount
    const daysCols = Array.from({ length: 30 }, (_, d) => tareo[d] || 'DL')

    return [
      index + 1,
      w.nombre,
      w.dni,
      w.cargo,
      sedeObj?.nombre || 'Sede Central',
      empresaObj?.nombre || 'Empresa Principal',
      ...daysCols,
      dCount,
      nCount,
      fCount,
      dlCount,
      vCount,
      totalAsistidos,
    ]
  })

  const totalD = workers.reduce((acc, w) => acc + countCode(w.tareo, 'D'), 0)
  const totalN = workers.reduce((acc, w) => acc + countCode(w.tareo, 'N'), 0)
  const totalF = workers.reduce((acc, w) => acc + countCode(w.tareo, 'F'), 0)
  const totalDL = workers.reduce((acc, w) => acc + countCode(w.tareo, 'DL'), 0)
  const totalV = workers.reduce((acc, w) => acc + countCode(w.tareo, 'V'), 0)
  const totalEfectivos = totalD + totalN

  const totalsRow = [
    '',
    'TOTALES GENERALES',
    '',
    '',
    '',
    '',
    ...Array.from({ length: 30 }, () => ''),
    totalD,
    totalN,
    totalF,
    totalDL,
    totalV,
    totalEfectivos,
  ]

  const headerTitle = ['SISTEMA DE ASISTENCIA Y PLANILLAS - MATRIZ DE TAREO MENSUAL']
  const headerSub = [`Periodo: ${periodo} | Total Colaboradores: ${workers.length} | Descargado: ${new Date().toLocaleDateString('es-PE')}`]
  const emptyRow: any[] = []

  const sheetData = [
    headerTitle,
    headerSub,
    emptyRow,
    headers,
    ...rows,
    totalsRow,
  ]

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData)
  worksheet['!cols'] = [
    { wch: 5 },
    { wch: 32 },
    { wch: 12 },
    { wch: 28 },
    { wch: 30 },
    { wch: 35 },
    ...Array.from({ length: 30 }, () => ({ wch: 5 })),
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 10 },
    { wch: 10 },
    { wch: 14 },
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, `Tareo_${periodo}`)
  XLSX.writeFile(workbook, `Tareo_Mensual_${periodo}_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

/**
 * 2. Exporta el récord vacacional general a Excel (.xlsx)
 */
export function exportarRecordVacacionalExcel(workersWithRecord: any[]) {
  if (!workersWithRecord || workersWithRecord.length === 0) return

  const rows = workersWithRecord.map((w: any, idx: number) => {
    const rec = w.record || {}
    return {
      'N°': idx + 1,
      'DNI': w.dni || '',
      'Colaborador': w.nombre || '',
      'Sede': w.sede || 'Principal',
      'Cargo': w.cargo || '',
      'Fecha Ingreso': w.fechaIngreso || '2023-01-15',
      'Derecho Anual (días)': 30,
      'Días Gozados': rec.diasGozados ?? rec.gozados ?? 0,
      'Días Vendidos': rec.diasVendidos ?? rec.vendidos ?? 0,
      'Saldo Pendiente (días)': rec.saldoPendiente ?? rec.saldo ?? 30,
      'Estado Alerta': rec.estadoRecord ?? rec.estado ?? 'Al Día',
    }
  })

  const worksheet = XLSX.utils.json_to_sheet(rows)
  worksheet['!cols'] = [
    { wch: 5 },
    { wch: 11 },
    { wch: 32 },
    { wch: 20 },
    { wch: 22 },
    { wch: 14 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 20 },
    { wch: 16 },
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Récord Vacacional')
  XLSX.writeFile(workbook, `Record_Vacacional_Consolidado_2026.xlsx`)
}

/**
 * 3. Exporta archivo de dispersión bancaria TXT (formato Telecrédito BCP / BBVA)
 */
export function exportarDispersiónBancariaTxt(planillas, periodo = '2026-09') {
  if (!planillas || planillas.length === 0) return

  const rucEmpresa = '20489123891'
  const cuentaCargo = '191-23847291-0-22'
  const fechaProceso = new Date().toISOString().slice(0, 10).replace(/-/g, '')

  // Cabecera Telecrédito
  let txt = `700${rucEmpresa}PE${cuentaCargo}S${fechaProceso}HABERES ${periodo}\n`

  // Líneas de abono a cada trabajador
  planillas.forEach((p, index) => {
    const correlativo = String(index + 1).padStart(6, '0')
    const tipoDoc = '1' // 1: DNI
    const numDoc = (p.dni || '00000000').padEnd(12, ' ')
    const nombre = (p.nombre || '').slice(0, 40).padEnd(40, ' ')
    const cuentaAbono = (p.cuentaBancaria || `191-${p.dni}0-1-00`).padEnd(20, ' ')
    const montoCentavos = Math.round((p.netoPagar || 0) * 100)
    const montoS = String(montoCentavos).padStart(15, '0')

    txt += `P${correlativo}${tipoDoc}${numDoc}${nombre}${cuentaAbono}${montoS}S\n`
  })

  downloadBlob(txt, `pagos_haberes_${periodo}_bcp.txt`)
}

/**
 * 4. Exporta archivos SUNAT PDT 601 PLAME (.rem)
 */
export function exportarPlameRemTxt(planillas, periodo = '2026-09') {
  if (!planillas || planillas.length === 0) return

  const periodoStr = periodo.replace('-', '') // 202609
  let txt = ''

  planillas.forEach((p) => {
    const dni = p.dni || '00000000'
    // Concepto 0121 - Básico
    txt += `01|${dni}|0121|${(p.basicoProporcional || p.sueldoBase || 0).toFixed(2)}|${(p.basicoProporcional || p.sueldoBase || 0).toFixed(2)}|\n`
    // Concepto 0201 - Asignación Familiar
    if (p.asigFamiliar > 0) {
      txt += `01|${dni}|0201|${p.asigFamiliar.toFixed(2)}|${p.asigFamiliar.toFixed(2)}|\n`
    }
    // Concepto 0107 - Horas Extras
    if (p.horasExtrasMonto > 0) {
      txt += `01|${dni}|0107|${p.horasExtrasMonto.toFixed(2)}|${p.horasExtrasMonto.toFixed(2)}|\n`
    }
    // Concepto 0605 - Retención AFP
    if (p.descuentoPension > 0) {
      txt += `01|${dni}|0605|${p.descuentoPension.toFixed(2)}|${p.descuentoPension.toFixed(2)}|\n`
    }
  })

  downloadBlob(txt, `0601${periodoStr}20489123891.rem`)
}

/**
 * 5. Exporta archivo AFP Net TXT
 */
export function exportarAfpNetTxt(planillas, periodo = '2026-09') {
  if (!planillas || planillas.length === 0) return

  let txt = ''
  planillas.forEach((p, idx) => {
    const cuspp = (p.cuspp || '612341ABCDE0').padEnd(12, ' ')
    const dni = (p.dni || '00000000').padEnd(10, ' ')
    const partes = (p.nombre || '').split(' ')
    const apPaterno = (partes[0] || '').padEnd(20, ' ')
    const apMaterno = (partes[1] || '').padEnd(20, ' ')
    const nombres = (partes.slice(2).join(' ') || partes[0] || '').padEnd(20, ' ')
    const remu = (p.totalBruto || 0).toFixed(2).padStart(10, '0')

    txt += `${idx + 1}|${cuspp}|1|${dni}|${apPaterno}|${apMaterno}|${nombres}|S|${remu}|0.00|0.00|\n`
  })

  downloadBlob(txt, `AFP_NET_${periodo.replace('-', '')}.txt`)
}

@Injectable({
  providedIn: 'root',
})
export class ExcelService {
  exportarPlanillaExcel(planillas: any[], periodo = '2026-09') {
    return exportarPlanillaExcel(planillas, periodo);
  }

  exportarTareoExcel(workers: any[], periodo = '2026-09', sedes: any[] = [], empresas: any[] = []) {
    return exportarTareoExcel(workers, periodo, sedes, empresas);
  }

  exportarRecordVacacionalExcel(workersWithRecord: any[]) {
    return exportarRecordVacacionalExcel(workersWithRecord);
  }

  exportarDispersiónBancariaTxt(planillas: any[], periodo = '2026-09') {
    return exportarDispersiónBancariaTxt(planillas, periodo);
  }

  exportarPlameRemTxt(planillas: any[], periodo = '2026-09') {
    return exportarPlameRemTxt(planillas, periodo);
  }

  exportarAfpNetTxt(planillas: any[], periodo = '2026-09') {
    return exportarAfpNetTxt(planillas, periodo);
  }
}
