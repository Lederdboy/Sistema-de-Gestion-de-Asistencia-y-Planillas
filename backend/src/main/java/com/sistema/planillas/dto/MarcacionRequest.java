package com.sistema.planillas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarcacionRequest {

    @NotNull(message = "El id de trabajador es obligatorio")
    private Long trabajadorId;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;

    @NotNull(message = "El código de asistencia es obligatorio")
    private String codigoAsistencia; // D, N, F, DL, V

    private String observacion;
    private String usuario;
}
