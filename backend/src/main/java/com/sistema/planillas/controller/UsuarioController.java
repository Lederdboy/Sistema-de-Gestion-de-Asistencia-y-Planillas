package com.sistema.planillas.controller;

import com.sistema.planillas.dto.CrearUsuarioRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/usuarios")
public class UsuarioController {

    @Value("${SUPABASE_URL}")
    private String supabaseUrl;

    @Value("${SUPABASE_SERVICE_ROLE_KEY}")
    private String serviceRoleKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping
    public ResponseEntity<?> crearUsuario(@RequestBody CrearUsuarioRequest req) {
        try {
            // 1. Crear usuario en Supabase Auth via Admin API
            String authUrl = supabaseUrl + "/auth/v1/admin/users";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("apikey", serviceRoleKey);
            headers.set("Authorization", "Bearer " + serviceRoleKey);

            Map<String, Object> authBody = new HashMap<>();
            authBody.put("email", req.getEmail());
            authBody.put("password", req.getPassword());
            authBody.put("email_confirm", true); // confirmar email automáticamente

            HttpEntity<Map<String, Object>> authRequest = new HttpEntity<>(authBody, headers);
            ResponseEntity<Map> authResponse = restTemplate.postForEntity(authUrl, authRequest, Map.class);

            if (!authResponse.getStatusCode().is2xxSuccessful() || authResponse.getBody() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("mensaje", "Error al crear usuario en autenticación"));
            }

            String nuevoUuid = (String) authResponse.getBody().get("id");

            // 2. Insertar en usuarios_perfil via REST API de Supabase
            String perfilUrl = supabaseUrl + "/rest/v1/usuarios_perfil";

            HttpHeaders perfilHeaders = new HttpHeaders();
            perfilHeaders.setContentType(MediaType.APPLICATION_JSON);
            perfilHeaders.set("apikey", serviceRoleKey);
            perfilHeaders.set("Authorization", "Bearer " + serviceRoleKey);
            perfilHeaders.set("Prefer", "return=minimal");

            Map<String, Object> perfilBody = new HashMap<>();
            perfilBody.put("id", nuevoUuid);
            perfilBody.put("nombre", req.getNombre());
            perfilBody.put("email", req.getEmail());
            perfilBody.put("rol", req.getRol());
            perfilBody.put("empresa_id", req.getEmpresa_id());
            perfilBody.put("activo", true);
            if (req.getSede_id() != null) perfilBody.put("sede_id", req.getSede_id());
            if (req.getCargo() != null) perfilBody.put("cargo", req.getCargo());
            if (req.getCreado_por() != null) perfilBody.put("creado_por", req.getCreado_por());

            HttpEntity<Map<String, Object>> perfilRequest = new HttpEntity<>(perfilBody, perfilHeaders);
            restTemplate.postForEntity(perfilUrl, perfilRequest, String.class);

            return ResponseEntity.ok(Map.of("mensaje", "Usuario creado exitosamente", "uuid", nuevoUuid));

        } catch (Exception e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("already registered")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("mensaje", "El correo ya está registrado en el sistema"));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error interno: " + e.getMessage()));
        }
    }

    @PatchMapping("/{uuid}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable String uuid, @RequestBody Map<String, String> body) {
        try {
            String authUrl = supabaseUrl + "/auth/v1/admin/users/" + uuid;
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("apikey", serviceRoleKey);
            headers.set("Authorization", "Bearer " + serviceRoleKey);
            Map<String, Object> payload = new HashMap<>();
            payload.put("password", body.get("password"));
            restTemplate.exchange(authUrl, org.springframework.http.HttpMethod.PUT, new HttpEntity<>(payload, headers), String.class);
            return ResponseEntity.ok(Map.of("mensaje", "Contraseña actualizada correctamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error al resetear contraseña: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable String uuid) {
        try {
            // 1. Eliminar de usuarios_perfil via REST API
            String perfilUrl = supabaseUrl + "/rest/v1/usuarios_perfil?id=eq." + uuid;
            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey", serviceRoleKey);
            headers.set("Authorization", "Bearer " + serviceRoleKey);
            restTemplate.exchange(perfilUrl, org.springframework.http.HttpMethod.DELETE, new HttpEntity<>(headers), String.class);

            // 2. Eliminar de auth.users via Admin API
            String authUrl = supabaseUrl + "/auth/v1/admin/users/" + uuid;
            HttpHeaders authHeaders = new HttpHeaders();
            authHeaders.set("apikey", serviceRoleKey);
            authHeaders.set("Authorization", "Bearer " + serviceRoleKey);
            restTemplate.exchange(authUrl, org.springframework.http.HttpMethod.DELETE, new HttpEntity<>(authHeaders), String.class);

            return ResponseEntity.ok(Map.of("mensaje", "Usuario eliminado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error al eliminar usuario: " + e.getMessage()));
        }
    }
}
