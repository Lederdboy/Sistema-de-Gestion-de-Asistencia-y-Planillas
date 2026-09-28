package com.sistema.planillas.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
    private String token;
    private String uuid;
    private String email;
    private String nombre;
    private String rol;
    private Long sedeId;
    private String sedeName;
    private Long empresaId;
    private String cargo;
}
