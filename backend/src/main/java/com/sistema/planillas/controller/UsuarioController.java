package com.sistema.planillas.controller;

import com.sistema.planillas.dto.CrearUsuarioRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.transaction.Transactional;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager em;

    @PostMapping
    @Transactional
    public ResponseEntity<?> crearUsuario(@RequestBody CrearUsuarioRequest req) {
        try {
            // Verificar email único
            Long count = (Long) em.createNativeQuery(
                    "SELECT COUNT(*) FROM usuarios_perfil WHERE email = :email"
            ).setParameter("email", req.getEmail()).getSingleResult();
            if (count > 0) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("mensaje", "El correo ya está registrado en el sistema"));
            }

            String nuevoUuid = UUID.randomUUID().toString();
            String passwordHash = passwordEncoder.encode(req.getPassword());

            em.createNativeQuery(
                    "INSERT INTO usuarios_perfil (id, nombre, email, password_hash, rol, sede_id, empresa_id, cargo, creado_por, activo) " +
                    "VALUES (CAST(:id AS uuid), :nombre, :email, :hash, :rol, :sedeId, :empresaId, :cargo, CAST(:creadoPor AS uuid), true)"
            )
            .setParameter("id", nuevoUuid)
            .setParameter("nombre", req.getNombre())
            .setParameter("email", req.getEmail())
            .setParameter("hash", passwordHash)
            .setParameter("rol", req.getRol())
            .setParameter("sedeId", req.getSede_id())
            .setParameter("empresaId", req.getEmpresa_id())
            .setParameter("cargo", req.getCargo())
            .setParameter("creadoPor", req.getCreado_por())
            .executeUpdate();

            return ResponseEntity.ok(Map.of("mensaje", "Usuario creado exitosamente", "uuid", nuevoUuid));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error interno: " + e.getMessage()));
        }
    }

    @PatchMapping("/{uuid}/reset-password")
    @Transactional
    public ResponseEntity<?> resetPassword(@PathVariable String uuid,
                                            @RequestBody Map<String, String> body) {
        try {
            String nuevoHash = passwordEncoder.encode(body.get("password"));
            int updated = em.createNativeQuery(
                    "UPDATE usuarios_perfil SET password_hash = :hash WHERE id = CAST(:uuid AS uuid)"
            ).setParameter("hash", nuevoHash)
             .setParameter("uuid", uuid)
             .executeUpdate();

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
    @Transactional
    public ResponseEntity<?> eliminarUsuario(@PathVariable String uuid) {
        try {
            int deleted = em.createNativeQuery(
                    "DELETE FROM usuarios_perfil WHERE id = CAST(:uuid AS uuid)"
            ).setParameter("uuid", uuid).executeUpdate();

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
