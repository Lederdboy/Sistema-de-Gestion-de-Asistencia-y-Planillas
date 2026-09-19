package com.sistema.planillas.service;

import com.sistema.planillas.dto.CalcularPlanillaRequest;
import com.sistema.planillas.dto.CerrarPlanillaRequest;
import com.sistema.planillas.dto.MatrizAsistenciaRowDTO;
import com.sistema.planillas.dto.PlanillaResumenDTO;
import com.sistema.planillas.entity.Empresa;
import com.sistema.planillas.entity.PlanillaDetalle;
import com.sistema.planillas.entity.PlanillaResumen;
import com.sistema.planillas.entity.Trabajador;
import com.sistema.planillas.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PlanillaService {

    private final PlanillaResumenRepository planillaResumenRepository;
    private final PlanillaDetalleRepository planillaDetalleRepository;
    private final EmpresaRepository empresaRepository;
    private final TrabajadorRepository trabajadorRepository;
    private final AsistenciaService asistenciaService;
    private final SedeRepository sedeRepository;

    @Transactional(readOnly = true)
    public PlanillaResumenDTO obtenerResumenPeriodo(String periodo) {
        Optional<PlanillaResumen> opt = planillaResumenRepository.findByPeriodo(periodo);

        if (opt.isPresent()) {
            PlanillaResumen r = opt.get();
            return PlanillaResumenDTO.builder()
                    .periodo(r.getPeriodo())
                    .totalTrabajadores(r.getTotalTrabajadores())
                    .totalCalculados(r.getTotalCalculados())
                    .totalPendientes(r.getTotalPendientes())
                    .montoTotalNeto(r.getMontoTotalNeto())
                    .estado(r.getEstado())
                    .fechaCalculo(r.getFechaCalculo())
                    .fechaCierre(r.getFechaCierre())
                    .build();
        }

        // Si no existe la planilla para el periodo, devolvemos conteo estimado con estado EN_PROCESO
        int total = (int) trabajadorRepository.count();
        return PlanillaResumenDTO.builder()
                .periodo(periodo)
                .totalTrabajadores(total)
                .totalCalculados(0)
                .totalPendientes(total)
                .montoTotalNeto(BigDecimal.ZERO)
                .estado("EN_PROCESO")
                .build();
    }

    @Transactional(rollbackFor = Exception.class)
    public PlanillaResumenDTO calcularPlanilla(CalcularPlanillaRequest request) {
        Empresa empresa = empresaRepository.findById(request.getEmpresaId())
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada con ID: " + request.getEmpresaId()));

        // Buscar o crear la cabecera de la planilla
        PlanillaResumen resumen = planillaResumenRepository.findByEmpresaIdAndPeriodo(request.getEmpresaId(), request.getPeriodo())
                .orElseGet(() -> PlanillaResumen.builder()
                        .empresa(empresa)
                        .periodo(request.getPeriodo())
                        .estado("EN_PROCESO")
                        .totalTrabajadores(0)
                        .totalCalculados(0)
                        .totalPendientes(0)
                        .montoTotalNeto(BigDecimal.ZERO)
                        .build());

        if ("CERRADO".equalsIgnoreCase(resumen.getEstado())) {
            throw new IllegalStateException("La planilla para el periodo " + request.getPeriodo() + " se encuentra CERRADA y no puede ser recalculada.");
        }

        // Limpiar detalles previos si se recorta/recalcula
        if (resumen.getId() != null) {
            planillaDetalleRepository.deleteByPlanillaResumenId(resumen.getId());
        }
        resumen = planillaResumenRepository.save(resumen);

        int mes = Integer.parseInt(request.getPeriodo().substring(4, 6));
        int anio = Integer.parseInt(request.getPeriodo().substring(0, 4));

        List<Trabajador> trabajadores = trabajadorRepository.findAll();
        BigDecimal montoTotalNeto = BigDecimal.ZERO;
        int calculadosCount = 0;

        var sedes = sedeRepository.findAll();

        for (Trabajador t : trabajadores) {
            // Obtener matriz de asistencia acumulada para la sede del trabajador
            List<MatrizAsistenciaRowDTO> matrizSede = asistenciaService.obtenerMatrizMensual(mes, anio, t.getSede().getId());
            
            MatrizAsistenciaRowDTO row = matrizSede.stream()
                    .filter(m -> m.getTrabajadorId().equals(t.getId()))
                    .findFirst()
                    .orElse(null);

            int diasTrabajados = row != null ? row.getTotalDiasTrabajados() : 30;
            int diasNoches = row != null ? row.getTotalNoches() : 0;
            int diasFaltas = row != null ? row.getTotalFaltas() : 0;
            int diasDescanso = row != null ? row.getTotalDescansos() : 0;
            int diasVacaciones = row != null ? row.getTotalVacaciones() : 0;

            // Motor de liquidación laboral (Ley Peruana): Ingresos, Descuentos de Faltas, AFP/ONP y EsSalud
            BigDecimal sueldoDiario = t.getSueldoDiario() != null ? t.getSueldoDiario() : t.getSueldoBasico().divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP);
            BigDecimal descuentoFaltas = sueldoDiario.multiply(BigDecimal.valueOf(diasFaltas)).setScale(2, RoundingMode.HALF_UP);

            BigDecimal remuneracionComputable = t.getSueldoBasico().subtract(descuentoFaltas);
            if (remuneracionComputable.compareTo(BigDecimal.ZERO) < 0) {
                remuneracionComputable = BigDecimal.ZERO;
            }

            // Tasa promedio de retención de pensión (ONP / AFP ~ 13%)
            BigDecimal descuentoPension = remuneracionComputable.multiply(new BigDecimal("0.13")).setScale(2, RoundingMode.HALF_UP);

            // Aporte empleador a la seguridad social (EsSalud 9%)
            BigDecimal aporteEssalud = remuneracionComputable.multiply(new BigDecimal("0.09")).setScale(2, RoundingMode.HALF_UP);

            BigDecimal totalIngresos = t.getSueldoBasico();
            BigDecimal totalDescuentos = descuentoFaltas.add(descuentoPension);
            BigDecimal netoPagar = totalIngresos.subtract(totalDescuentos);
            if (netoPagar.compareTo(BigDecimal.ZERO) < 0) {
                netoPagar = BigDecimal.ZERO;
            }

            PlanillaDetalle detalle = PlanillaDetalle.builder()
                    .planillaResumen(resumen)
                    .trabajador(t)
                    .diasTrabajados(diasTrabajados)
                    .diasNoches(diasNoches)
                    .diasFaltas(diasFaltas)
                    .diasDescanso(diasDescanso)
                    .diasVacaciones(diasVacaciones)
                    .sueldoBasico(t.getSueldoBasico())
                    .asignacionFamiliar(BigDecimal.ZERO)
                    .descuentoFaltas(descuentoFaltas)
                    .descuentoPension(descuentoPension)
                    .aporteEssalud(aporteEssalud)
                    .totalIngresos(totalIngresos)
                    .totalDescuentos(totalDescuentos)
                    .netoPagar(netoPagar)
                    .calculado(true)
                    .build();

            planillaDetalleRepository.save(detalle);

            montoTotalNeto = montoTotalNeto.add(netoPagar);
            calculadosCount++;
        }

        resumen.setTotalTrabajadores(trabajadores.size());
        resumen.setTotalCalculados(calculadosCount);
        resumen.setTotalPendientes(trabajadores.size() - calculadosCount);
        resumen.setMontoTotalNeto(montoTotalNeto);
        resumen.setFechaCalculo(LocalDateTime.now());

        resumen = planillaResumenRepository.save(resumen);

        return PlanillaResumenDTO.builder()
                .periodo(resumen.getPeriodo())
                .totalTrabajadores(resumen.getTotalTrabajadores())
                .totalCalculados(resumen.getTotalCalculados())
                .totalPendientes(resumen.getTotalPendientes())
                .montoTotalNeto(resumen.getMontoTotalNeto())
                .estado(resumen.getEstado())
                .fechaCalculo(resumen.getFechaCalculo())
                .build();
    }

    @Transactional(rollbackFor = Exception.class)
    public PlanillaResumenDTO cerrarPlanilla(CerrarPlanillaRequest request) {
        PlanillaResumen resumen = planillaResumenRepository.findByEmpresaIdAndPeriodo(request.getEmpresaId(), request.getPeriodo())
                .orElseThrow(() -> new IllegalArgumentException("No existe una planilla calculada para el periodo: " + request.getPeriodo()));

        resumen.setEstado("CERRADO");
        resumen.setFechaCierre(LocalDateTime.now());
        resumen.setUsuarioCierre(request.getUsuario() != null ? request.getUsuario() : "ADMIN");

        resumen = planillaResumenRepository.save(resumen);

        return PlanillaResumenDTO.builder()
                .periodo(resumen.getPeriodo())
                .totalTrabajadores(resumen.getTotalTrabajadores())
                .totalCalculados(resumen.getTotalCalculados())
                .totalPendientes(resumen.getTotalPendientes())
                .montoTotalNeto(resumen.getMontoTotalNeto())
                .estado(resumen.getEstado())
                .fechaCalculo(resumen.getFechaCalculo())
                .fechaCierre(resumen.getFechaCierre())
                .build();
    }
}
