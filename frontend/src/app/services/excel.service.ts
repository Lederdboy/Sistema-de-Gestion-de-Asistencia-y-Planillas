import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { PlanillaItem } from '../models/planilla.model';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  private downloadBlob(content: string, filename: string, mimeType = 'text/plain;charset=utf-8') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  exportarPlanillaExcel(planillas: PlanillaItem[], periodo = '2026-09') {
    if (!planillas || planillas.length === 0) return;

    const rows = planillas.map((p, idx) => ({
      'N°': idx + 1,
      'DNI': p.dni || '',
      'Colaborador': p.nombre || '',
      'Cargo': p.cargo || '',
      'Régimen Pensión': (p.afp || 'AFP').toUpperCase(),
      'Días Trab.': p.diasTrabajados || 30,
      'Sueldo Básico (S/)': Number((p.sueldoBase || 0).toFixed(2)),
      'Básico Prop. (S/)': Number((p.basicoProporcional || 0).toFixed(2)),
      'Asig. Familiar (S/)': Number((p.asigFamiliar || 0).toFixed(2)),
      'Sobretasa Nocturna (S/)': Number((p.sobretasaNocturna || 0).toFixed(2)),
      'Total Bruto (S/)': Number((p.totalBruto || 0).toFixed(2)),
      'Aporte AFP/ONP (S/)': Number((p.descuentoPension || 0).toFixed(2)),
      'Faltas (S/)': Number((p.descuentoFaltas || 0).toFixed(2)),
      'Renta 5ta (S/)': Number((p.renta5ta || 0).toFixed(2)),
      'Total Descuentos (S/)': Number((p.totalDescuentos || 0).toFixed(2)),
      'Neto a Pagar (S/)': Number((p.netoPagar || 0).toFixed(2)),
      'Aporte EsSalud 9% (S/)': Number((p.aporteEsSalud || 0).toFixed(2)),
    }));

    const totalBruto = planillas.reduce((acc, p) => acc + (p.totalBruto || 0), 0);
    const totalDesc = planillas.reduce((acc, p) => acc + (p.totalDescuentos || 0), 0);
    const totalNeto = planillas.reduce((acc, p) => acc + (p.netoPagar || 0), 0);
    const totalEssalud = planillas.reduce((acc, p) => acc + (p.aporteEsSalud || 0), 0);

    rows.push({
      'N°': '' as any,
      'DNI': '',
      'Colaborador': 'TOTALES GENERALES',
      'Cargo': '',
      'Régimen Pensión': '',
      'Días Trab.': '' as any,
      'Sueldo Básico (S/)': '' as any,
      'Básico Prop. (S/)': '' as any,
      'Asig. Familiar (S/)': '' as any,
      'Sobretasa Nocturna (S/)': '' as any,
      'Total Bruto (S/)': Number(totalBruto.toFixed(2)),
      'Aporte AFP/ONP (S/)': '' as any,
      'Faltas (S/)': '' as any,
      'Renta 5ta (S/)': '' as any,
      'Total Descuentos (S/)': Number(totalDesc.toFixed(2)),
      'Neto a Pagar (S/)': Number(totalNeto.toFixed(2)),
      'Aporte EsSalud 9% (S/)': Number(totalEssalud.toFixed(2)),
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Planilla ${periodo}`);
    XLSX.writeFile(workbook, `Planilla_Consolidada_${periodo}.xlsx`);
  }

  exportarRecordVacacionalExcel(workersWithRecord: any[]) {
    if (!workersWithRecord || workersWithRecord.length === 0) return;

    const rows = workersWithRecord.map((w, idx) => {
      const rec = w.record || {};
      return {
        'N°': idx + 1,
        'DNI': w.dni || '',
        'Colaborador': w.nombre || '',
        'Cargo': w.cargo || '',
        'Fecha Ingreso': w.fechaIngreso || '2023-01-15',
        'Derecho Anual (días)': 30,
        'Días Gozados': rec.diasGozados ?? 0,
        'Días Vendidos': rec.diasVendidos ?? 0,
        'Saldo Pendiente (días)': rec.saldoPendiente ?? 30,
        'Estado Alerta': rec.estadoRecord ?? 'Al Día',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Récord Vacacional');
    XLSX.writeFile(workbook, `Record_Vacacional_Consolidado_2026.xlsx`);
  }

  exportarDispersionBancariaTxt(planillas: PlanillaItem[], periodo = '2026-09') {
    if (!planillas || planillas.length === 0) return;

    const rucEmpresa = '20489123891';
    const cuentaCargo = '191-23847291-0-22';
    const fechaProceso = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    let txt = `700${rucEmpresa}PE${cuentaCargo}S${fechaProceso}HABERES ${periodo}\n`;

    planillas.forEach((p, index) => {
      const correlativo = String(index + 1).padStart(6, '0');
      const tipoDoc = '1';
      const numDoc = (p.dni || '00000000').padEnd(12, ' ');
      const nombre = (p.nombre || '').slice(0, 40).padEnd(40, ' ');
      const cuentaAbono = (`191-${p.dni}0-1-00`).padEnd(20, ' ');
      const montoCentavos = Math.round((p.netoPagar || 0) * 100);
      const montoS = String(montoCentavos).padStart(15, '0');

      txt += `P${correlativo}${tipoDoc}${numDoc}${nombre}${cuentaAbono}${montoS}S\n`;
    });

    this.downloadBlob(txt, `pagos_haberes_${periodo}_bcp.txt`);
  }

  exportarPlameRemTxt(planillas: PlanillaItem[], periodo = '2026-09') {
    if (!planillas || planillas.length === 0) return;

    const periodoStr = periodo.replace('-', '');
    let txt = '';

    planillas.forEach((p) => {
      const dni = p.dni || '00000000';
      txt += `01|${dni}|0121|${(p.basicoProporcional || p.sueldoBase || 0).toFixed(2)}|${(p.basicoProporcional || p.sueldoBase || 0).toFixed(2)}|\n`;
      if (p.asigFamiliar > 0) {
        txt += `01|${dni}|0201|${p.asigFamiliar.toFixed(2)}|${p.asigFamiliar.toFixed(2)}|\n`;
      }
      if (p.sobretasaNocturna > 0) {
        txt += `01|${dni}|0105|${p.sobretasaNocturna.toFixed(2)}|${p.sobretasaNocturna.toFixed(2)}|\n`;
      }
      if (p.descuentoPension > 0) {
        txt += `01|${dni}|0605|${p.descuentoPension.toFixed(2)}|${p.descuentoPension.toFixed(2)}|\n`;
      }
    });

    this.downloadBlob(txt, `0601${periodoStr}20489123891.rem`);
  }

  exportarAfpNetTxt(planillas: PlanillaItem[], periodo = '2026-09') {
    if (!planillas || planillas.length === 0) return;

    let txt = '';
    planillas.forEach((p, idx) => {
      const cuspp = '612341ABCDE0'.padEnd(12, ' ');
      const dni = (p.dni || '00000000').padEnd(10, ' ');
      const partes = (p.nombre || '').split(' ');
      const apPaterno = (partes[0] || '').padEnd(20, ' ');
      const apMaterno = (partes[1] || '').padEnd(20, ' ');
      const nombres = (partes.slice(2).join(' ') || partes[0] || '').padEnd(20, ' ');
      const remu = (p.totalBruto || 0).toFixed(2).padStart(10, '0');

      txt += `${idx + 1}|${cuspp}|1|${dni}|${apPaterno}|${apMaterno}|${nombres}|S|${remu}|0.00|0.00|\n`;
    });

    this.downloadBlob(txt, `AFP_NET_${periodo.replace('-', '')}.txt`);
  }
}

