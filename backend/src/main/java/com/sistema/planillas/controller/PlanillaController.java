package com.sistema.planillas.controller;

import com.sistema.planillas.dto.CalcularPlanillaRequest;
import com.sistema.planillas.dto.CerrarPlanillaRequest;
import com.sistema.planillas.dto.PlanillaResumenDTO;
import com.sistema.planillas.service.AuditoriaService;
import com.sistema.planillas.service.NotificacionService;
import com.sistema.planillas.service.PlanillaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/planilla")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PlanillaController {

    private final PlanillaService planillaService;
    private final com.sistema.planillas.service.ExportacionPlanillaService exportacionPlanillaService;
    private final AuditoriaService auditoriaService;
    private final NotificacionService notificacionService;

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
    public ResponseEntity<PlanillaResumenDTO> cerrarPlanilla(@Valid @RequestBody CerrarPlanillaRequest request,
                                                              Authentication auth) {
        PlanillaResumenDTO resumen = planillaService.cerrarPlanilla(request);
        String usuarioUuid = auth != null ? auth.getPrincipal().toString() : "SISTEMA";
        String usuarioNombre = request.getUsuario() != null ? request.getUsuario() : "SISTEMA";
        auditoriaService.registrar(usuarioUuid, usuarioNombre,
            "CERRAR_PLANILLA", "planillas_resumen", null,
            "Planilla periodo " + request.getPeriodo() + " cerrada");
        notificacionService.notificarPlanillaCerrada(
            request.getEmpresaId(), request.getPeriodo(), usuarioNombre);
        return ResponseEntity.ok(resumen);
    }

    @GetMapping("/auditoria")
    public ResponseEntity<?> obtenerAuditoria(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return ResponseEntity.ok(auditoriaService.listarTodos(pageable));
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

    @GetMapping("/exportar/bancario")
    public ResponseEntity<byte[]> exportarBancario(@RequestParam("periodo") String periodo) {
        byte[] contenido = exportacionPlanillaService.generarArchivoBancario(periodo);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"dispersion_haberes_" + periodo + ".txt\"")
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "text/plain; charset=UTF-8")
                .body(contenido);
    }

    @GetMapping("/exportar/csv")
    public ResponseEntity<byte[]> exportarCsv(@RequestParam("periodo") String periodo) {
        byte[] contenido = exportacionPlanillaService.generarConsolidadoCsv(periodo);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"planilla_consolidada_" + periodo + ".csv\"")
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8")
                .body(contenido);
    }
}
