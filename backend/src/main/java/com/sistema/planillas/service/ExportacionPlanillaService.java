package com.sistema.planillas.service;

import com.sistema.planillas.entity.PlanillaDetalle;
import com.sistema.planillas.entity.Trabajador;
import com.sistema.planillas.exception.ResourceNotFoundException;
import com.sistema.planillas.repository.PlanillaDetalleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportacionPlanillaService {

    private final PlanillaDetalleRepository planillaDetalleRepository;

    @Transactional(readOnly = true)
    public byte[] generarArchivoBancario(String periodo) {
        List<PlanillaDetalle> detalles = planillaDetalleRepository.findByPlanillaResumenPeriodo(periodo);
        if (detalles.isEmpty()) {
            throw new ResourceNotFoundException("No se encontraron registros de planilla calculada para el periodo: " + periodo);
        }

        StringBuilder sb = new StringBuilder();
        sb.append("# ARCHIVO DE DISPERSION DE HABERES - FORMATO BANCARIO MULTIRED / TELECREDITO\n");
        sb.append("# PERIODO: ").append(periodo).append("\n");
        sb.append("# TIPO_REG | TIPO_DOC | NUM_DOC | BENEFICIARIO | MONEDA | IMPORTE_NETO | CONCEPTO\n");

        for (PlanillaDetalle d : detalles) {
            Trabajador t = d.getTrabajador();
            String nombreCompleto = String.format("%s %s %s", t.getApellidoPaterno(), t.getApellidoMaterno(), t.getNombres()).trim();

            sb.append(String.format("P|%s|%s|%-35s|PEN|%10.2f|HABERES_%s\n",
                    t.getTipoDocumento(),
                    t.getNumeroDocumento(),
                    nombreCompleto.length() > 35 ? nombreCompleto.substring(0, 35) : nombreCompleto,
                    d.getNetoPagar(),
                    periodo
            ));
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Transactional(readOnly = true)
    public byte[] generarConsolidadoCsv(String periodo) {
        List<PlanillaDetalle> detalles = planillaDetalleRepository.findByPlanillaResumenPeriodo(periodo);
        if (detalles.isEmpty()) {
            throw new ResourceNotFoundException("No se encontraron registros de planilla calculada para el periodo: " + periodo);
        }

        StringBuilder sb = new StringBuilder();
        sb.append("PERIODO,DNI,TRABAJADOR,CARGO,SEDE,DIAS_LABORADOS,FALTAS,VACACIONES,SUELDO_BASICO,ASIG_FAMILIAR,DESC_FALTAS,AFP_ONP_13PCT,ESSALUD_9PCT,NETO_PAGAR\n");

        for (PlanillaDetalle d : detalles) {
            Trabajador t = d.getTrabajador();
            String nombre = String.format("%s, %s %s", t.getApellidoPaterno(), t.getApellidoMaterno(), t.getNombres()).replace(",", " ");
            String cargo = t.getCargo().replace(",", " ");
            String sede = (t.getSede() != null ? t.getSede().getNombre() : "").replace(",", " ");

            sb.append(String.format("%s,%s,%s,%s,%s,%d,%d,%d,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f\n",
                    periodo,
                    t.getNumeroDocumento(),
                    nombre,
                    cargo,
                    sede,
                    d.getDiasTrabajados(),
                    d.getDiasFaltas(),
                    d.getDiasVacaciones(),
                    d.getSueldoBasico(),
                    d.getAsignacionFamiliar(),
                    d.getDescuentoFaltas(),
                    d.getDescuentoPension(),
                    d.getAporteEssalud(),
                    d.getNetoPagar()
            ));
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }
}
