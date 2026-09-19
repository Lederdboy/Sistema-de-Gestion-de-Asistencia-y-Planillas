package com.sistema.planillas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResumenDTO {
    private long totalTrabajadoresActivos;
    private long totalTrabajadoresInactivos;
    private long totalSedesActivas;
    private long totalEmpresas;
    private long totalPlanillasCerradas;
    private BigDecimal montoHistoricoPlanillas;
    private Map<String, Long> trabajadoresPorSede;
    private Map<String, Object> resumenAsistenciaMes;
}
