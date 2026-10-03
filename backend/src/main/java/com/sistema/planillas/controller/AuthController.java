package com.sistema.planillas.controller;

import com.sistema.planillas.config.JwtUtil;
import com.sistema.planillas.dto.CambiarPasswordRequest;
import com.sistema.planillas.dto.LoginRequest;
import com.sistema.planillas.dto.LoginResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbc;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            // Buscar primero en usuarios_perfil (gerentes, contadores, etc)
            List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT up.id::text, up.email, up.nombre, up.rol, up.sede_id, up.empresa_id, " +
                "up.cargo, up.activo, up.password_hash, s.nombre AS sede_nombre " +
                "FROM usuarios_perfil up " +
                "LEFT JOIN sedes s ON s.id = up.sede_id " +
                "WHERE up.email = ?",
                req.getEmail()
            );

            // Si no está en usuarios_perfil, buscar en trabajadores
            if (rows.isEmpty()) {
                rows = jdbc.queryForList(
                    "SELECT t.id::text AS id, t.email, " +
                    "(t.apellido_paterno || ' ' || t.apellido_materno || ' ' || t.nombres) AS nombre, " +
                    "'TRABAJADOR' AS rol, t.sede_id, t.empresa_id, " +
                    "t.cargo, t.activo, t.password_hash, s.nombre AS sede_nombre " +
                    "FROM trabajadores t " +
                    "LEFT JOIN sedes s ON s.id = t.sede_id " +
                    "WHERE t.email = ?",
                    req.getEmail()
                );
            }

            if (rows.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("mensaje", "Credenciales incorrectas."));
            }

            Map<String, Object> row = rows.get(0);

            boolean activo = (Boolean) row.get("activo");
            if (!activo) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("mensaje", "Tu cuenta está desactivada. Contacta al administrador."));
            }

            String passwordHash = (String) row.get("password_hash");
            if (passwordHash == null || !passwordEncoder.matches(req.getPassword(), passwordHash)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("mensaje", "Credenciales incorrectas."));
            }

            String uuid     = (String) row.get("id");
            String email    = (String) row.get("email");
            String nombre   = (String) row.get("nombre");
            String rol      = (String) row.get("rol");
            Long sedeId     = row.get("sede_id") != null ? ((Number) row.get("sede_id")).longValue() : null;
            Long empresaId  = row.get("empresa_id") != null ? ((Number) row.get("empresa_id")).longValue() : null;
            String cargo    = (String) row.get("cargo");
            String sedeName = (String) row.get("sede_nombre");

            String token = jwtUtil.generateToken(uuid, email, rol);

            return ResponseEntity.ok(LoginResponse.builder()
                    .token(token)
                    .uuid(uuid)
                    .email(email)
                    .nombre(nombre)
                    .rol(rol)
                    .sedeId(sedeId)
                    .sedeName(sedeName)
                    .empresaId(empresaId)
                    .cargo(cargo)
                    .build());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error interno: " + e.getMessage()));
        }
    }

    // ENDPOINT TEMPORAL — solo para generar hash BCrypt, eliminar en producción
    @GetMapping("/hash/{password}")
    public ResponseEntity<?> generarHash(@PathVariable String password) {
        return ResponseEntity.ok(Map.of("hash", passwordEncoder.encode(password)));
    }

    // ENDPOINT TEMPORAL — setea email y password directo en BD, eliminar en producción
    @PostMapping("/setup-admin")
    public ResponseEntity<?> setupAdmin(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String password = body.get("password");
            String uuid = body.get("uuid");
            jdbc.update(
                "UPDATE usuarios_perfil SET email = ?, password_hash = ? WHERE id = ?::uuid",
                email, passwordEncoder.encode(password), uuid
            );
            return ResponseEntity.ok(Map.of("mensaje", "Admin configurado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error: " + e.getMessage()));
        }
    }

    @PatchMapping("/cambiar-password")
    public ResponseEntity<?> cambiarPassword(@RequestBody CambiarPasswordRequest req,
                                              Authentication auth) {
        try {
            String uuid = (String) auth.getPrincipal();

            String hashActual = jdbc.queryForObject(
                "SELECT password_hash FROM usuarios_perfil WHERE id = ?::uuid",
                String.class, uuid
            );

            if (hashActual == null || !passwordEncoder.matches(req.getPasswordActual(), hashActual)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("mensaje", "La contraseña actual es incorrecta."));
            }

            jdbc.update(
                "UPDATE usuarios_perfil SET password_hash = ? WHERE id = ?::uuid",
                passwordEncoder.encode(req.getPasswordNueva()), uuid
            );

            return ResponseEntity.ok(Map.of("mensaje", "Contraseña actualizada correctamente."));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error al cambiar contraseña: " + e.getMessage()));
        }
    }
}
