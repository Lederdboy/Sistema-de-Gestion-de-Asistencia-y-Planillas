import { jsPDF } from 'jspdf'

/**
 * Genera y descarga una Boleta de Pago oficial en PDF para un colaborador
 */
export function generarBoletaPDF(workerCalc, periodo = '2026-09') {
  if (!workerCalc) return

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 14

  // Encabezado Corporativo
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(15, 23, 42)
  doc.text('MINERA ANDINA S.A.', 14, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.text('R.U.C. 20489123891 · Av. Javier Prado Este 456, San Isidro, Lima', 14, y + 4.5)

  // Caja derecha tipo boleta
  doc.setDrawColor(30, 41, 59)
  doc.setLineWidth(0.4)
  doc.rect(pageWidth - 75, y - 4, 61, 14)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(15, 23, 42)
  doc.text('BOLETA DE PAGO DE HABERES', pageWidth - 72, y + 1.5)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`PERIODO: ${periodo} · D.S. 001-98-TR`, pageWidth - 72, y + 6.5)

  y += 18

  // Cuadro Datos Generales del Trabajador
  doc.setDrawColor(203, 213, 225)
  doc.setFillColor(248, 250, 252)
  doc.rect(14, y, pageWidth - 28, 24, 'FD')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(71, 85, 105)
  doc.text('DATOS DEL COLABORADOR', 17, y + 4.5)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(15, 23, 42)

  // Fila 1
  doc.setFont('helvetica', 'bold')
  doc.text('Colaborador:', 17, y + 9.5)
  doc.setFont('helvetica', 'normal')
  doc.text(`${workerCalc.nombre || ''}`, 40, y + 9.5)

  doc.setFont('helvetica', 'bold')
  doc.text('DNI / CE:', 115, y + 9.5)
  doc.setFont('helvetica', 'normal')
  doc.text(`${workerCalc.dni || ''}`, 132, y + 9.5)

  doc.setFont('helvetica', 'bold')
  doc.text('Régimen:', 160, y + 9.5)
  doc.setFont('helvetica', 'normal')
  doc.text('D.L. 728', 176, y + 9.5)

  // Fila 2
  doc.setFont('helvetica', 'bold')
  doc.text('Cargo / Puesto:', 17, y + 14.5)
  doc.setFont('helvetica', 'normal')
  doc.text(`${workerCalc.cargo || 'Operador'}`, 40, y + 14.5)

  doc.setFont('helvetica', 'bold')
  doc.text('Pensión:', 115, y + 14.5)
  doc.setFont('helvetica', 'normal')
  doc.text(`${(workerCalc.afp || 'INTEGRA').toUpperCase()}`, 132, y + 14.5)

  doc.setFont('helvetica', 'bold')
  doc.text('Situación:', 160, y + 14.5)
  doc.setFont('helvetica', 'normal')
  doc.text('ACTIVO', 176, y + 14.5)

  // Fila 3
  doc.setFont('helvetica', 'bold')
  doc.text('Días Laborados:', 17, y + 19.5)
  doc.setFont('helvetica', 'normal')
  doc.text(`${workerCalc.diasTrabajados || 30} días`, 40, y + 19.5)

  doc.setFont('helvetica', 'bold')
  doc.text('Descansos:', 70, y + 19.5)
  doc.setFont('helvetica', 'normal')
  doc.text(`${workerCalc.diasDescanso || 0} d`, 88, y + 19.5)

  doc.setFont('helvetica', 'bold')
  doc.text('Faltas:', 115, y + 19.5)
  doc.setFont('helvetica', 'normal')
  doc.text(`${workerCalc.diasFalta || 0} d`, 132, y + 19.5)

  doc.setFont('helvetica', 'bold')
  doc.text('Básico Mensual:', 150, y + 19.5)
  doc.setFont('helvetica', 'normal')
  doc.text(`S/ ${(workerCalc.sueldoBase || 1500).toFixed(2)}`, 175, y + 19.5)

  y += 29

  // Columnas de Remuneraciones y Descuentos
  const colWidth = (pageWidth - 32) / 2
  const leftX = 14
  const rightX = 14 + colWidth + 4

  // Tabla Ingresos (Izquierda)
  doc.setFillColor(241, 245, 249)
  doc.rect(leftX, y, colWidth, 6, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(15, 23, 42)
  doc.text('INGRESOS Y CONCEPTOS COMPUTABLES', leftX + 3, y + 4.2)
  doc.text('IMPORTE', leftX + colWidth - 16, y + 4.2)

  let ingY = y + 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)

  const itemsIngresos = [
    { desc: '0121 Remuneración Básica', monto: workerCalc.basicoProporcional || workerCalc.sueldoBase || 0 },
    { desc: '0201 Asignación Familiar (Ley 25129)', monto: workerCalc.asigFamiliar || 0 },
    { desc: '0105 Sobretasa Nocturna / Horas Extras', monto: workerCalc.sobretasaNocturna || 0 },
  ].filter(i => i.monto > 0)

  itemsIngresos.forEach(item => {
    doc.text(item.desc, leftX + 3, ingY)
    doc.text(`S/ ${item.monto.toFixed(2)}`, leftX + colWidth - 3, ingY, { align: 'right' })
    ingY += 5.5
  })

  // Tabla Descuentos (Derecha)
  doc.setFillColor(254, 242, 242)
  doc.rect(rightX, y, colWidth, 6, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(159, 18, 57)
  doc.text('DESCUENTOS AL TRABAJADOR', rightX + 3, y + 4.2)
  doc.text('IMPORTE', rightX + colWidth - 16, y + 4.2)

  let descY = y + 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(15, 23, 42)

  const itemsDescuentos = [
    { desc: `0605 Aporte Fondo Jubilación ${(workerCalc.afp || 'AFP').toUpperCase()}`, monto: workerCalc.descuentoPension || 0 },
    { desc: '0701 Descuento por Faltas / Inasistencias', monto: workerCalc.descuentoFaltas || 0 },
  ].filter(i => i.monto > 0)

  itemsDescuentos.forEach(item => {
    doc.text(item.desc, rightX + 3, descY)
    doc.text(`-S/ ${item.monto.toFixed(2)}`, rightX + colWidth - 3, descY, { align: 'right' })
    descY += 5.5
  })

  const maxY = Math.max(ingY, descY, y + 36)
  y = maxY + 2

  // Totales
  doc.setDrawColor(203, 213, 225)
  doc.line(14, y, pageWidth - 14, y)
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.text('TOTAL REMUNERACIÓN BRUTA:', leftX + 3, y)
  doc.text(`S/ ${(workerCalc.totalBruto || 0).toFixed(2)}`, leftX + colWidth - 3, y, { align: 'right' })

  doc.text('TOTAL DESCUENTOS:', rightX + 3, y)
  doc.setTextColor(225, 29, 72)
  doc.text(`-S/ ${(workerCalc.totalDescuentos || 0).toFixed(2)}`, rightX + colWidth - 3, y, { align: 'right' })
  doc.setTextColor(15, 23, 42)

  y += 8

  // Cuadro Neto a Pagar
  doc.setFillColor(240, 249, 255)
  doc.setDrawColor(186, 230, 253)
  doc.rect(14, y, pageWidth - 28, 12, 'FD')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(3, 105, 161)
  doc.text('NETO A PAGAR AL COLABORADOR:', 18, y + 7.5)

  doc.setFontSize(11)
  doc.text(`S/ ${(workerCalc.netoPagar || 0).toFixed(2)}`, pageWidth - 18, y + 7.5, { align: 'right' })

  y += 18

  // Aportes del Empleador
  doc.setFillColor(240, 253, 244)
  doc.setDrawColor(187, 247, 208)
  doc.rect(14, y, pageWidth - 28, 8, 'FD')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(22, 101, 52)
  doc.text('APORTES DEL EMPLEADOR (NO AFECTA AL SUELDO NETO):', 18, y + 5)
  doc.setFont('helvetica', 'normal')
  doc.text(`EsSalud (9%): S/ ${(workerCalc.aporteEsSalud || 0).toFixed(2)}  ·  Seguro Vida Ley Cubierto`, 110, y + 5)

  y += 16

  // Firmas
  y = Math.max(y, 160)
  doc.setDrawColor(71, 85, 105)
  doc.setLineWidth(0.3)

  // Línea Empleador
  doc.line(30, y + 16, 85, y + 16)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text('EMPLEADOR', 57, y + 20, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(100, 116, 139)
  doc.text('Minera Andina S.A. · RUC 20489123891', 57, y + 23.5, { align: 'center' })
  doc.text('Firma Digital Autorizada', 57, y + 26.5, { align: 'center' })

  // Línea Trabajador
  doc.line(pageWidth - 85, y + 16, pageWidth - 30, y + 16)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text('TRABAJADOR', pageWidth - 57, y + 20, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(100, 116, 139)
  doc.text(`${workerCalc.nombre || ''}`, pageWidth - 57, y + 23.5, { align: 'center' })
  doc.text(`DNI: ${workerCalc.dni || ''} · Conforme`, pageWidth - 57, y + 26.5, { align: 'center' })

  // Pie de página legal
  doc.setFontSize(6.5)
  doc.setTextColor(148, 163, 184)
  doc.text(
    `Documento electrónico generado según D.S. 001-98-TR y R.M. 020-2008-TR · Código de verificación: PLAME-${periodo}-${workerCalc.dni || '0000'}`,
    pageWidth / 2,
    y + 35,
    { align: 'center' }
  )

  const filename = `Boleta_Pago_${periodo}_${workerCalc.dni || 'trabajador'}.pdf`
  doc.save(filename)
  return filename
}

/**
 * Genera y descarga un lote masivo con las boletas de pago de todos los trabajadores en un único archivo PDF
 */
export function generarLoteBoletasPDF(workersCalcList, periodo = '2026-09') {
  if (!workersCalcList || workersCalcList.length === 0) return

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  workersCalcList.forEach((workerCalc, idx) => {
    if (idx > 0) {
      doc.addPage()
    }

    const pageWidth = doc.internal.pageSize.getWidth()
    let y = 14

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(15, 23, 42)
    doc.text('MINERA ANDINA S.A.', 14, y)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text('R.U.C. 20489123891 · Av. Javier Prado Este 456, San Isidro, Lima', 14, y + 4.5)

    doc.setDrawColor(30, 41, 59)
    doc.setLineWidth(0.4)
    doc.rect(pageWidth - 75, y - 4, 61, 14)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(15, 23, 42)
    doc.text('BOLETA DE PAGO DE HABERES', pageWidth - 72, y + 1.5)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(`PERIODO: ${periodo} · D.S. 001-98-TR`, pageWidth - 72, y + 6.5)

    y += 18

    doc.setDrawColor(203, 213, 225)
    doc.setFillColor(248, 250, 252)
    doc.rect(14, y, pageWidth - 28, 24, 'FD')

    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(71, 85, 105)
    doc.text('DATOS DEL COLABORADOR', 17, y + 4.5)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(15, 23, 42)

    doc.setFont('helvetica', 'bold')
    doc.text('Colaborador:', 17, y + 9.5)
    doc.setFont('helvetica', 'normal')
    doc.text(`${workerCalc.nombre || ''}`, 40, y + 9.5)

    doc.setFont('helvetica', 'bold')
    doc.text('DNI / CE:', 115, y + 9.5)
    doc.setFont('helvetica', 'normal')
    doc.text(`${workerCalc.dni || ''}`, 132, y + 9.5)

    doc.setFont('helvetica', 'bold')
    doc.text('Régimen:', 160, y + 9.5)
    doc.setFont('helvetica', 'normal')
    doc.text('D.L. 728', 176, y + 9.5)

    doc.setFont('helvetica', 'bold')
    doc.text('Cargo / Puesto:', 17, y + 14.5)
    doc.setFont('helvetica', 'normal')
    doc.text(`${workerCalc.cargo || 'Operador'}`, 40, y + 14.5)

    doc.setFont('helvetica', 'bold')
    doc.text('Pensión:', 115, y + 14.5)
    doc.setFont('helvetica', 'normal')
    doc.text(`${(workerCalc.afp || 'INTEGRA').toUpperCase()}`, 132, y + 14.5)

    doc.setFont('helvetica', 'bold')
    doc.text('Situación:', 160, y + 14.5)
    doc.setFont('helvetica', 'normal')
    doc.text('ACTIVO', 176, y + 14.5)

    doc.setFont('helvetica', 'bold')
    doc.text('Días Laborados:', 17, y + 19.5)
    doc.setFont('helvetica', 'normal')
    doc.text(`${workerCalc.diasTrabajados || 30} días`, 40, y + 19.5)

    doc.setFont('helvetica', 'bold')
    doc.text('Descansos:', 70, y + 19.5)
    doc.setFont('helvetica', 'normal')
    doc.text(`${workerCalc.diasDescanso || 0} d`, 88, y + 19.5)

    doc.setFont('helvetica', 'bold')
    doc.text('Faltas:', 115, y + 19.5)
    doc.setFont('helvetica', 'normal')
    doc.text(`${workerCalc.diasFalta || 0} d`, 132, y + 19.5)

    doc.setFont('helvetica', 'bold')
    doc.text('Básico Mensual:', 150, y + 19.5)
    doc.setFont('helvetica', 'normal')
    doc.text(`S/ ${(workerCalc.sueldoBase || 1500).toFixed(2)}`, 175, y + 19.5)

    y += 29

    const colWidth = (pageWidth - 32) / 2
    const leftX = 14
    const rightX = 14 + colWidth + 4

    doc.setFillColor(241, 245, 249)
    doc.rect(leftX, y, colWidth, 6, 'FD')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(15, 23, 42)
    doc.text('INGRESOS Y CONCEPTOS COMPUTABLES', leftX + 3, y + 4.2)
    doc.text('IMPORTE', leftX + colWidth - 16, y + 4.2)

    let ingY = y + 10
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)

    const itemsIngresos = [
      { desc: '0121 Remuneración Básica', monto: workerCalc.basicoProporcional || workerCalc.sueldoBase || 0 },
      { desc: '0201 Asignación Familiar (Ley 25129)', monto: workerCalc.asigFamiliar || 0 },
      { desc: '0105 Sobretasa Nocturna / Horas Extras', monto: workerCalc.sobretasaNocturna || 0 },
    ].filter(i => i.monto > 0)

    itemsIngresos.forEach(item => {
      doc.text(item.desc, leftX + 3, ingY)
      doc.text(`S/ ${item.monto.toFixed(2)}`, leftX + colWidth - 3, ingY, { align: 'right' })
      ingY += 5.5
    })

    doc.setFillColor(254, 242, 242)
    doc.rect(rightX, y, colWidth, 6, 'FD')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(159, 18, 57)
    doc.text('DESCUENTOS AL TRABAJADOR', rightX + 3, y + 4.2)
    doc.text('IMPORTE', rightX + colWidth - 16, y + 4.2)

    let descY = y + 10
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(15, 23, 42)

    const itemsDescuentos = [
      { desc: `0605 Aporte Fondo Jubilación ${(workerCalc.afp || 'AFP').toUpperCase()}`, monto: workerCalc.descuentoPension || 0 },
      { desc: '0701 Descuento por Faltas / Inasistencias', monto: workerCalc.descuentoFaltas || 0 },
    ].filter(i => i.monto > 0)

    itemsDescuentos.forEach(item => {
      doc.text(item.desc, rightX + 3, descY)
      doc.text(`-S/ ${item.monto.toFixed(2)}`, rightX + colWidth - 3, descY, { align: 'right' })
      descY += 5.5
    })

    const maxY = Math.max(ingY, descY, y + 36)
    y = maxY + 2

    doc.setDrawColor(203, 213, 225)
    doc.line(14, y, pageWidth - 14, y)
    y += 5

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.text('TOTAL REMUNERACIÓN BRUTA:', leftX + 3, y)
    doc.text(`S/ ${(workerCalc.totalBruto || 0).toFixed(2)}`, leftX + colWidth - 3, y, { align: 'right' })

    doc.text('TOTAL DESCUENTOS:', rightX + 3, y)
    doc.setTextColor(225, 29, 72)
    doc.text(`-S/ ${(workerCalc.totalDescuentos || 0).toFixed(2)}`, rightX + colWidth - 3, y, { align: 'right' })
    doc.setTextColor(15, 23, 42)

    y += 8

    doc.setFillColor(240, 249, 255)
    doc.setDrawColor(186, 230, 253)
    doc.rect(14, y, pageWidth - 28, 12, 'FD')

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(3, 105, 161)
    doc.text('NETO A PAGAR AL COLABORADOR:', 18, y + 7.5)

    doc.setFontSize(11)
    doc.text(`S/ ${(workerCalc.netoPagar || 0).toFixed(2)}`, pageWidth - 18, y + 7.5, { align: 'right' })

    y += 18

    doc.setFillColor(240, 253, 244)
    doc.setDrawColor(187, 247, 208)
    doc.rect(14, y, pageWidth - 28, 8, 'FD')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(22, 101, 52)
    doc.text('APORTES DEL EMPLEADOR (NO AFECTA AL SUELDO NETO):', 18, y + 5)
    doc.setFont('helvetica', 'normal')
    doc.text(`EsSalud (9%): S/ ${(workerCalc.aporteEsSalud || 0).toFixed(2)}  ·  Seguro Vida Ley Cubierto`, 110, y + 5)

    y += 16
    y = Math.max(y, 160)
    doc.setDrawColor(71, 85, 105)
    doc.setLineWidth(0.3)

    doc.line(30, y + 16, 85, y + 16)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 23, 42)
    doc.text('EMPLEADOR', 57, y + 20, { align: 'center' })

    doc.line(pageWidth - 85, y + 16, pageWidth - 30, y + 16)
    doc.text('TRABAJADOR', pageWidth - 57, y + 20, { align: 'center' })

    doc.setFontSize(6.5)
    doc.setTextColor(148, 163, 184)
    doc.text(
      `Página ${idx + 1} de ${workersCalcList.length} · Generado el ${new Date().toLocaleDateString('es-PE')}`,
      pageWidth / 2,
      y + 35,
      { align: 'center' }
    )
  })

  const filename = `Lote_Boletas_Oficiales_${periodo}.pdf`
  doc.save(filename)
  return filename
}
