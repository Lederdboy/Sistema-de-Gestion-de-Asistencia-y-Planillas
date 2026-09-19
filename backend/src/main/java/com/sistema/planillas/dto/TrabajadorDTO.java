package com.sistema.planillas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrabajadorDTO {
    private Long id;
    private Long empresaId;
    private Long sedeId;
    private String nombreSede;
    private String tipoDocumento;
    private String numeroDocumento;
    private String nombres;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String nombreCompleto;
    private String cargo;
    private LocalDate fechaIngreso;
    private BigDecimal sueldoBasico;
    private BigDecimal sueldoDiario;
    private Boolean activo;
}
