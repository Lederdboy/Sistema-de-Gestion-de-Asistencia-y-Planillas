package com.sistema.planillas.controller;

import com.sistema.planillas.entity.Notificacion;
import com.sistema.planillas.service.NotificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;

    @GetMapping
    public ResponseEntity<List<Notificacion>> listar(Authentication auth) {
        return ResponseEntity.ok(notificacionService.obtenerNotificaciones(auth.getPrincipal().toString()));
    }

    @GetMapping("/no-leidas")
    public ResponseEntity<Map<String, Long>> contarNoLeidas(Authentication auth) {
        long count = notificacionService.contarNoLeidas(auth.getPrincipal().toString());
        return ResponseEntity.ok(Map.of("total", count));
    }

    @PatchMapping("/{id}/leer")
    public ResponseEntity<?> marcarLeida(@PathVariable Long id) {
        notificacionService.marcarLeida(id);
        return ResponseEntity.ok(Map.of("mensaje", "Notificación marcada como leída"));
    }

    @PatchMapping("/leer-todas")
    public ResponseEntity<?> marcarTodasLeidas(Authentication auth) {
        notificacionService.marcarTodasLeidas(auth.getPrincipal().toString());
        return ResponseEntity.ok(Map.of("mensaje", "Todas las notificaciones marcadas como leídas"));
    }
}
