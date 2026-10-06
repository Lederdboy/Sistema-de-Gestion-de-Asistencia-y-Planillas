package com.sistema.planillas.controller;

import com.sistema.planillas.dto.CrearUsuarioRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwordEncoder;

    @PostMapping
    public ResponseEntity<?> crearUsuario(@RequestBody CrearUsuarioRequest req) {
        try {
            Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM usuarios_perfil WHERE email = ?",
                Integer.class, req.getEmail()
            );
            if (count != null && count > 0) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("mensaje", "El correo ya está registrado en el sistema"));
            }

            String nuevoUuid = UUID.randomUUID().toString();
            String passwordHash = passwordEncoder.encode(req.getPassword());

            jdbc.update(
                "INSERT INTO usuarios_perfil (id, nombre, email, password_hash, rol, sede_id, empresa_id, cargo, creado_por, activo) " +
                "VALUES (?::uuid, ?, ?, ?, ?, ?, ?, ?, CAST(? AS uuid), true)",
                nuevoUuid,
                req.getNombre(),
                req.getEmail(),
                passwordHash,
                req.getRol(),
                req.getSede_id(),
                req.getEmpresa_id(),
                req.getCargo(),
                req.getCreado_por()
            );

            return ResponseEntity.ok(Map.of("mensaje", "Usuario creado exitosamente", "uuid", nuevoUuid));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error interno: " + e.getMessage()));
        }
    }

    @PatchMapping("/{uuid}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable String uuid,
                                            @RequestBody Map<String, String> body,
                                            org.springframework.security.core.Authentication auth) {
        // Solo GERENTE_GENERAL o GERENTE_SEDE pueden resetear passwords
        if (auth != null) {
            try {
                String solicitanteUuid = auth.getPrincipal().toString();
                String rolSolicitante = jdbc.queryForObject(
                    "SELECT rol FROM usuarios_perfil WHERE id = ?::uuid",
                    String.class, solicitanteUuid
                );
                if (rolSolicitante != null &&
                    !rolSolicitante.equals("GERENTE_GENERAL") &&
                    !rolSolicitante.equals("GERENTE_SEDE")) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("mensaje", "No tienes permisos para resetear contraseñas"));
                }
            } catch (Exception ignored) {}
        }
        try {
            String nuevoHash = passwordEncoder.encode(body.get("password"));
            int updated = jdbc.update(
                "UPDATE usuarios_perfil SET password_hash = ? WHERE id = ?::uuid",
                nuevoHash, uuid
            );
            if (updated == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("mensaje", "Usuario no encontrado"));
            }
            return ResponseEntity.ok(Map.of("mensaje", "Contraseña actualizada correctamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error al resetear contraseña: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable String uuid) {
        try {
            int deleted = jdbc.update(
                "DELETE FROM usuarios_perfil WHERE id = ?::uuid", uuid
            );
            if (deleted == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("mensaje", "Usuario no encontrado"));
            }
            return ResponseEntity.ok(Map.of("mensaje", "Usuario eliminado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error al eliminar usuario: " + e.getMessage()));
        }
    }
}
