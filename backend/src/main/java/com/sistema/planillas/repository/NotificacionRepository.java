package com.sistema.planillas.repository;

import com.sistema.planillas.entity.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    List<Notificacion> findByDestinatarioUuidOrderByCreatedAtDesc(String destinatarioUuid);
    List<Notificacion> findByDestinatarioUuidAndLeidaFalse(String destinatarioUuid);
    long countByDestinatarioUuidAndLeidaFalse(String destinatarioUuid);
}
