package com.sistema.planillas.service;

import com.sistema.planillas.dto.DashboardResumenDTO;
import com.sistema.planillas.entity.PlanillaResumen;
import com.sistema.planillas.entity.Trabajador;
import com.sistema.planillas.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TrabajadorRepository trabajadorRepository;
    private final SedeRepository sedeRepository;
    private final EmpresaRepository empresaRepository;
    private final PlanillaResumenRepository planillaResumenRepository;
    private final AsistenciaMatrizRepository asistenciaMatrizRepository;

    @Transactional(readOnly = true)
    public DashboardResumenDTO obtenerResumenGeneral(Integer mes, Integer anio) {
        LocalDate now = LocalDate.now();
        int consultaMes = (mes != null) ? mes : now.getMonthValue();
        int consultaAnio = (anio != null) ? anio : now.getYear();

        List<Trabajador> todosTrabajadores = trabajadorRepository.findAll();
        long activos = todosTrabajadores.stream().filter(t -> Boolean.TRUE.equals(t.getActivo())).count();
        long inactivos = todosTrabajadores.size() - activos;

        long totalSedes = sedeRepository.count();
        long totalEmpresas = empresaRepository.count();

        List<PlanillaResumen> planillas = planillaResumenRepository.findAll();
        long cerradas = planillas.stream().filter(p -> "CERRADO".equalsIgnoreCase(p.getEstado())).count();
        BigDecimal montoTotal = planillas.stream()
                .filter(p -> "CERRADO".equalsIgnoreCase(p.getEstado()))
                .map(PlanillaResumen::getMontoTotalNeto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Distribución por sede
        Map<String, Long> porSede = todosTrabajadores.stream()
                .filter(t -> Boolean.TRUE.equals(t.getActivo()))
                .collect(Collectors.groupingBy(t -> t.getSede() != null ? t.getSede().getNombre() : "Sin Sede", Collectors.counting()));

        // Resumen asistencia del mes
        LocalDate fechaInicio = LocalDate.of(consultaAnio, consultaMes, 1);
        LocalDate fechaFin = fechaInicio.plusMonths(1).minusDays(1);

        var marcaciones = asistenciaMatrizRepository.findAll().stream()
                .filter(m -> !m.getFecha().isBefore(fechaInicio) && !m.getFecha().isAfter(fechaFin))
                .collect(Collectors.toList());

        long totalLaborados = marcaciones.stream().filter(m -> "D".equalsIgnoreCase(m.getTipoAsistencia().getCodigo()) || "N".equalsIgnoreCase(m.getTipoAsistencia().getCodigo())).count();
        long totalFaltas = marcaciones.stream().filter(m -> "F".equalsIgnoreCase(m.getTipoAsistencia().getCodigo())).count();
        long totalDescansos = marcaciones.stream().filter(m -> "DL".equalsIgnoreCase(m.getTipoAsistencia().getCodigo())).count();
        long totalVacaciones = marcaciones.stream().filter(m -> "V".equalsIgnoreCase(m.getTipoAsistencia().getCodigo())).count();

        Map<String, Object> asistenciaMes = new HashMap<>();
        asistenciaMes.put("mes", consultaMes);
        asistenciaMes.put("anio", consultaAnio);
        asistenciaMes.put("totalLaborados", totalLaborados);
        asistenciaMes.put("totalFaltas", totalFaltas);
        asistenciaMes.put("totalDescansos", totalDescansos);
        asistenciaMes.put("totalVacaciones", totalVacaciones);

        return DashboardResumenDTO.builder()
                .totalTrabajadoresActivos(activos)
                .totalTrabajadoresInactivos(inactivos)
                .totalSedesActivas(totalSedes)
                .totalEmpresas(totalEmpresas)
                .totalPlanillasCerradas(cerradas)
                .montoHistoricoPlanillas(montoTotal)
                .trabajadoresPorSede(porSede)
                .resumenAsistenciaMes(asistenciaMes)
                .build();
    }
}
