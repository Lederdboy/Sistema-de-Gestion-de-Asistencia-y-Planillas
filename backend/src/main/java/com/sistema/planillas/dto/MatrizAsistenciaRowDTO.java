package com.sistema.planillas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatrizAsistenciaRowDTO {
    private Long trabajadorId;
    private String numeroDocumento;
    private String nombreCompleto;
    private String cargo;
    
    // Mapa key: Dia (1..31 en formato String "01", "02"), value: codigoAsistencia ("D", "N", "F", "DL", "V")
    private Map<String, String> dias;

    // Resumen de conteos mensuales
    private int totalDiasTrabajados; // D
    private int totalNoches;          // N
    private int totalFaltas;          // F
    private int totalDescansos;       // DL
    private int totalVacaciones;      // V
}
