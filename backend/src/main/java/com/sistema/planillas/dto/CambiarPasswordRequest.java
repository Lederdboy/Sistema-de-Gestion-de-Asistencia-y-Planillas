package com.sistema.planillas.dto;

import lombok.Data;

@Data
public class CambiarPasswordRequest {
    private String passwordActual;
    private String passwordNueva;
}
