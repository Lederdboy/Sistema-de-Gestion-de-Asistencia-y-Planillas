package com.sistema.planillas.controller;

import com.sistema.planillas.dto.DashboardResumenDTO;
import com.sistema.planillas.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/resumen")
    public ResponseEntity<DashboardResumenDTO> obtenerResumen(
            @RequestParam(value = "mes", required = false) Integer mes,
            @RequestParam(value = "anio", required = false) Integer anio
    ) {
        return ResponseEntity.ok(dashboardService.obtenerResumenGeneral(mes, anio));
    }
}
