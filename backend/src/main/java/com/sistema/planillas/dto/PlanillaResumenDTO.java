package com.sistema.planillas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanillaResumenDTO {
    private String periodo;
    private Integer totalTrabajadores;
    private Integer totalCalculados;
    private Integer totalPendientes;
    private BigDecimal montoTotalNeto;
    private String estado; // EN_PROCESO, CERRADO
    private LocalDateTime fechaCalculo;
    private LocalDateTime fechaCierre;
}
