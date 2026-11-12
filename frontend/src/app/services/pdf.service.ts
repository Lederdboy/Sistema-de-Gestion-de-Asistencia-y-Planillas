import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { PlanillaItem } from '../models/planilla.model';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  generarBoletaPDF(workerCalc: PlanillaItem, periodo = '2026-09'): string | null {
    if (!workerCalc) return null;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 14;

    // Encabezado Corporativo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text('MINERA ANDINA S.A.', 14, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('R.U.C. 20489123891 · Av. Javier Prado Este 456, San Isidro, Lima', 14, y + 4.5);

    // Caja derecha tipo boleta
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.4);
    doc.rect(pageWidth - 75, y - 4, 61, 14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('BOLETA DE PAGO DE HABERES', pageWidth - 72, y + 1.5);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`PERIODO: ${periodo} · D.S. 001-98-TR`, pageWidth - 72, y + 6.5);

    y += 18;

    // Cuadro Datos Generales del Trabajador
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y, pageWidth - 28, 24, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('DATOS DEL COLABORADOR', 17, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);

    // Fila 1
    doc.setFont('helvetica', 'bold');
    doc.text('Colaborador:', 17, y + 9.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${workerCalc.nombre || ''}`, 40, y + 9.5);

    doc.setFont('helvetica', 'bold');
    doc.text('DNI / CE:', 115, y + 9.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${workerCalc.dni || ''}`, 132, y + 9.5);

    doc.setFont('helvetica', 'bold');
    doc.text('Régimen:', 160, y + 9.5);
    doc.setFont('helvetica', 'normal');
    doc.text('D.L. 728', 176, y + 9.5);

    // Fila 2
    doc.setFont('helvetica', 'bold');
    doc.text('Cargo / Puesto:', 17, y + 14.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${workerCalc.cargo || 'Operador'}`, 40, y + 14.5);

    doc.setFont('helvetica', 'bold');
    doc.text('Pensión:', 115, y + 14.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${(workerCalc.afp || 'INTEGRA').toUpperCase()}`, 132, y + 14.5);

    doc.setFont('helvetica', 'bold');
    doc.text('Situación:', 160, y + 14.5);
    doc.setFont('helvetica', 'normal');
    doc.text('ACTIVO', 176, y + 14.5);

    // Fila 3
    doc.setFont('helvetica', 'bold');
    doc.text('Días Laborados:', 17, y + 19.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${workerCalc.diasTrabajados || 30} días`, 40, y + 19.5);

    doc.setFont('helvetica', 'bold');
    doc.text('Descansos:', 70, y + 19.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${workerCalc.diasDescanso || 0} d`, 88, y + 19.5);

    doc.setFont('helvetica', 'bold');
    doc.text('Faltas:', 115, y + 19.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${workerCalc.diasFalta || 0} d`, 132, y + 19.5);

    doc.setFont('helvetica', 'bold');
    doc.text('Básico Mensual:', 150, y + 19.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`S/ ${(workerCalc.sueldoBase || 1500).toFixed(2)}`, 175, y + 19.5);

    y += 29;

    // Columnas de Remuneraciones y Descuentos
    const colWidth = (pageWidth - 32) / 2;
    const leftX = 14;
    const rightX = 14 + colWidth + 4;

    // Tabla Ingresos
    doc.setFillColor(241, 245, 249);
    doc.rect(leftX, y, colWidth, 6, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('INGRESOS Y CONCEPTOS COMPUTABLES', leftX + 3, y + 4.2);
    doc.text('IMPORTE', leftX + colWidth - 16, y + 4.2);

    let ingY = y + 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    const itemsIngresos = [
      { desc: '0121 Remuneración Básica', monto: workerCalc.basicoProporcional || workerCalc.sueldoBase || 0 },
      { desc: '0201 Asignación Familiar (Ley 25129)', monto: workerCalc.asigFamiliar || 0 },
      { desc: '0105 Sobretasa Nocturna / Horas Extras', monto: workerCalc.sobretasaNocturna || 0 },
    ].filter(i => i.monto > 0);

    itemsIngresos.forEach(item => {
      doc.text(item.desc, leftX + 3, ingY);
      doc.text(`S/ ${item.monto.toFixed(2)}`, leftX + colWidth - 3, ingY, { align: 'right' });
      ingY += 5.5;
    });

    // Tabla Descuentos
    doc.setFillColor(254, 242, 242);
    doc.rect(rightX, y, colWidth, 6, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(159, 18, 57);
    doc.text('DESCUENTOS AL TRABAJADOR', rightX + 3, y + 4.2);
    doc.text('IMPORTE', rightX + colWidth - 16, y + 4.2);

    let descY = y + 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);

    const itemsDescuentos = [
      { desc: `0605 Aporte Fondo Jubilación ${(workerCalc.afp || 'AFP').toUpperCase()}`, monto: workerCalc.descuentoPension || 0 },
      { desc: '0701 Descuento por Faltas / Inasistencias', monto: workerCalc.descuentoFaltas || 0 },
    ].filter(i => i.monto > 0);

    itemsDescuentos.forEach(item => {
      doc.text(item.desc, rightX + 3, descY);
      doc.text(`-S/ ${item.monto.toFixed(2)}`, rightX + colWidth - 3, descY, { align: 'right' });
      descY += 5.5;
    });

    const maxY = Math.max(ingY, descY, y + 36);
    y = maxY + 2;

    // Totales
    doc.setDrawColor(203, 213, 225);
    doc.line(14, y, pageWidth - 14, y);
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('TOTAL REMUNERACIÓN BRUTA:', leftX + 3, y);
    doc.text(`S/ ${(workerCalc.totalBruto || 0).toFixed(2)}`, leftX + colWidth - 3, y, { align: 'right' });

    doc.text('TOTAL DESCUENTOS:', rightX + 3, y);
    doc.setTextColor(225, 29, 72);
    doc.text(`-S/ ${(workerCalc.totalDescuentos || 0).toFixed(2)}`, rightX + colWidth - 3, y, { align: 'right' });
    doc.setTextColor(15, 23, 42);

    y += 8;

    // Cuadro Neto a Pagar
    doc.setFillColor(240, 249, 255);
    doc.setDrawColor(186, 230, 253);
    doc.rect(14, y, pageWidth - 28, 12, 'FD');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(3, 105, 161);
    doc.text('NETO A PAGAR AL COLABORADOR:', 18, y + 7.5);

    doc.setFontSize(11);
    doc.text(`S/ ${(workerCalc.netoPagar || 0).toFixed(2)}`, pageWidth - 18, y + 7.5, { align: 'right' });

    y += 18;

    // Aportes del Empleador
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.rect(14, y, pageWidth - 28, 8, 'FD');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 101, 52);
    doc.text('APORTES DEL EMPLEADOR (NO AFECTA AL SUELDO NETO):', 18, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(`EsSalud (9%): S/ ${(workerCalc.aporteEsSalud || 0).toFixed(2)}  ·  Seguro Vida Ley Cubierto`, 110, y + 5);

    y += 16;
    y = Math.max(y, 160);
    doc.setDrawColor(71, 85, 105);
    doc.setLineWidth(0.3);

    // Líneas firmas
    doc.line(30, y + 16, 85, y + 16);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('EMPLEADOR', 57, y + 20, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('Minera Andina S.A. · RUC 20489123891', 57, y + 23.5, { align: 'center' });
    doc.text('Firma Digital Autorizada', 57, y + 26.5, { align: 'center' });

    doc.line(pageWidth - 85, y + 16, pageWidth - 30, y + 16);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('TRABAJADOR', pageWidth - 57, y + 20, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`${workerCalc.nombre || ''}`, pageWidth - 57, y + 23.5, { align: 'center' });
    doc.text(`DNI: ${workerCalc.dni || ''} · Conforme`, pageWidth - 57, y + 26.5, { align: 'center' });

    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Documento electrónico generado según D.S. 001-98-TR y R.M. 020-2008-TR · Código de verificación: PLAME-${periodo}-${workerCalc.dni || '0000'}`,
      pageWidth / 2,
      y + 35,
      { align: 'center' }
    );

    const filename = `Boleta_Pago_${periodo}_${workerCalc.dni || 'trabajador'}.pdf`;
    doc.save(filename);
    return filename;
  }

  generarLoteBoletasPDF(workersCalcList: PlanillaItem[], periodo = '2026-09'): string | null {
    if (!workersCalcList || workersCalcList.length === 0) return null;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    workersCalcList.forEach((workerCalc, idx) => {
      if (idx > 0) doc.addPage();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 14;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text('MINERA ANDINA S.A.', 14, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('R.U.C. 20489123891 · Av. Javier Prado Este 456, San Isidro, Lima', 14, y + 4.5);

      doc.setDrawColor(30, 41, 59);
      doc.setLineWidth(0.4);
      doc.rect(pageWidth - 75, y - 4, 61, 14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('BOLETA DE PAGO DE HABERES', pageWidth - 72, y + 1.5);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`PERIODO: ${periodo} · D.S. 001-98-TR`, pageWidth - 72, y + 6.5);

      y += 18;

      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, pageWidth - 28, 24, 'FD');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('DATOS DEL COLABORADOR', 17, y + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text('Colaborador:', 17, y + 9.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`${workerCalc.nombre || ''}`, 40, y + 9.5);

      doc.setFont('helvetica', 'bold');
      doc.text('DNI / CE:', 115, y + 9.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`${workerCalc.dni || ''}`, 132, y + 9.5);

      doc.setFont('helvetica', 'bold');
      doc.text('Régimen:', 160, y + 9.5);
      doc.setFont('helvetica', 'normal');
      doc.text('D.L. 728', 176, y + 9.5);

      doc.setFont('helvetica', 'bold');
      doc.text('Cargo / Puesto:', 17, y + 14.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`${workerCalc.cargo || 'Operador'}`, 40, y + 14.5);

      doc.setFont('helvetica', 'bold');
      doc.text('Pensión:', 115, y + 14.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`${(workerCalc.afp || 'INTEGRA').toUpperCase()}`, 132, y + 14.5);

      doc.setFont('helvetica', 'bold');
      doc.text('Situación:', 160, y + 14.5);
      doc.setFont('helvetica', 'normal');
      doc.text('ACTIVO', 176, y + 14.5);

      doc.setFont('helvetica', 'bold');
      doc.text('Días Laborados:', 17, y + 19.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`${workerCalc.diasTrabajados || 30} días`, 40, y + 19.5);

      doc.setFont('helvetica', 'bold');
      doc.text('Descansos:', 70, y + 19.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`${workerCalc.diasDescanso || 0} d`, 88, y + 19.5);

      doc.setFont('helvetica', 'bold');
      doc.text('Faltas:', 115, y + 19.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`${workerCalc.diasFalta || 0} d`, 132, y + 19.5);

      doc.setFont('helvetica', 'bold');
      doc.text('Básico Mensual:', 150, y + 19.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`S/ ${(workerCalc.sueldoBase || 1500).toFixed(2)}`, 175, y + 19.5);

      y += 29;

      const colWidth = (pageWidth - 32) / 2;
      const leftX = 14;
      const rightX = 14 + colWidth + 4;

      doc.setFillColor(241, 245, 249);
      doc.rect(leftX, y, colWidth, 6, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text('INGRESOS Y CONCEPTOS COMPUTABLES', leftX + 3, y + 4.2);
      doc.text('IMPORTE', leftX + colWidth - 16, y + 4.2);

      let ingY = y + 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);

      const itemsIngresos = [
        { desc: '0121 Remuneración Básica', monto: workerCalc.basicoProporcional || workerCalc.sueldoBase || 0 },
        { desc: '0201 Asignación Familiar (Ley 25129)', monto: workerCalc.asigFamiliar || 0 },
        { desc: '0105 Sobretasa Nocturna / Horas Extras', monto: workerCalc.sobretasaNocturna || 0 },
      ].filter(i => i.monto > 0);

      itemsIngresos.forEach(item => {
        doc.text(item.desc, leftX + 3, ingY);
        doc.text(`S/ ${item.monto.toFixed(2)}`, leftX + colWidth - 3, ingY, { align: 'right' });
        ingY += 5.5;
      });

      doc.setFillColor(254, 242, 242);
      doc.rect(rightX, y, colWidth, 6, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(159, 18, 57);
      doc.text('DESCUENTOS AL TRABAJADOR', rightX + 3, y + 4.2);
      doc.text('IMPORTE', rightX + colWidth - 16, y + 4.2);

      let descY = y + 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);

      const itemsDescuentos = [
        { desc: `0605 Aporte Fondo Jubilación ${(workerCalc.afp || 'AFP').toUpperCase()}`, monto: workerCalc.descuentoPension || 0 },
        { desc: '0701 Descuento por Faltas / Inasistencias', monto: workerCalc.descuentoFaltas || 0 },
      ].filter(i => i.monto > 0);

      itemsDescuentos.forEach(item => {
        doc.text(item.desc, rightX + 3, descY);
        doc.text(`-S/ ${item.monto.toFixed(2)}`, rightX + colWidth - 3, descY, { align: 'right' });
        descY += 5.5;
      });

      const maxY = Math.max(ingY, descY, y + 36);
      y = maxY + 2;

      doc.setDrawColor(203, 213, 225);
      doc.line(14, y, pageWidth - 14, y);
      y += 5;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('TOTAL REMUNERACIÓN BRUTA:', leftX + 3, y);
      doc.text(`S/ ${(workerCalc.totalBruto || 0).toFixed(2)}`, leftX + colWidth - 3, y, { align: 'right' });

      doc.text('TOTAL DESCUENTOS:', rightX + 3, y);
      doc.setTextColor(225, 29, 72);
      doc.text(`-S/ ${(workerCalc.totalDescuentos || 0).toFixed(2)}`, rightX + colWidth - 3, y, { align: 'right' });
      doc.setTextColor(15, 23, 42);

      y += 8;

      doc.setFillColor(240, 249, 255);
      doc.setDrawColor(186, 230, 253);
      doc.rect(14, y, pageWidth - 28, 12, 'FD');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(3, 105, 161);
      doc.text('NETO A PAGAR AL COLABORADOR:', 18, y + 7.5);

      doc.setFontSize(11);
      doc.text(`S/ ${(workerCalc.netoPagar || 0).toFixed(2)}`, pageWidth - 18, y + 7.5, { align: 'right' });

      y += 18;

      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(187, 247, 208);
      doc.rect(14, y, pageWidth - 28, 8, 'FD');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 101, 52);
      doc.text('APORTES DEL EMPLEADOR (NO AFECTA AL SUELDO NETO):', 18, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.text(`EsSalud (9%): S/ ${(workerCalc.aporteEsSalud || 0).toFixed(2)}  ·  Seguro Vida Ley Cubierto`, 110, y + 5);

      y += 16;
      y = Math.max(y, 160);
      doc.setDrawColor(71, 85, 105);
      doc.setLineWidth(0.3);

      doc.line(30, y + 16, 85, y + 16);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('EMPLEADOR', 57, y + 20, { align: 'center' });

      doc.line(pageWidth - 85, y + 16, pageWidth - 30, y + 16);
      doc.text('TRABAJADOR', pageWidth - 57, y + 20, { align: 'center' });

      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Página ${idx + 1} de ${workersCalcList.length} · Generado el ${new Date().toLocaleDateString('es-PE')}`,
        pageWidth / 2,
        y + 35,
        { align: 'center' }
      );
    });

    const filename = `Lote_Boletas_Oficiales_${periodo}.pdf`;
    doc.save(filename);
    return filename;
  }

  generarPapeletaVacacionesPDF(pw: any, empresaName = 'NOMINI ENTERPRISE S.A.C.', ruc = '20608912341'): string | null {
    if (!pw) return null;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 16;

    // Encabezado Corporativo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(empresaName, 14, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`R.U.C. ${ruc} · Sistema Integrado de Gestión de RR.HH. y Nómina`, 14, y + 4.5);
    doc.text('Sede Central Administrativa · San Isidro, Lima - Perú', 14, y + 8.5);

    // Caja Correlativa Superior Derecha
    const codigoDoc = `PAP-VAC-2026-${String(pw.id || 1).padStart(4, '0')}`;
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.4);
    doc.setFillColor(248, 250, 252);
    doc.rect(pageWidth - 78, y - 4, 64, 16, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('PAPELETA DE VACACIONES', pageWidth - 75, y + 1.5);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`N°: ${codigoDoc}`, pageWidth - 75, y + 6);
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Emisión: ${new Date().toLocaleDateString('es-PE')}`, pageWidth - 75, y + 10);

    y += 20;

    // Título Principal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('AUTORIZACIÓN DE DESCANSO VACACIONAL', pageWidth / 2, y, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('(Decreto Legislativo N° 713 y su Reglamento D.S. N° 012-92-TR)', pageWidth / 2, y + 4, { align: 'center' });

    y += 10;

    // I. DATOS DEL COLABORADOR
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y, pageWidth - 28, 24, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('I. DATOS DEL COLABORADOR', 17, y + 4.5);

    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    // Fila 1 Colaborador y DNI
    doc.setFont('helvetica', 'bold');
    doc.text('Apellidos y Nombres:', 17, y + 10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${pw.nombre || ''}`, 52, y + 10);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('DNI / CE:', 125, y + 10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${pw.dni || ''}`, 142, y + 10);

    // Fila 2 Cargo y Fecha de Ingreso
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Cargo / Ocupación:', 17, y + 15.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${pw.cargo || 'Colaborador Regular'}`, 52, y + 15.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('F. Ingreso:', 125, y + 15.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${pw.fechaIngreso || '01/01/2023'}`, 142, y + 15.5);

    // Fila 3 Régimen y Centro
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Régimen Laboral:', 17, y + 21);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text('Actividad Privada (D.L. 728)', 52, y + 21);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Centro / Sede:', 125, y + 21);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text('Sede Central - San Isidro', 142, y + 21);

    y += 28;

    // II. DETALLE DE PROGRAMACIÓN VACACIONAL
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y, pageWidth - 28, 48, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('II. DETALLE DEL PERIODO Y PROGRAMACIÓN DEL DESCANSO', 17, y + 4.5);

    const pRecord = pw.record || {};
    const periodoAdq = pRecord.periodoActual || '2025-2026';
    const diasTotalDerecho = 30;
    const diasPendientes = pRecord.saldoPendiente ?? 15;
    const diasGoce = Math.min(15, diasPendientes > 0 ? diasPendientes : 15);
    const saldoPost = Math.max(0, diasPendientes - diasGoce);

    const fInicio = '15/09/2026';
    const fFin = '29/09/2026';
    const fRetorno = '30/09/2026';

    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    // Fila 1: Período y Derecho
    doc.setFont('helvetica', 'bold');
    doc.text('Periodo Adquisitivo:', 17, y + 11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${periodoAdq}`, 55, y + 11);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Derecho Anual:', 120, y + 11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${diasTotalDerecho} días calendario`, 160, y + 11);

    // Fila 2: Saldo Previo y Días Otorgados
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Saldo Acumulado Previo:', 17, y + 17);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${diasPendientes} días`, 55, y + 17);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(2, 132, 199);
    doc.text('Días de Goce Autorizados:', 120, y + 17);
    doc.setFont('helvetica', 'bold');
    doc.text(`${diasGoce} días calendario`, 160, y + 17);

    // Fila 3: Fechas Inicio y Fin
    doc.setTextColor(71, 85, 105);
    doc.text('Fecha Inicio del Descanso:', 17, y + 23);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(fInicio, 55, y + 23);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Fecha Término del Descanso:', 120, y + 23);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(fFin, 160, y + 23);

    // Fila 4: Fecha Retorno y Saldo Restante
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text('Fecha de Reincorporación:', 17, y + 29);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${fRetorno} (Primer día hábil)`, 55, y + 29);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Saldo Restante Post-Goce:', 120, y + 29);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${saldoPost} días`, 160, y + 29);

    // Cuadro resumen dentro del bloque
    doc.setDrawColor(186, 230, 253);
    doc.setFillColor(240, 249, 255);
    doc.rect(17, y + 33, pageWidth - 34, 11, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(3, 105, 161);
    doc.text('MODALIDAD: Fraccionamiento de descanso vacacional ordinario (D.L. 1405)', 20, y + 38);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Estado del Récord: ${pRecord.estadoRecord || 'Conforme'} · Aprobado por Jefatura Inmediata y RR.HH.`, 20, y + 42);

    y += 53;

    // III. BASE LEGAL Y DECLARACIÓN JURADA
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(255, 255, 255);
    doc.rect(14, y, pageWidth - 28, 22, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text('III. BASE LEGAL Y COMPROMISO LABORAL', 17, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    const textoLegal = 'El presente documento acredita la autorización formal y registro del descanso vacacional acordado de mutuo acuerdo entre las partes, en concordancia con el artículo 14° del D.L. 713 y D.L. 1405. El trabajador se compromete a no prestar servicios remunerados para terceros durante el período vacacional y a reincorporarse estrictamente a sus labores en la fecha indicada. Cualquier prórroga no justificada constituirá inasistencia sujeta al Reglamento Interno de Trabajo.';
    doc.text(textoLegal, 17, y + 8, { maxWidth: pageWidth - 34, align: 'justify', lineHeightFactor: 1.3 });

    y += 28;

    // IV. BLOQUE DE FIRMAS Y SELLOS PROFESIONALES
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('IV. CONSTANCIA DE CONFORMIDAD Y FIRMAS', 14, y);

    y += 5;
    const colW = (pageWidth - 28) / 3;

    // Bloque 1: Trabajador (Fondo blanco, huella, firma digital)
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, y, colW - 3, 40, 2, 2, 'FD');

    // Badge y trazo firma digital
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(14 + (colW - 3) / 2 - 20, y + 3, 40, 5, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(29, 78, 216);
    doc.text('FIRMADO ID DIGITAL', 14 + (colW - 3) / 2, y + 6.5, { align: 'center' });

    // Simulación de trazo caligráfico manuscrito
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(0.4);
    doc.line(22, y + 17, 30, y + 13);
    doc.line(30, y + 13, 35, y + 18);
    doc.line(35, y + 18, 48, y + 12);
    doc.line(48, y + 12, 14 + colW - 12, y + 15);
    doc.line(25, y + 16, 14 + colW - 10, y + 16);

    // Línea de firma
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(18, y + 23, 14 + colW - 7, y + 23);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${pw.nombre || ''}`, 14 + (colW - 3) / 2, y + 27, { align: 'center', maxWidth: colW - 8 });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`DNI: ${pw.dni || ''}`, 14 + (colW - 3) / 2, y + 31, { align: 'center' });
    doc.setFontSize(6);
    doc.text('Firma y Huella del Colaborador', 14 + (colW - 3) / 2, y + 35, { align: 'center' });

    // Bloque 2: Jefatura Inmediata (Fondo blanco, Sello Oficial Azul y Rúbrica)
    const x2 = 14 + colW + 1.5;
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x2, y, colW - 3, 40, 2, 2, 'FD');

    // Sello Oficial de Jefatura de Operaciones
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(59, 130, 246);
    doc.roundedRect(x2 + 6, y + 3, colW - 15, 13, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(30, 64, 175);
    doc.text('JEFATURA DE OPERACIONES', x2 + (colW - 3) / 2, y + 6.5, { align: 'center' });
    doc.setFontSize(7);
    doc.setTextColor(29, 78, 216);
    doc.text('★ AUTORIZADO ★', x2 + (colW - 3) / 2, y + 10.5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5);
    doc.setTextColor(71, 85, 105);
    doc.text('Ref: JEF-0419 · 12/09/2026', x2 + (colW - 3) / 2, y + 14, { align: 'center' });

    // Rúbrica Jefatura
    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(0.4);
    doc.line(x2 + 10, y + 16, x2 + 20, y + 11);
    doc.line(x2 + 20, y + 11, x2 + 35, y + 17);
    doc.line(x2 + 35, y + 17, x2 + colW - 12, y + 12);

    // Línea de firma
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(x2 + 4, y + 23, x2 + colW - 7, y + 23);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Ing. Roberto Seminario V.', x2 + (colW - 3) / 2, y + 27, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Jefe de Operaciones y Planta', x2 + (colW - 3) / 2, y + 31, { align: 'center' });
    doc.setFontSize(6);
    doc.text('Sello y Firma V°B° Jefatura', x2 + (colW - 3) / 2, y + 35, { align: 'center' });

    // Bloque 3: RR.HH. (Fondo blanco, Sello Verde Esmeralda y Rúbrica)
    const x3 = 14 + (colW * 2) + 3;
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x3, y, colW - 3, 40, 2, 2, 'FD');

    // Sello Oficial RRHH y Nómina
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(16, 185, 129);
    doc.roundedRect(x3 + 6, y + 3, colW - 15, 13, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(6, 95, 70);
    doc.text('GESTIÓN DEL TALENTO', x3 + (colW - 3) / 2, y + 6.5, { align: 'center' });
    doc.setFontSize(7);
    doc.setTextColor(5, 150, 105);
    doc.text('★ REGISTRADO · PLANILLAS ★', x3 + (colW - 3) / 2, y + 10.5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5);
    doc.setTextColor(71, 85, 105);
    doc.text('Conforme D.L. 713 / 1405', x3 + (colW - 3) / 2, y + 14, { align: 'center' });

    // Rúbrica RRHH
    doc.setDrawColor(6, 95, 70);
    doc.setLineWidth(0.4);
    doc.line(x3 + 12, y + 16, x3 + 22, y + 11);
    doc.line(x3 + 22, y + 11, x3 + 36, y + 17);
    doc.line(x3 + 36, y + 17, x3 + colW - 12, y + 13);

    // Línea de firma
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(x3 + 4, y + 23, x3 + colW - 7, y + 23);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Lic. Carmen Del Prado M.', x3 + (colW - 3) / 2, y + 27, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Gestión del Talento y Nóminas', x3 + (colW - 3) / 2, y + 31, { align: 'center' });
    doc.setFontSize(6);
    doc.text('Recursos Humanos · Registro', x3 + (colW - 3) / 2, y + 35, { align: 'center' });

    y += 46;

    // Footer Oficial sin superposición de texto
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(14, y, pageWidth - 14, y);
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Copia 1: Colaborador  ·  Copia 2: Legajo Personal RR.HH.  ·  Copia 3: Control Asistencia', 14, y + 4);
    doc.text(`Generado por NOMINI Enterprise · ${new Date().toLocaleDateString('es-PE')}`, pageWidth - 14, y + 4, { align: 'right' });

    const filename = `Papeleta_Vacaciones_${(pw.nombre || 'Colaborador').replace(/\s+/g, '_')}_${codigoDoc}.pdf`;
    doc.save(filename);
    return filename;
  }
}

