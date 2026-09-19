package com.sistema.planillas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmpresaDTO {
    private Long id;
    private String ruc;
    private String razonSocial;
    private String nombreComercial;
    private String direccion;
    private Boolean activo;
    private LocalDateTime fechaCreacion;
}
