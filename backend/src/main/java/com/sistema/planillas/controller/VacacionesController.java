package com.sistema.planillas.controller;

import com.sistema.planillas.service.AuditoriaService;
import com.sistema.planillas.service.NotificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/vacaciones")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class VacacionesController {

    private final JdbcTemplate jdbc;
    private final AuditoriaService auditoriaService;
    private final NotificacionService notificacionService;

    @PostMapping
    public ResponseEntity<?> crearSolicitud(@RequestBody Map<String, Object> body,
                                             Authentication auth) {
        try {
            Long trabajadorId = Long.valueOf(body.get("trabajadorId").toString());
            String fechaInicio = body.get("fechaInicio").toString();
            String fechaFin = body.get("fechaFin").toString();
            int dias = Integer.parseInt(body.get("dias").toString());
            String observaciones = body.get("observaciones") != null ? body.get("observaciones").toString() : null;

            // Insertar en solicitudes_vacaciones
            Long id = jdbc.queryForObject(
                "INSERT INTO solicitudes_vacaciones (trabajador_id, fecha_inicio, fecha_fin, dias, estado, observaciones) " +
                "VALUES (?, ?::date, ?::date, ?, 'PENDIENTE', ?) RETURNING id",
                Long.class,
                trabajadorId, fechaInicio, fechaFin, dias, observaciones
            );

            // Auditoría
            String usuarioUuid = auth != null ? auth.getPrincipal().toString() : "SISTEMA";
            String usuarioNombre = obtenerNombre(usuarioUuid);
            auditoriaService.registrar(usuarioUuid, usuarioNombre,
                "CREAR_SOLICITUD_VACACION", "solicitudes_vacaciones", id,
                "Solicitud de " + dias + " días: " + fechaInicio + " al " + fechaFin);

            // Notificar a GERENTE_SEDE y SUPERVISOR_RRHH
            String nombreTrabajador = obtenerNombreTrabajador(trabajadorId);
            notificacionService.notificarSolicitudVacaciones(trabajadorId, id, nombreTrabajador, fechaInicio, fechaFin);

            return ResponseEntity.ok(Map.of("id", id, "estado", "PENDIENTE"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("mensaje", "Error: " + e.getMessage()));
        }
    }

    @GetMapping("/trabajador/{trabajadorId}")
    public ResponseEntity<?> listarPorTrabajador(@PathVariable Long trabajadorId) {
        try {
            var lista = jdbc.queryForList(
                "SELECT id, trabajador_id, fecha_inicio, fecha_fin, dias, estado, created_at " +
                "FROM solicitudes_vacaciones WHERE trabajador_id = ? ORDER BY created_at DESC",
                trabajadorId
            );
            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("mensaje", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id,
                                            @RequestBody Map<String, String> body,
                                            Authentication auth) {
        try {
            String nuevoEstado = body.get("estado");
            jdbc.update("UPDATE solicitudes_vacaciones SET estado = ? WHERE id = ?", nuevoEstado, id);
            String usuarioUuid = auth != null ? auth.getPrincipal().toString() : "SISTEMA";
            String usuarioNombre = obtenerNombre(usuarioUuid);
            auditoriaService.registrar(usuarioUuid, usuarioNombre,
                "ACTUALIZAR_VACACION", "solicitudes_vacaciones", id,
                "Estado cambiado a " + nuevoEstado);
            return ResponseEntity.ok(Map.of("mensaje", "Estado actualizado"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("mensaje", e.getMessage()));
        }
    }

    private String obtenerNombre(String uuid) {
        try {
            return jdbc.queryForObject(
                "SELECT nombre FROM usuarios_perfil WHERE id = ?::uuid", String.class, uuid);
        } catch (Exception e) {
            return "SISTEMA";
        }
    }

    private String obtenerNombreTrabajador(Long trabajadorId) {
        try {
            return jdbc.queryForObject(
                "SELECT CONCAT(nombres, ' ', apellido_paterno) FROM trabajadores WHERE id = ?",
                String.class, trabajadorId);
        } catch (Exception e) {
            return "Trabajador #" + trabajadorId;
        }
    }
}
