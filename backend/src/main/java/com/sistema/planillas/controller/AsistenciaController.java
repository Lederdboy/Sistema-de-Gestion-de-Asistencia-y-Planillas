package com.sistema.planillas.controller;

import com.sistema.planillas.dto.MarcacionRequest;
import com.sistema.planillas.dto.MatrizAsistenciaRowDTO;
import com.sistema.planillas.service.AsistenciaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/asistencia", "/api/v2/asistencia"})
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AsistenciaController {

    private final AsistenciaService asistenciaService;

    @GetMapping("/matriz")
    public ResponseEntity<List<MatrizAsistenciaRowDTO>> obtenerMatrizAsistencia(
            @RequestParam("mes") int mes,
            @RequestParam("anio") int anio,
            @RequestParam("sedeId") Long sedeId
    ) {
        List<MatrizAsistenciaRowDTO> matriz = asistenciaService.obtenerMatrizMensual(mes, anio, sedeId);
        return ResponseEntity.ok(matriz);
    }

    @PutMapping("/marcacion")
    public ResponseEntity<Void> actualizarMarcacion(@Valid @RequestBody MarcacionRequest request) {
        asistenciaService.registrarOActualizarMarcacion(request);
        return ResponseEntity.ok().build();
    }

    // --- NUEVO PARA VERSION 2 (DEV2) ---
    @GetMapping("/version")
    public ResponseEntity<Map<String, Object>> obtenerInfoVersion() {
        Map<String, Object> info = new HashMap<>();
        info.put("modulo", "Asistencia y Marcaciones");
        info.put("version", "2.0.0");
        info.put("developer", "DEV2 - Kalef");
        info.put("status", "UP");
        return ResponseEntity.ok(info);
    }
}