package com.sistema.planillas.controller;

import com.sistema.planillas.entity.DescansoMedico;
import com.sistema.planillas.service.AuditoriaService;
import com.sistema.planillas.service.DescansoMedicoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/descansos-medicos")
@RequiredArgsConstructor
public class DescansoMedicoController {

    private final DescansoMedicoService descansoService;
    private final AuditoriaService auditoriaService;

    @GetMapping("/trabajador/{trabajadorId}")
    public ResponseEntity<List<DescansoMedico>> listar(@PathVariable Long trabajadorId) {
        return ResponseEntity.ok(descansoService.listarPorTrabajador(trabajadorId));
    }

    @PostMapping
    public ResponseEntity<DescansoMedico> registrar(@RequestBody Map<String, Object> body,
                                                     Authentication auth) {
        Long trabajadorId = Long.valueOf(body.get("trabajadorId").toString());
        LocalDate fechaInicio = LocalDate.parse(body.get("fechaInicio").toString());
        LocalDate fechaFin = LocalDate.parse(body.get("fechaFin").toString());
        String tipo = body.getOrDefault("tipoDescanso", "ENFERMEDAD").toString();
        String certificado = body.containsKey("numeroCertificado") ? body.get("numeroCertificado").toString() : null;
        String centro = body.containsKey("centroMedico") ? body.get("centroMedico").toString() : null;
        String obs = body.containsKey("observaciones") ? body.get("observaciones").toString() : null;

        DescansoMedico creado = descansoService.registrar(trabajadorId, fechaInicio, fechaFin, tipo, certificado, centro, obs);

        if (auth != null) {
            auditoriaService.registrar(
                auth.getPrincipal().toString(), auth.getName(),
                "REGISTRAR_DESCANSO", "descansos_medicos", creado.getId(),
                "Descanso " + tipo + " del " + fechaInicio + " al " + fechaFin
            );
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<DescansoMedico> cambiarEstado(@PathVariable Long id,
                                                         @RequestBody Map<String, String> body,
                                                         Authentication auth) {
        DescansoMedico actualizado = descansoService.cambiarEstado(id, body.get("estado"));

        if (auth != null) {
            auditoriaService.registrar(
                auth.getPrincipal().toString(), auth.getName(),
                "CAMBIAR_ESTADO_DESCANSO", "descansos_medicos", id,
                "Nuevo estado: " + body.get("estado")
            );
        }

        return ResponseEntity.ok(actualizado);
    }
}
