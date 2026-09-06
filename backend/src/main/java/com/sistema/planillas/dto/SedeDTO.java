package com.sistema.planillas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SedeDTO {
    private Long id;
    private Long empresaId;
    private String codigo;
    private String nombre;
    private String departamento;
    private String distrito;
    private Boolean activo;
}
