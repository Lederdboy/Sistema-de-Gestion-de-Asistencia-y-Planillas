package com.sistema.planillas.service;

import com.sistema.planillas.entity.Notificacion;
import com.sistema.planillas.repository.NotificacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final JdbcTemplate jdbc;

    /** Notifica a todos los GERENTE_SEDE de una sede cuando un trabajador solicita vacaciones */
    @Transactional
    public void notificarSolicitudVacaciones(Long trabajadorId, Long solicitudId, String nombreTrabajador, String fechaInicio, String fechaFin) {
        // Obtener sede del trabajador
        List<Map<String, Object>> rows = jdbc.queryForList(
            "SELECT sede_id FROM trabajadores WHERE id = ?", trabajadorId
        );
        if (rows.isEmpty()) return;
        Long sedeId = ((Number) rows.get(0).get("sede_id")).longValue();

        // Buscar gerentes de esa sede
        List<Map<String, Object>> gerentes = jdbc.queryForList(
            "SELECT id::text FROM usuarios_perfil WHERE rol = 'GERENTE_SEDE' AND sede_id = ? AND activo = true",
            sedeId
        );

        for (Map<String, Object> gerente : gerentes) {
            notificacionRepository.save(Notificacion.builder()
                .destinatarioUuid((String) gerente.get("id"))
                .tipo("SOLICITUD_VACACIONES")
                .titulo("Nueva solicitud de vacaciones")
                .mensaje(nombreTrabajador + " solicita vacaciones del " + fechaInicio + " al " + fechaFin)
                .referenciaId(solicitudId)
                .build());
        }

        // Notificar también a SUPERVISOR_RRHH de la sede
        List<Map<String, Object>> supervisores = jdbc.queryForList(
            "SELECT id::text FROM usuarios_perfil WHERE rol = 'SUPERVISOR_RRHH' AND sede_id = ? AND activo = true",
            sedeId
        );
        for (Map<String, Object> sup : supervisores) {
            notificacionRepository.save(Notificacion.builder()
                .destinatarioUuid((String) sup.get("id"))
                .tipo("SOLICITUD_VACACIONES")
                .titulo("Solicitud de vacaciones pendiente")
                .mensaje(nombreTrabajador + " solicita vacaciones del " + fechaInicio + " al " + fechaFin)
                .referenciaId(solicitudId)
                .build());
        }
    }

    @Transactional
    public void notificarCambioEstadoVacacion(String destinatarioUuid, Long solicitudId, String nuevoEstado, String aprobadoPor) {
        String titulo = nuevoEstado.equals("APROBADO") ? "Vacaciones aprobadas" :
                        nuevoEstado.equals("RECHAZADO") ? "Vacaciones rechazadas" : "Vacaciones actualizadas";
        String mensaje = "Tu solicitud #" + solicitudId + " fue " + nuevoEstado.toLowerCase() + " por " + aprobadoPor;

        notificacionRepository.save(Notificacion.builder()
            .destinatarioUuid(destinatarioUuid)
            .tipo("CAMBIO_ESTADO_VACACION")
            .titulo(titulo)
            .mensaje(mensaje)
            .referenciaId(solicitudId)
            .build());
    }

    @Transactional
    public void notificarPlanillaCerrada(Long empresaId, String periodo, String cerradoPor) {
        List<Map<String, Object>> contadores = jdbc.queryForList(
            "SELECT id::text FROM usuarios_perfil WHERE rol IN ('CONTADOR','GERENTE_GENERAL') AND empresa_id = ? AND activo = true",
            empresaId
        );
        for (Map<String, Object> c : contadores) {
            notificacionRepository.save(Notificacion.builder()
                .destinatarioUuid((String) c.get("id"))
                .tipo("PLANILLA_CERRADA")
                .titulo("Planilla cerrada: " + periodo)
                .mensaje("La planilla del periodo " + periodo + " fue cerrada por " + cerradoPor)
                .build());
        }
    }

    @Transactional(readOnly = true)
    public List<Notificacion> obtenerNotificaciones(String uuid) {
        return notificacionRepository.findByDestinatarioUuidOrderByCreatedAtDesc(uuid);
    }

    @Transactional(readOnly = true)
    public long contarNoLeidas(String uuid) {
        return notificacionRepository.countByDestinatarioUuidAndLeidaFalse(uuid);
    }

    @Transactional
    public void marcarLeida(Long id) {
        notificacionRepository.findById(id).ifPresent(n -> {
            n.setLeida(true);
            notificacionRepository.save(n);
        });
    }

    @Transactional
    public void marcarTodasLeidas(String uuid) {
        List<Notificacion> pendientes = notificacionRepository.findByDestinatarioUuidAndLeidaFalse(uuid);
        pendientes.forEach(n -> n.setLeida(true));
        notificacionRepository.saveAll(pendientes);
    }
}
