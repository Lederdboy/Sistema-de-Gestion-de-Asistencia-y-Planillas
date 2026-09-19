package com.sistema.planillas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoletaPagoDTO {
    // Empresa
    private String rucEmpresa;
    private String razonSocialEmpresa;
    private String direccionEmpresa;

    // Periodo
    private String periodo;
    private String estadoPlanilla;

    // Trabajador
    private Long trabajadorId;
    private String tipoDocumento;
    private String numeroDocumento;
    private String nombreCompleto;
    private String cargo;
    private String sede;
    private LocalDate fechaIngreso;

    // Asistencia
    private Integer diasTrabajados;
    private Integer diasNoches;
    private Integer diasFaltas;
    private Integer diasDescanso;
    private Integer diasVacaciones;

    // Ingresos
    private BigDecimal sueldoBasico;
    private BigDecimal asignacionFamiliar;
    private BigDecimal totalIngresos;

    // Descuentos al trabajador
    private BigDecimal descuentoFaltas;
    private BigDecimal descuentoPension; // AFP u ONP 13%
    private BigDecimal totalDescuentos;

    // Aportes empleador
    private BigDecimal aporteEssalud; // 9%

    // Total Neto
    private BigDecimal netoPagar;

    @Builder.Default
    private LocalDateTime fechaEmision = LocalDateTime.now();
}
