package com.sistema.planillas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalcularPlanillaRequest {

    @NotBlank(message = "El periodo YYYYMM es obligatorio")
    private String periodo;

    @NotNull(message = "El id de empresa es obligatorio")
    private Long empresaId;
}
