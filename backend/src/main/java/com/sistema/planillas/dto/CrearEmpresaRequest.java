package com.sistema.planillas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrearEmpresaRequest {

    @NotBlank(message = "El RUC es obligatorio")
    @Pattern(regexp = "^(10|20)[0-9]{9}$", message = "El RUC debe tener 11 dígitos y comenzar con 10 o 20")
    private String ruc;

    @NotBlank(message = "La razón social es obligatoria")
    @Size(max = 150, message = "La razón social no puede exceder 150 caracteres")
    private String razonSocial;

    @Size(max = 150, message = "El nombre comercial no puede exceder 150 caracteres")
    private String nombreComercial;

    @Size(max = 255, message = "La dirección no puede exceder 255 caracteres")
    private String direccion;
}
