package com.sistema.planillas.controller;

import com.sistema.planillas.dto.CalcularPlanillaRequest;
import com.sistema.planillas.dto.CerrarPlanillaRequest;
import com.sistema.planillas.dto.PlanillaResumenDTO;
import com.sistema.planillas.service.PlanillaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/planilla")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PlanillaController {

    private final PlanillaService planillaService;

    @GetMapping("/resumen")
    public ResponseEntity<PlanillaResumenDTO> obtenerResumen(@RequestParam("periodo") String periodo) {
        PlanillaResumenDTO resumen = planillaService.obtenerResumenPeriodo(periodo);
        return ResponseEntity.ok(resumen);
    }

    @PostMapping("/calcular")
    public ResponseEntity<PlanillaResumenDTO> calcularPlanilla(@Valid @RequestBody CalcularPlanillaRequest request) {
        PlanillaResumenDTO resumen = planillaService.calcularPlanilla(request);
        return ResponseEntity.ok(resumen);
    }

    @PostMapping("/cerrar")
    public ResponseEntity<PlanillaResumenDTO> cerrarPlanilla(@Valid @RequestBody CerrarPlanillaRequest request) {
        PlanillaResumenDTO resumen = planillaService.cerrarPlanilla(request);
        return ResponseEntity.ok(resumen);
    }

    @GetMapping("/detalles")
    public ResponseEntity<java.util.List<com.sistema.planillas.dto.PlanillaDetalleDTO>> obtenerDetalles(@RequestParam("periodo") String periodo) {
        return ResponseEntity.ok(planillaService.listarDetallesPeriodo(periodo));
    }

    @GetMapping("/boleta/{trabajadorId}")
    public ResponseEntity<com.sistema.planillas.dto.BoletaPagoDTO> obtenerBoleta(
            @PathVariable Long trabajadorId,
            @RequestParam("periodo") String periodo
    ) {
        return ResponseEntity.ok(planillaService.obtenerBoletaTrabajador(periodo, trabajadorId));
    }
}
