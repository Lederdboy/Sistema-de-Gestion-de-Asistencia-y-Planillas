package com.sistema.planillas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanillaDetalleDTO {
    private Long id;
    private Long trabajadorId;
    private String numeroDocumento;
    private String nombreCompleto;
    private String cargo;
    private String sede;
    private Integer diasTrabajados;
    private Integer diasNoches;
    private Integer diasFaltas;
    private Integer diasDescanso;
    private Integer diasVacaciones;
    private BigDecimal sueldoBasico;
    private BigDecimal asignacionFamiliar;
    private BigDecimal descuentoFaltas;
    private BigDecimal descuentoPension;
    private BigDecimal aporteEssalud;
    private BigDecimal totalIngresos;
    private BigDecimal totalDescuentos;
    private BigDecimal netoPagar;
    private Boolean calculado;
}
