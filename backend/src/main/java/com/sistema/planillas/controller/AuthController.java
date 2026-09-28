package com.sistema.planillas.controller;

import com.sistema.planillas.config.JwtUtil;
import com.sistema.planillas.dto.CambiarPasswordRequest;
import com.sistema.planillas.dto.LoginRequest;
import com.sistema.planillas.dto.LoginResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager em;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            // Consulta nativa a usuarios_perfil con join a sedes
            Object[] row = (Object[]) em.createNativeQuery(
                    "SELECT up.id, up.email, up.nombre, up.rol, up.sede_id, up.empresa_id, " +
                    "up.cargo, up.activo, up.password_hash, s.nombre AS sede_nombre " +
                    "FROM usuarios_perfil up " +
                    "LEFT JOIN sedes s ON s.id = up.sede_id " +
                    "WHERE up.email = :email"
            ).setParameter("email", req.getEmail()).getSingleResult();

            boolean activo = (Boolean) row[7];
            if (!activo) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("mensaje", "Tu cuenta está desactivada. Contacta al administrador."));
            }

            String passwordHash = (String) row[8];
            if (passwordHash == null || !passwordEncoder.matches(req.getPassword(), passwordHash)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("mensaje", "Credenciales incorrectas."));
            }

            String uuid     = row[0].toString();
            String email    = (String) row[1];
            String nombre   = (String) row[2];
            String rol      = (String) row[3];
            Long sedeId     = row[4] != null ? ((Number) row[4]).longValue() : null;
            Long empresaId  = row[5] != null ? ((Number) row[5]).longValue() : null;
            String cargo    = (String) row[6];
            String sedeName = (String) row[9];

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

        } catch (NoResultException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensaje", "Credenciales incorrectas."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error interno: " + e.getMessage()));
        }
    }

    @PatchMapping("/cambiar-password")
    @javax.transaction.Transactional
    public ResponseEntity<?> cambiarPassword(@RequestBody CambiarPasswordRequest req,
                                              Authentication auth) {
        try {
            String uuid = (String) auth.getPrincipal();

            Object[] row = (Object[]) em.createNativeQuery(
                    "SELECT password_hash FROM usuarios_perfil WHERE id = :uuid"
            ).setParameter("uuid", java.util.UUID.fromString(uuid)).getSingleResult();

            String hashActual = (String) row[0];
            if (hashActual == null || !passwordEncoder.matches(req.getPasswordActual(), hashActual)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("mensaje", "La contraseña actual es incorrecta."));
            }

            String nuevoHash = passwordEncoder.encode(req.getPasswordNueva());
            em.createNativeQuery(
                    "UPDATE usuarios_perfil SET password_hash = :hash WHERE id = :uuid"
            ).setParameter("hash", nuevoHash)
             .setParameter("uuid", java.util.UUID.fromString(uuid))
             .executeUpdate();

            return ResponseEntity.ok(Map.of("mensaje", "Contraseña actualizada correctamente."));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error al cambiar contraseña: " + e.getMessage()));
        }
    }
}
